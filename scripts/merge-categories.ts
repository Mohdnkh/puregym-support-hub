import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Merge/rename categories so the database matches the clean canonical names
// used in CATEGORY_ORDER. No scripts are deleted — only the category label moves.
const renames: Array<[string, string]> = [
  ["App / Login / Password / Registration Issue", "App / Login / Password"],
  ["Membership & Packages and gym trails", "Membership & Packages"],
];

async function main() {
  for (const [from, to] of renames) {
    const res = await prisma.script.updateMany({ where: { category: from }, data: { category: to } });
    console.log(`"${from}" -> "${to}": ${res.count} moved`);
  }

  const groups = await prisma.script.groupBy({ by: ["category"], _count: true, orderBy: { category: "asc" } });
  console.log("--- categories now ---");
  groups.forEach((g) => console.log(String(g._count).padStart(4) + "  |  " + g.category));
  console.log("TOTAL CATEGORIES: " + groups.length);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
