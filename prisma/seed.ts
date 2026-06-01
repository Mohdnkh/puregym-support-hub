import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { seedScripts } from "../lib/seed-data";

const prisma = new PrismaClient();

const defaultAiKnowledgeItem = [
  {
    title: "KSA official terms and cancellation basics",
    country: "KSA",
    language: "BOTH",
    kind: "Official Source",
    sourceUrl: "https://ksa.puregymarabia.com/en-gb/terms-conditions/",
    content: "KSA official terms: monthly memberships can be cancelled by contacting Member Services at least 2 days before the next deduction date; membership remains active until the day before next payment then terminates. Fixed-term/PIF memberships cannot be cancelled and can only be frozen according to freeze terms. Failed monthly payment temporarily suspends the membership; PureGym retries after 10 days and if the second attempt fails the membership is automatically cancelled. Hyper Bill payment links may be used for one-off services, upgrades/freezes, failed payments, and ad hoc requests."
  },
  {
    title: "UAE official terms and freeze basics",
    country: "UAE",
    language: "BOTH",
    kind: "Official Source",
    sourceUrl: "https://uae.puregymarabia.com/terms-conditions/",
    content: "UAE official terms: freeze fee is 39 AED. Unless the member is PLUS, freeze can be for a maximum of 3 months, after which membership automatically unfreezes and returns to monthly rate. Freeze starts from payment date and must be actioned at least 2 working days before payment date. Monthly cancellation must be requested at least 2 days before next deduction. Fixed-term/paid-in-full memberships are not refundable and cannot be cancelled."
  },
  {
    title: "Gym rules dual language summary",
    country: "ALL",
    language: "BOTH",
    kind: "Gym Rules",
    sourceUrl: "GymRules A4-DUAL-REV1.pdf",
    content: "Members must use their own QR/PIN/access device and must not share it. QR/PIN misuse may be monitored and can result in charges, cancellation, or denied access. Minimum age is 16+. Smoking/e-cigarettes are prohibited. Suitable sports attire and shoes are required. Members must wipe equipment, return weights, avoid dropping/slamming weights, avoid aggressive behavior, not bring external equipment, and follow class cancellation/on-time rules."
  }
] as const;


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

  // Safe script seed: update/create seed scripts without deleting user data.
  // This preserves favorites, script order rows, user-added scripts, chat history, and profile data.
  let seededScripts = 0;
  for (const script of seedScripts) {
    await prisma.script.upsert({
      where: { key: script.key },
      update: {
        title: script.title,
        category: script.category,
        country: script.country,
        language: script.language,
        body: script.body,
        source: script.source || "seed",
        active: true,
        sortOrder: script.sortOrder || 0
      },
      create: {
        key: script.key,
        title: script.title,
        category: script.category,
        country: script.country,
        language: script.language,
        body: script.body,
        source: script.source || "seed",
        active: true,
        sortOrder: script.sortOrder || 0
      }
    });
    seededScripts += 1;
  }

  console.log(`Seeded/updated ${seededScripts} scripts without deleting existing data.`);


  for (const item of defaultAiKnowledgeItem) {
    await prisma.aiKnowledgeItem.upsert({
      where: { id: `seed-${item.country.toLowerCase()}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}` },
      update: {
        title: item.title,
        content: item.content,
        country: item.country as any,
        language: item.language,
        kind: item.kind,
        sourceUrl: item.sourceUrl,
        active: true
      },
      create: {
        id: `seed-${item.country.toLowerCase()}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
        title: item.title,
        content: item.content,
        country: item.country as any,
        language: item.language,
        kind: item.kind,
        sourceUrl: item.sourceUrl,
        active: true
      }
    });
  }

  await prisma.aiGlobalMemory.upsert({
    where: { key: "global" },
    update: {},
    create: { key: "global", summary: "" }
  });

  console.log(`AI trainer ready with ${defaultAiKnowledgeItem.length} default official knowledge items.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
