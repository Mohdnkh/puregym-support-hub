import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Country = "KSA" | "UAE" | "ALL";
type Lang = "AR" | "EN";

type QuickSeed = {
  key: string;
  title: string;
  country: Country;
  language: Lang;
  body: string;
  sortOrder: number;
};

const quickScripts: QuickSeed[] = [
  {
    key: "quick-welcome-ksa-ar",
    title: "ترحيب عام",
    country: "KSA",
    language: "AR",
    body: "💚 أهلاً وسهلاً، معك محمد من بيورجيم، كيف أقدر أساعدك؟",
    sortOrder: 10,
  },
  {
    key: "quick-welcome-uae-ar",
    title: "ترحيب عام",
    country: "UAE",
    language: "AR",
    body: "💙 أهلاً وسهلاً، معك محمد من بيورجيم، كيف أقدر أساعدك؟",
    sortOrder: 20,
  },
  {
    key: "quick-salam-ksa-ar",
    title: "رد السلام",
    country: "KSA",
    language: "AR",
    body: "💚 وعليكم السلام ورحمة الله وبركاته",
    sortOrder: 30,
  },
  {
    key: "quick-salam-uae-ar",
    title: "رد السلام",
    country: "UAE",
    language: "AR",
    body: "💙 وعليكم السلام ورحمة الله وبركاته",
    sortOrder: 40,
  },
  {
    key: "quick-welcome-ksa-en",
    title: "General welcome",
    country: "KSA",
    language: "EN",
    body: "💚 Hello, this is Mohammed from PureGym. How can I assist you?",
    sortOrder: 50,
  },
  {
    key: "quick-welcome-uae-en",
    title: "General welcome",
    country: "UAE",
    language: "EN",
    body: "💙 Hello, this is Mohammed from PureGym. How can I assist you?",
    sortOrder: 60,
  },
  {
    key: "quick-rating-ksa-ar",
    title: "الخدمة والتقييم",
    country: "KSA",
    language: "AR",
    body: "💚 سعدنا بخدمتك، شكرًا لتواصلك معنا 🙏 راح أترك لك رابط التقييم 🌸",
    sortOrder: 70,
  },
  {
    key: "quick-rating-uae-ar",
    title: "الخدمة والتقييم",
    country: "UAE",
    language: "AR",
    body: "💙 سعدنا بخدمتك، شكرًا لتواصلك معنا 🙏 راح أترك لك رابط التقييم 🌸",
    sortOrder: 80,
  },
  {
    key: "quick-rating-ksa-en",
    title: "Service closing and feedback",
    country: "KSA",
    language: "EN",
    body: "💚 It was a pleasure assisting you 🙏 We appreciate your feedback 🌸",
    sortOrder: 90,
  },
  {
    key: "quick-rating-uae-en",
    title: "Service closing and feedback",
    country: "UAE",
    language: "EN",
    body: "💙 It was a pleasure assisting you 🙏 We appreciate your feedback 🌸",
    sortOrder: 100,
  },
  {
    key: "quick-general-data-ksa-ar",
    title: "طلب بيانات عامة",
    country: "KSA",
    language: "AR",
    body: "💚 يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال المرتبط بعضويتك لنتمكن من خدمتك بشكل أفضل 🙏",
    sortOrder: 110,
  },
  {
    key: "quick-general-data-uae-ar",
    title: "طلب بيانات عامة",
    country: "UAE",
    language: "AR",
    body: "💙 يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال المرتبط بعضويتك لنتمكن من خدمتك بشكل أفضل 🙏",
    sortOrder: 120,
  },
  {
    key: "quick-cancellation-data-ksa-ar",
    title: "طلب بيانات الإلغاء",
    country: "KSA",
    language: "AR",
    body: "💚 ولا يهمك، يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال ورقم الهوية والاسم المرتبط بعضويتك لنتمكن من خدمتك بشكل أفضل 🙏",
    sortOrder: 130,
  },
  {
    key: "quick-cancellation-data-uae-ar",
    title: "طلب بيانات الإلغاء",
    country: "UAE",
    language: "AR",
    body: "💙 ولا يهمك، يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال ورقم الهوية والاسم المرتبط بعضويتك لنتمكن من خدمتك بشكل أفضل 🙏",
    sortOrder: 140,
  },
  {
    key: "quick-freeze-data-ar",
    title: "طلب بيانات التجميد",
    country: "ALL",
    language: "AR",
    body: "يرجى تزويدنا بفترة التجميد المطلوبة وتاريخ بدء التجميد.",
    sortOrder: 150,
  },
  {
    key: "quick-general-data-ksa-en",
    title: "Request general membership data",
    country: "KSA",
    language: "EN",
    body: "💚 Kindly provide your email address and phone number linked to your membership so we can assist you better 🙏",
    sortOrder: 160,
  },
  {
    key: "quick-general-data-uae-en",
    title: "Request general membership data",
    country: "UAE",
    language: "EN",
    body: "💙 Kindly provide your email address and phone number linked to your membership so we can assist you better 🙏",
    sortOrder: 170,
  },
  {
    key: "quick-cancellation-data-ksa-en",
    title: "Request cancellation data",
    country: "KSA",
    language: "EN",
    body: "💚 No worries, please provide us with the email address, phone number, ID number, and the name associated with your membership so we can assist you better 🙏",
    sortOrder: 180,
  },
  {
    key: "quick-cancellation-data-uae-en",
    title: "Request cancellation data",
    country: "UAE",
    language: "EN",
    body: "💙 No worries, please provide us with the email address, phone number, ID number, and the name associated with your membership so we can assist you better 🙏",
    sortOrder: 190,
  },
  {
    key: "quick-freeze-data-en",
    title: "Request freeze details",
    country: "ALL",
    language: "EN",
    body: "Please provide us with the requested freeze period and the freeze start date.",
    sortOrder: 200,
  },
  {
    key: "quick-moment-ksa-ar",
    title: "لحظات من فضلك",
    country: "KSA",
    language: "AR",
    body: "💚 ولا يهمك، لحظات من فضلك 🙏",
    sortOrder: 210,
  },
  {
    key: "quick-moment-uae-ar",
    title: "لحظات من فضلك",
    country: "UAE",
    language: "AR",
    body: "💙 ولا يهمك، لحظات من فضلك 🙏",
    sortOrder: 220,
  },
  {
    key: "quick-moment-ksa-en",
    title: "Allow me a moment",
    country: "KSA",
    language: "EN",
    body: "💚 No worries, please allow me a moment 🙏",
    sortOrder: 230,
  },
  {
    key: "quick-moment-uae-en",
    title: "Allow me a moment",
    country: "UAE",
    language: "EN",
    body: "💙 No worries, please allow me a moment 🙏",
    sortOrder: 240,
  },
  {
    key: "quick-anything-else-ksa-ar",
    title: "استفسار آخر",
    country: "KSA",
    language: "AR",
    body: "💚 هل يوجد أي خدمة أو استفسار آخر أقدر أساعدك فيه؟ 🙏",
    sortOrder: 250,
  },
  {
    key: "quick-anything-else-uae-ar",
    title: "استفسار آخر",
    country: "UAE",
    language: "AR",
    body: "💙 هل يوجد أي خدمة أو استفسار آخر أقدر أساعدك فيه؟ 🙏",
    sortOrder: 260,
  },
  {
    key: "quick-anything-else-ksa-en",
    title: "Anything else",
    country: "KSA",
    language: "EN",
    body: "💚 Is there anything else I can assist you with? 🙏",
    sortOrder: 270,
  },
  {
    key: "quick-anything-else-uae-en",
    title: "Anything else",
    country: "UAE",
    language: "EN",
    body: "💙 Is there anything else I can assist you with? 🙏",
    sortOrder: 280,
  },
  {
    key: "quick-still-there-ksa-ar",
    title: "هل ما زلت موجود؟",
    country: "KSA",
    language: "AR",
    body: "💚 هل ما زلت {موجود عزيزي|موجودة عزيزتي}؟ أنا هنا لأي استفسار 🙏",
    sortOrder: 290,
  },
  {
    key: "quick-still-there-uae-ar",
    title: "هل ما زلت موجود؟",
    country: "UAE",
    language: "AR",
    body: "💙 هل ما زلت {موجود عزيزي|موجودة عزيزتي}؟ أنا هنا لأي استفسار 🙏",
    sortOrder: 300,
  },
  {
    key: "quick-still-there-ksa-en",
    title: "Are you still with us?",
    country: "KSA",
    language: "EN",
    body: "💚 Are you still with us? I’m here for any questions 🙏",
    sortOrder: 310,
  },
  {
    key: "quick-still-there-uae-en",
    title: "Are you still with us?",
    country: "UAE",
    language: "EN",
    body: "💙 Are you still with us? I’m here for any questions 🙏",
    sortOrder: 320,
  },
  {
    key: "quick-busy-close-ksa-ar",
    title: "إغلاق بسبب الانشغال",
    country: "KSA",
    language: "AR",
    body: "💚 يبدو أنك {مشغول، سيتم إنهاء المحادثة حالياً وتقدر ترجع لنا|مشغولة، سيتم إنهاء المحادثة حالياً وتقدري ترجعي لنا} بأي وقت 🙏",
    sortOrder: 330,
  },
  {
    key: "quick-busy-close-uae-ar",
    title: "إغلاق بسبب الانشغال",
    country: "UAE",
    language: "AR",
    body: "💙 يبدو أنك {مشغول، سيتم إنهاء المحادثة حالياً وتقدر ترجع لنا|مشغولة، سيتم إنهاء المحادثة حالياً وتقدري ترجعي لنا} بأي وقت 🙏",
    sortOrder: 340,
  },
  {
    key: "quick-busy-close-ksa-en",
    title: "Busy - close chat",
    country: "KSA",
    language: "EN",
    body: "💚 It seems you’re busy, the chat will be closed for now and you can reach out to us anytime 🙏",
    sortOrder: 350,
  },
  {
    key: "quick-busy-close-uae-en",
    title: "Busy - close chat",
    country: "UAE",
    language: "EN",
    body: "💙 It seems you’re busy, the chat will be closed for now and you can reach out to us anytime 🙏",
    sortOrder: 360,
  },
  {
    key: "quick-no-reply-warning-ksa-ar",
    title: "تنبيه قبل الإغلاق",
    country: "KSA",
    language: "AR",
    body: "💚 إذا ما جانا رد، سيتم إنهاء المحادثة {وتقدر ترجع|وتقدري ترجعي} لنا بأي وقت 🙏",
    sortOrder: 370,
  },
  {
    key: "quick-no-reply-warning-uae-ar",
    title: "تنبيه قبل الإغلاق",
    country: "UAE",
    language: "AR",
    body: "💙 إذا ما جانا رد، سيتم إنهاء المحادثة {وتقدر ترجع|وتقدري ترجعي} لنا بأي وقت 🙏",
    sortOrder: 380,
  },
  {
    key: "quick-no-reply-warning-ksa-en",
    title: "No reply warning",
    country: "KSA",
    language: "EN",
    body: "💚 If we don’t hear back from you, the chat will be closed. You can reach out anytime 🙏",
    sortOrder: 390,
  },
  {
    key: "quick-no-reply-warning-uae-en",
    title: "No reply warning",
    country: "UAE",
    language: "EN",
    body: "💙 If we don’t hear back from you, the chat will be closed. You can reach out anytime 🙏",
    sortOrder: 400,
  },
  {
    key: "quick-final-no-response-ksa-ar",
    title: "إنهاء بسبب عدم الرد",
    country: "KSA",
    language: "AR",
    body: "💚 سيتم إنهاء المحادثة بسبب عدم وجود رد، نشكرك على تواصلك معنا، ونسعد بتقييمك لتجربتك 🌸",
    sortOrder: 410,
  },
  {
    key: "quick-final-no-response-uae-ar",
    title: "إنهاء بسبب عدم الرد",
    country: "UAE",
    language: "AR",
    body: "💙 سيتم إنهاء المحادثة بسبب عدم وجود رد، نشكرك على تواصلك معنا، ونسعد بتقييمك لتجربتك 🌸",
    sortOrder: 420,
  },
  {
    key: "quick-final-no-response-ksa-en",
    title: "Final no-response closing",
    country: "KSA",
    language: "EN",
    body: "💚 The chat will be closed due to no response.\nThank you for contacting us, we’d appreciate your feedback 🌸",
    sortOrder: 430,
  },
  {
    key: "quick-final-no-response-uae-en",
    title: "Final no-response closing",
    country: "UAE",
    language: "EN",
    body: "💙 The chat will be closed due to no response.\nThank you for contacting us, we’d appreciate your feedback 🌸",
    sortOrder: 440,
  },
];

export async function syncStandardQuickScripts() {
  await prisma.script.deleteMany({
    where: { category: "Quick Scripts", source: "quick-standard" },
  });

  for (const item of quickScripts) {
    await prisma.script.upsert({
      where: { key: item.key },
      update: {
        title: item.title,
        category: "Quick Scripts",
        country: item.country,
        language: item.language,
        body: item.body,
        source: "quick-standard",
        active: true,
        sortOrder: item.sortOrder,
      },
      create: {
        key: item.key,
        title: item.title,
        category: "Quick Scripts",
        country: item.country,
        language: item.language,
        body: item.body,
        source: "quick-standard",
        active: true,
        sortOrder: item.sortOrder,
      },
    });
  }

  return quickScripts.length;
}

async function main() {
  const count = await syncStandardQuickScripts();
  console.log(`Synced ${count} standard quick scripts. Admin-created quick scripts were left untouched.`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => prisma.$disconnect());
}
