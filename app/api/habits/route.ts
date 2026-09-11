import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toISODate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  const habits = await prisma.habit.findMany({
    include: { category: true, logs: true },
    orderBy: { createdAt: "asc" },
  });
  const out = habits.map((h) => ({
    ...h,
    createdAt: h.createdAt.toISOString(),
    logs: h.logs.map((l) => ({
      ...l,
      date: toISODate(l.date),
    })),
  }));
  return NextResponse.json(out);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      categoryId,
      icon,
      color,
      frequencyType = "DAILY",
      customDays,
      targetValue = 1,
      unit = "",
      reminderTime,
      monthlyMissesAllowed = 0,
      isArchived = false,
    } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Выберите категорию" }, { status: 400 });
    }
    if (!["DAILY", "WEEKLY", "CUSTOM_DAYS"].includes(frequencyType)) {
      return NextResponse.json(
        { error: "Недопустимая периодичность" },
        { status: 400 },
      );
    }

    const habit = await prisma.habit.create({
      data: {
        name: name.trim(),
        categoryId,
        icon: icon || "Check",
        color: color || "#5C8D89",
        frequencyType,
        customDays:
          frequencyType === "CUSTOM_DAYS" &&
          Array.isArray(customDays) &&
          customDays.length
            ? (customDays as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        targetValue: Math.max(
          1,
          frequencyType === "WEEKLY"
            ? Math.min(7, Number(targetValue) || 1)
            : Number(targetValue) || 1,
        ),
        unit: unit.trim(),
        reminderTime: reminderTime || null,
        monthlyMissesAllowed: Math.max(0, Number(monthlyMissesAllowed) || 0),
        isArchived: Boolean(isArchived),
      },
      include: { category: true, logs: true },
    });

    return NextResponse.json(
      { ...habit, createdAt: habit.createdAt.toISOString(), logs: [] },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Не удалось создать привычку" }, { status: 500 });
  }
}