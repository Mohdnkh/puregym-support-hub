import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Regenerates lib/seed-data.ts from the live database so the project file
// is an exact backup of every script currently on the site. Direction is
// strictly DB -> file; it never writes to the database.
async function main() {
  const scripts = await prisma.script.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });

  const mapped = scripts.map((s) => ({
    key: s.key,
    title: s.title,
    category: s.category,
    country: s.country,
    language: s.language,
    body: s.body,
    source: s.source,
    sortOrder: s.sortOrder,
    active: s.active,
  }));

  const header = `import type { Country } from "@prisma/client";

export type ScriptLanguage = "AR" | "EN" | "BOTH";

export type SeedScript = {
  key: string;
  title: string;
  category: string;
  country: Country;
  language: ScriptLanguage;
  body: string;
  source?: string;
  sortOrder?: number;
  active?: boolean;
};

// Synced from the current Neon/Admin script library.
// IMPORTANT: prisma/seed.ts only applies this list when SYNC_SEED_SCRIPTS=true,
// so production/Admin edits are not overwritten by accident.
// Regenerate with: npm run db:export
export const seedScripts: SeedScript[] = `;

  const fileContents = header + JSON.stringify(mapped, null, 2) + ";\n";
  const target = join(process.cwd(), "lib", "seed-data.ts");
  writeFileSync(target, fileContents, "utf8");

  console.log(`Wrote ${mapped.length} scripts to lib/seed-data.ts`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
