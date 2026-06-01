import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { seedScripts } from "../lib/seed-data";
import { DEFAULT_AI_KNOWLEDGE_ITEMS } from "../lib/ai";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        role: "ADMIN",
        nameAr: process.env.ADMIN_NAME_AR || "Admin",
        nameEn: process.env.ADMIN_NAME_EN || "Admin",
        emailVerifiedAt: new Date()
      },
      create: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        nameAr: process.env.ADMIN_NAME_AR || "Admin",
        nameEn: process.env.ADMIN_NAME_EN || "Admin",
        role: "ADMIN",
        emailVerifiedAt: new Date()
      }
    });

    console.log(`Admin ready: ${adminEmail}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set. Skipping admin user.");
  }

  // Reset scripts only. Users, accounts, and verification tokens are not touched.
  await prisma.script.deleteMany({});

  await prisma.script.createMany({
    data: seedScripts.map((script) => ({
      key: script.key,
      title: script.title,
      category: script.category,
      country: script.country,
      language: script.language,
      body: script.body,
      source: script.source || "seed",
      active: true
    })),
    skipDuplicates: true
  });

  console.log(`Deleted old scripts and seeded ${seedScripts.length} clean scripts.`);

  for (const item of DEFAULT_AI_KNOWLEDGE_ITEMS) {
    await prisma.aiKnowledgeItem.upsert({
      where: { id: `${item.sourceType}-${item.country}-${item.language}-${item.title}`.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120) },
      update: {
        title: item.title,
        body: item.body,
        country: item.country,
        language: item.language,
        sourceType: item.sourceType,
        sourceUrl: item.sourceUrl || null,
        active: true
      },
      create: {
        id: `${item.sourceType}-${item.country}-${item.language}-${item.title}`.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120),
        title: item.title,
        body: item.body,
        country: item.country,
        language: item.language,
        sourceType: item.sourceType,
        sourceUrl: item.sourceUrl || null,
        active: true
      }
    });
  }

  console.log(`AI knowledge ready: ${DEFAULT_AI_KNOWLEDGE_ITEMS.length} default items.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
