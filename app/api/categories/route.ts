import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, icon, color, isDefault = false } = body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Название категории обязательно" },
        { status: 400 },
      );
    }
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        icon: icon || "Tag",
        color: color || "#5C8D89",
        isDefault: Boolean(isDefault),
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Не удалось создать категорию" }, { status: 500 });
  }
}