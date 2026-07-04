import { prisma } from "../lib/db";

function normalize(value: string) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function comparableKey(item: { title: string; country: string; language: string; body: string }) {
  return [normalize(item.title), item.country, item.language, normalize(item.body)].join("||");
}

async function main() {
  const cleanup = process.argv.includes("--cleanup");

  const legacy = await prisma.userQuickScript.findMany({
    select: {
      id: true,
      userId: true,
      title: true,
      country: true,
      language: true,
      body: true,
      active: true,
      sortOrder: true,
      updatedAt: true,
    },
    orderBy: [{ userId: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  const master = await prisma.script.findMany({
    where: { category: "Quick Scripts" },
    select: { title: true, country: true, language: true, body: true },
  });

  const masterKeys = new Set(master.map(comparableKey));
  const duplicateRows = legacy.filter((item) => masterKeys.has(comparableKey(item)));
  const customRows = legacy.filter((item) => !masterKeys.has(comparableKey(item)));
  const userCount = new Set(legacy.map((item) => item.userId)).size;

  const report = {
    legacyCount: legacy.length,
    userCount,
    masterCount: master.length,
    duplicateCount: duplicateRows.length,
    customCount: customRows.length,
    cleanupRequested: cleanup,
    customSamples: customRows.slice(0, 10).map((item) => ({
      title: item.title,
      country: item.country,
      language: item.language,
      active: item.active,
      sortOrder: item.sortOrder,
      updatedAt: item.updatedAt,
    })),
  };

  console.log(JSON.stringify(report, null, 2));

  if (!cleanup) return;

  if (customRows.length > 0) {
    throw new Error(
      `Cleanup refused: ${customRows.length} UserQuickScript row(s) do not match the shared Quick Scripts master.`,
    );
  }

  const deleted = await prisma.userQuickScript.deleteMany({});
  console.log(`Deleted ${deleted.count} legacy UserQuickScript row(s).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
