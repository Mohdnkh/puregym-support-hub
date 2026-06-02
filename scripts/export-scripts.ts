import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const scripts = await prisma.script.findMany({
    orderBy: [
      { category: "asc" },
      { sortOrder: "asc" },
      { title: "asc" }
    ]
  });

  const cleanScripts = scripts.map((script) => ({
    key: script.key,
    title: script.title,
    category: script.category,
    country: script.country,
    language: script.language,
    body: script.body,
    source: script.source,
    active: script.active,
    sortOrder: script.sortOrder
  }));

  fs.mkdirSync("exports", { recursive: true });

  fs.writeFileSync(
    path.join("exports", "current-scripts-from-neon.json"),
    JSON.stringify(cleanScripts, null, 2),
    "utf8"
  );

  const tsContent = `import type { Country } from "@prisma/client";

export type ScriptLanguage = "AR" | "EN" | "BOTH";

export type SeedScript = {
  key: string;
  title: string;
  category: string;
  country: Country;
  language: ScriptLanguage | string;
  body: string;
  source?: string;
  active?: boolean;
  sortOrder?: number;
};

export const seedScripts: SeedScript[] = ${JSON.stringify(cleanScripts, null, 2)} as SeedScript[];
`;

  fs.writeFileSync(
    path.join("exports", "seed-data-from-neon.ts"),
    tsContent,
    "utf8"
  );

  console.log(`Exported ${cleanScripts.length} scripts from Neon.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });