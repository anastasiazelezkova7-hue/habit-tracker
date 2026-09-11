import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseISODate } from "@/lib/dates";

export const dynamic = "force-dynamic";

function parseDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return parseISODate(value);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { habitId, date, isCompleted = true, value = 1, remove = false } =
      body || {};

    if (!habitId) {
      return NextResponse.json({ error: "habitId обязателен" }, { status: 400 });
    }
    const d = parseDateInput(String(date));
    if (!d) {
      return NextResponse.json({ error: "Некорректная дата" }, { status: 400 });
    }

    const habit = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) {
      return NextResponse.json({ error: "Привычка не найдена" }, { status: 404 });
    }

    if (remove || !isCompleted) {
      const existing = await prisma.habitLog.findUnique({
        where: { habitId_date: { habitId, date: d } },
      });
      if (existing) await prisma.habitLog.delete({ where: { id: existing.id } });
      return NextResponse.json({ log: null, removed: true });
    }

    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId, date: d } },
      update: { isCompleted: true, value: Math.max(1, Number(value) || 1) },
      create: {
        habitId,
        date: d,
        isCompleted: true,
        value: Math.max(1, Number(value) || 1),
      },
    });

    return NextResponse.json(
      {
        log: { ...log, date: date },
        removed: false,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Не удалось сохранить отметку" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { habitId, date } = body || {};
    if (!habitId || !date) {
      return NextResponse.json({ error: "habitId и date обязательны" }, { status: 400 });
    }
    const d = parseDateInput(String(date));
    if (!d) {
      return NextResponse.json({ error: "Некорректная дата" }, { status: 400 });
    }
    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date: d } },
    });
    if (existing) await prisma.habitLog.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Не удалось удалить отметку" }, { status: 500 });
  }
}