import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "Здоровье", icon: "HeartPulse", color: "#F4A261" },
  { name: "Работа", icon: "Briefcase", color: "#5C8D89" },
  { name: "Образование", icon: "GraduationCap", color: "#7A9E9F" },
  { name: "Спорт", icon: "Dumbbell", color: "#E76F51" },
  { name: "Питание", icon: "Apple", color: "#8AB17D" },
  { name: "Дом", icon: "House", color: "#E9C46A" },
  { name: "Вредные привычки", icon: "CigaretteOff", color: "#C75B5B" },
  { name: "Творчество", icon: "Palette", color: "#9B8CBF" },
  { name: "Сон", icon: "Moon", color: "#5C8D89" },
];

async function main() {
  const count = await prisma.category.count();
  if (count === 0) {
    await prisma.category.createMany({
      data: defaultCategories.map((c) => ({ ...c, isDefault: true })),
    });
    console.log(`Seeded ${defaultCategories.length} default categories`);
  } else {
    console.log("Categories already exist, skipping seed");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });