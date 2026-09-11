import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toISODate } from "@/lib/dates";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const habit = await prisma.habit.findUnique({
    where: { id },
    include: { category: true, logs: true },
  });
  if (!habit) {
    return NextResponse.json({ error: "Привычка не найдена" }, { status: 404 });
  }
  return NextResponse.json({
    ...habit,
    createdAt: habit.createdAt.toISOString(),
    logs: habit.logs.map((l) => ({ ...l, date: toISODate(l.date) })),
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.icon !== undefined) data.icon = body.icon;
    if (body.color !== undefined) data.color = body.color;
    if (body.frequencyType !== undefined) {
      if (!["DAILY", "WEEKLY", "CUSTOM_DAYS"].includes(body.frequencyType)) {
        return NextResponse.json(
          { error: "Недопустимая периодичность" },
          { status: 400 },
        );
      }
      data.frequencyType = body.frequencyType;
    }
    if (body.customDays !== undefined) {
      data.customDays =
        body.frequencyType === "CUSTOM_DAYS" && Array.isArray(body.customDays)
          ? (body.customDays as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull;
    }
    if (body.targetValue !== undefined) {
      data.targetValue = Math.max(1, Number(body.targetValue) || 1);
    }
    if (body.unit !== undefined) data.unit = String(body.unit).trim();
    if (body.reminderTime !== undefined)
      data.reminderTime = body.reminderTime || null;
    if (body.monthlyMissesAllowed !== undefined)
      data.monthlyMissesAllowed = Math.max(0, Number(body.monthlyMissesAllowed) || 0);
    if (body.isArchived !== undefined) data.isArchived = Boolean(body.isArchived);

    const habit = await prisma.habit.update({
      where: { id },
      data,
      include: { category: true, logs: true },
    });

    return NextResponse.json({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      logs: habit.logs.map((l) => ({ ...l, date: toISODate(l.date) })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Привычка не найдена" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await prisma.habit.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Привычка не найдена" }, { status: 404 });
  }
}