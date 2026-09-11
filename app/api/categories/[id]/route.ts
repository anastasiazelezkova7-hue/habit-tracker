import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.icon ? { icon: body.icon } : {}),
        ...(body.color ? { color: body.color } : {}),
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const habitCount = await prisma.habit.count({ where: { categoryId: id } });
    if (habitCount > 0) {
      return NextResponse.json(
        {
          error: `Нельзя удалить: в категории есть привычки (${habitCount}). Перенесите их в другую категорию.`,
        },
        { status: 400 },
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
  }
}