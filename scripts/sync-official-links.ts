import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type LinkSeed = {
  key: string;
  title: string;
  country: "KSA" | "UAE";
  language: "AR" | "EN";
  body: string;
  sortOrder: number;
};

const appLinks = [
  "App landing page: https://get.myfitapp.de/a/BAPP?p=6?pv=1",
  "Google Play: https://play.google.com/store/apps/details?id=com.innovatise.puregymarabia",
  "App Store: https://apps.apple.com/us/app/puregym-arabia/id6779495749",
].join("\n");

const links: LinkSeed[] = [
  {
    key: "links-official-ksa-ar",
    title: "روابط السعودية الرسمية",
    country: "KSA",
    language: "AR",
    sortOrder: 10,
    body: `💚 روابط السعودية الرسمية:

الانضمام:
https://puregym-arabia.exerp.site/join/center?country=SA&lang=arabic

تسجيل الدخول:
https://puregym-arabia.exerp.site/login?lang=arabic

الصالات الرياضية:
https://ksa.puregymarabia.com/gyms

خيارات العضوية:
https://ksa.puregymarabia.com/membership-options

تطبيق بيورجيم:
https://ksa.puregymarabia.com/puregym-app

الحصص التدريبية:
https://ksa.puregymarabia.com/training-classes

دليل التمارين:
https://ksa.puregymarabia.com/workout-guide

مركز المساعدة:
https://ksa.puregymarabia.com/help-contact

الشروط والأحكام:
https://ksa.puregymarabia.com/terms-conditions

${appLinks}`,
  },
  {
    key: "links-official-ksa-en",
    title: "Official KSA links",
    country: "KSA",
    language: "EN",
    sortOrder: 20,
    body: `💚 Official KSA links:

Join:
https://puregym-arabia.exerp.site/join/center?country=SA&lang=english

Log in:
https://puregym-arabia.exerp.site/login?lang=english

Find a Gym:
https://ksa.puregymarabia.com/en-gb/gyms

Membership Options:
https://ksa.puregymarabia.com/en-gb/membership-options

PureGym App:
https://ksa.puregymarabia.com/en-gb/puregym-app

Fitness Classes:
https://ksa.puregymarabia.com/en-gb/fitness-classes

Workout Guide:
https://ksa.puregymarabia.com/en-gb/workout-guide

Help & Contact:
https://ksa.puregymarabia.com/en-gb/help-contact

Terms & Conditions:
https://ksa.puregymarabia.com/en-gb/terms-conditions

${appLinks}`,
  },
  {
    key: "links-official-uae-ar",
    title: "روابط الإمارات الرسمية",
    country: "UAE",
    language: "AR",
    sortOrder: 30,
    body: `💙 روابط الإمارات الرسمية:

الانضمام:
https://puregym-arabia.exerp.site/join/center?country=AE&lang=arabic

تسجيل الدخول:
https://puregym-arabia.exerp.site/login?lang=arabic

الصالات الرياضية:
https://uae.puregymarabia.com/ar-ae/gyms

خيارات العضوية:
https://uae.puregymarabia.com/ar-ae/membership-options

تطبيق بيورجيم:
https://uae.puregymarabia.com/ar-ae/apply-pure-gym

الحصص التدريبية:
https://uae.puregymarabia.com/ar-ae/fitness-classes

دليل التمارين:
https://uae.puregymarabia.com/ar-ae/workout-builder

المساعدة والاتصال:
https://uae.puregymarabia.com/ar-ae/help-contact

الشروط والأحكام:
https://uae.puregymarabia.com/ar-ae/terms-conditions

${appLinks}`,
  },
  {
    key: "links-official-uae-en",
    title: "Official UAE links",
    country: "UAE",
    language: "EN",
    sortOrder: 40,
    body: `💙 Official UAE links:

Join:
https://puregym-arabia.exerp.site/join/center?country=AE&lang=english

Log in:
https://puregym-arabia.exerp.site/login?lang=english

Find a Gym:
https://uae.puregymarabia.com/gyms

Membership Options:
https://uae.puregymarabia.com/membership-options

PureGym App:
https://uae.puregymarabia.com/puregym-app

Fitness Classes:
https://uae.puregymarabia.com/fitness-classes

Workout Guide:
https://uae.puregymarabia.com/workout-guide

Help & Contact:
https://uae.puregymarabia.com/help-contact

Terms & Conditions:
https://uae.puregymarabia.com/terms-conditions

${appLinks}`,
  },
];

export async function syncOfficialLinks() {
  for (const item of links) {
    await prisma.script.upsert({
      where: { key: item.key },
      update: {
        title: item.title,
        category: "Links",
        country: item.country,
        language: item.language,
        body: item.body,
        source: "official-links",
        active: true,
        sortOrder: item.sortOrder,
      },
      create: {
        key: item.key,
        title: item.title,
        category: "Links",
        country: item.country,
        language: item.language,
        body: item.body,
        source: "official-links",
        active: true,
        sortOrder: item.sortOrder,
      },
    });
  }

  return links.length;
}

async function main() {
  const count = await syncOfficialLinks();
  console.log(`Synced ${count} official link scripts. Other Links category scripts were left untouched.`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => prisma.$disconnect());
}
