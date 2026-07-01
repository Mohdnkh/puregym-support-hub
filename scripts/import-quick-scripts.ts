import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Standard conversation Quick Scripts (both languages, both countries via "ALL").
// Arabic bodies use {masculine|feminine} markers resolved by the Male/Female
// toggle in the UI. Employee name uses (اسم الموظف) / (Agent Name) placeholders
// that the app replaces with the logged-in agent's name.
// Allowed emojis only; 🌟 replaced with 🌸 per request.
type QS = { ar: string; en: string; bodyAr: string; bodyEn: string };

const items: QS[] = [
  { ar: "ترحيب عام", en: "General Welcome",
    bodyAr: "أهلاً وسهلاً {فيك|فيكِ}، معك (اسم الموظف) من بيورجيم، كيف أقدر {أساعدك|أساعدكِ} اليوم؟ 💚",
    bodyEn: "Hello, this is (Agent Name) from PureGym. How can I help you today? 💚" },
  { ar: "ترحيب - حياك الله", en: "Welcome (alt)",
    bodyAr: "حياك الله، (اسم الموظف) من بيورجيم معك، وش الخدمة اللي {تحتاجها|تحتاجينها}؟ 🌿",
    bodyEn: "Welcome! This is (Agent Name) from PureGym. What can I do for you? 🌿" },
  { ar: "الرجوع للمحادثة", en: "Back to the chat",
    bodyAr: "رجعت لك! معك (اسم الموظف) من بيورجيم، كيف أقدر {أخدمك|أخدمكِ}؟ 😊",
    bodyEn: "I'm back! This is (Agent Name) from PureGym. How can I help you? 😊" },
  { ar: "ترحيب بالرجوع", en: "Welcome back",
    bodyAr: "ياهلا برجعتك! تبغى نكمل من آخر نقطة وقفنا فيها؟ 👋",
    bodyEn: "Welcome back! Shall we continue from where we left off? 👋" },
  { ar: "بعد حل المشكلة", en: "After resolving",
    bodyAr: "إذا احتجت أي شيء ثاني، أنا دايمًا بالخدمة 💚",
    bodyEn: "If you need anything else, I'm always here to help 💚" },
  { ar: "قبل الختام - شي ثاني؟", en: "Anything else before closing?",
    bodyAr: "يسعدني إني قدرت {أساعدك|أساعدكِ}! فيه شيء ثاني {تبي|تبين} {أساعدك|أساعدكِ} فيه قبل ما نختم؟ 😊",
    bodyEn: "I'm glad I could help! Is there anything else you'd like help with before we finish? 😊" },
  { ar: "قبل إنهاء المحادثة", en: "Before ending the chat",
    bodyAr: "إذا فيه أي شيء ثاني {تحتاجه|تحتاجينه} علمني 💚 أنا هنا عشانك!",
    bodyEn: "If there's anything else you need, let me know 💚 I'm here for you!" },
  { ar: "إرسال المعلومات", en: "Information sent",
    bodyAr: "أرسلت لك كل التفاصيل، وإذا فيه أي شيء ثاني {تحتاجه|تحتاجينه}، علمني 💚",
    bodyEn: "I've sent you all the details. If there's anything else you need, just let me know 💚" },
  { ar: "عدم الرد", en: "No response",
    bodyAr: "{عزيزي|عزيزتي}، يبدو {إنك مشغول|إنكِ مشغولة}، فبنقفل المحادثة، وإذا رجعت واحتجت شيء لا تتردد ترا حنا هنا دايمًا 💚",
    bodyEn: "It seems you're busy, so we'll close the chat. If you come back and need anything, we're always here 💚" },
  { ar: "التقييم قبل الإغلاق", en: "Rating before closing",
    bodyAr: "سعدت بخدمتك اليوم 🌸\nراح أترك لك رابط التقييم لهذه المحادثة، يهمنا نعرف كيف كانت تجربتك معنا 💚",
    bodyEn: "It was a pleasure helping you today 🌸\nI'll share the rating link for this chat — we'd love to know about your experience 💚" },
  { ar: "تنبيه أول (خمول)", en: "First idle reminder",
    bodyAr: "هل ما {زلت موجود|زلتِ موجودة} {عزيزي|عزيزتي}؟ إذا عندك أي سؤال، أنا موجود 🧏‍♀️",
    bodyEn: "Are you still there? If you have any question, I'm here 🧏‍♀️" },
  { ar: "تنبيه ثاني (قبل الإغلاق)", en: "Second reminder (before closing)",
    bodyAr: "إذا ما جانا رد، سيتم إنهاء المحادثة، وتقدر ترجع لنا بأي وقت 💚",
    bodyEn: "If we don't hear back, the chat will be closed. You can return to us anytime 💚" },
  { ar: "أول انتظار", en: "First hold",
    bodyAr: "شكرًا على صبرك! خليني أتأكد لك من الموضوع، ممكن ياخذ من ٣ إلى ٥ دقايق ⏳ وبرجع لك بأقرب وقت 💚",
    bodyEn: "Thanks for your patience! Let me check this for you — it may take 3 to 5 minutes ⏳ and I'll get back to you shortly 💚" },
  { ar: "تأخير أطول من المتوقع", en: "Longer than expected",
    bodyAr: "لسا أشتغل على الموضوع، ومقدّر صبرك 🙏 باقي شوي وبرجع لك بكل التفاصيل!",
    bodyEn: "I'm still working on it and I appreciate your patience 🙏 Just a little more and I'll be back with all the details!" },
  { ar: "رجعة سريعة بالمعلومات", en: "Back with info",
    bodyAr: "يعطيك العافية على الانتظار! جبت لك المعلومات اللي {تحتاجها|تحتاجينها} ✅ خليني أشرح لك الحين 👇",
    bodyEn: "Thanks for waiting! I've got the information you need ✅ let me explain now 👇" },
  { ar: "تأخير بسيط + اعتذار", en: "Slight delay + apology",
    bodyAr: "أعتذر على التأخير وشكرًا على صبرك 🙏 هذي المعلومات اللي حصلتها لك 💚",
    bodyEn: "Apologies for the delay and thank you for your patience 🙏 here's the information I found for you 💚" },
  { ar: "أحتاج وقت إضافي", en: "Need more time",
    bodyAr: "شكرًا على صبرك! باقي لي شوية وأخلص لك الموضوع ⏳ مقدّر انتظارك وبرجع لك قريب إن شاء الله!",
    bodyEn: "Thanks for your patience! I need a little more time to finish this ⏳ I appreciate your wait and will be back soon!" },
  { ar: "لسا نتابع مع الفريق", en: "Still checking with the team",
    bodyAr: "لسا أتابع مع الفريق عشان أتأكد نعطيك المعلومات الصح، شكرًا لصبرك مرة ثانية، ما راح نطول عليك 💚",
    bodyEn: "I'm still following up with the team to make sure we give you the correct information. Thanks again for your patience — we won't be long 💚" },
  { ar: "ينقصني معلومات", en: "Need more information",
    bodyAr: "ممكن {تزودني|تزودينني} بمعلومات أكثر عشان أقدر {أساعدك|أساعدكِ} بشكل أفضل؟ مثل:\n- الفرع اللي تسأل عنه\n- إيميلك أو رقم جوالك المسجل\n- صورة للخطأ (إذا فيه)\nشكرًا لك 💚",
    bodyEn: "Could you share a bit more so I can help you better? For example:\n- The branch you're asking about\n- Your registered email or mobile number\n- A screenshot of the error (if any)\nThank you 💚" },
  { ar: "تأكيد استفسار", en: "Confirm the request",
    bodyAr: "بس عشان أتأكد، {تقصد|تقصدين} (الخيار الأول) ولا (الخيار الثاني)؟ كذا أقدر {أوجهك|أوجهكِ} بشكل أدق ✅",
    bodyEn: "Just to confirm — do you mean (option one) or (option two)? That way I can guide you more accurately ✅" },
  { ar: "طلب الإيميل ورقم الجوال", en: "Request email & mobile",
    bodyAr: "{يمديك|يمديكِ} {تزودني|تزودينني} بالإيميل ورقم الجوال ورقم الهوية المرتبط باشتراكك معنا، بالإضافة لاسمك المسجل على العضوية، عشان نقدر نشيك على عضويتك ونساعدك بشكل أفضل 😊",
    bodyEn: "Could you share the email, mobile number, and ID linked to your membership, along with the name registered on the membership, so we can check your account and assist you better? 😊" },
  { ar: "تعاطف + اعتذار سريع", en: "Empathy + quick apology",
    bodyAr: "أفهم تمامًا إن هالشيء ممكن يكون مزعج 😔 وإحنا هنا عشان نحلّه بأسرع وقت ممكن 💚",
    bodyEn: "I completely understand this can be frustrating 😔 and we're here to solve it as quickly as possible 💚" },
  { ar: "اعتذار كامل", en: "Full apology",
    bodyAr: "أعتذر لك عن الإزعاج اللي صار 🙏 دايمًا نحرص تكون تجربتك سهلة وسلسة، وشكرًا على صبرك وحنا نشتغل على الحل.",
    bodyEn: "I sincerely apologize for the inconvenience 🙏 we always aim to make your experience smooth and easy. Thank you for your patience while we work on the solution." },
  { ar: "نبرة تطمين", en: "Reassuring tone",
    bodyAr: "{أسمعك|أسمعكِ} {وفاهم|وفاهمة} تمامًا موقفك 💚 خلّنا نحلها لك بالطريقة الصح.",
    bodyEn: "I hear you and completely understand your situation 💚 let's solve this for you the right way." },
  { ar: "استفسار عن العروض", en: "Offers inquiry",
    bodyAr: "حاليًا عندنا عروض مميزة! أي فرع {يناسبك|يناسبكِ}، وهل {أنت عضو جديد|أنتِ عضوة جديدة} أو {راجع|راجعة} لنا؟ 💚",
    bodyEn: "We currently have great offers! Which branch works for you, and are you a new member or returning to us? 💚" },
  { ar: "عضو يسأل عن العروض", en: "Existing member — offers",
    bodyAr: "إذا {أنت عضو|أنتِ عضوة} معنا، تقدر {تشوف|تشوفين} العروض المتاحة من تطبيق بيورجيم تحت قسم «العروض» 💚",
    bodyEn: "If you're already a member, you can see the available offers in the PureGym app under the \"Offers\" section 💚" },
  { ar: "عضو جديد مهتم بالعروض", en: "New member — offers",
    bodyAr: "إذا {جديد|جديدة} علينا، تقدر {تفعّل|تفعّلين} العرض بالتسجيل عن طريق الرابط الترويجي أو من الفرع. علمني الفرع اللي {يناسبك|يناسبكِ} وأدلك خطوة بخطوة 💚",
    bodyEn: "If you're new to us, you can activate the offer by registering through the promo link or at the branch. Tell me the branch that suits you and I'll guide you step by step 💚" },
];

async function main() {
  // Replace the master Quick Scripts set (seed source for every agent).
  await prisma.script.deleteMany({ where: { category: "Quick Scripts" } });

  let sortOrder = 10;
  let count = 0;
  for (const it of items) {
    await prisma.script.create({
      data: { key: `quick-${count}-ar`, title: it.ar, category: "Quick Scripts", country: "ALL", language: "AR", body: it.bodyAr, source: "quick-standard", active: true, sortOrder },
    });
    await prisma.script.create({
      data: { key: `quick-${count}-en`, title: it.en, category: "Quick Scripts", country: "ALL", language: "EN", body: it.bodyEn, source: "quick-standard", active: true, sortOrder },
    });
    sortOrder += 10;
    count += 1;
  }

  // Clear every agent's personal copies so they re-seed from the new master on next load.
  const cleared = await prisma.userQuickScript.deleteMany({});
  console.log(`Quick Scripts master: ${items.length} concepts (${items.length * 2} rows). Cleared ${cleared.count} personal copies for re-seed.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
