import type { Country, ScriptLanguage } from "@prisma/client";

export type SeedScript = {
  key: string;
  title: string;
  category: string;
  country: Country;
  language: ScriptLanguage;
  body: string;
  source?: string;
};

export const seedScripts: SeedScript[] = [
  {
    key: "quick-ksa-welcome-ar",
    title: "ترحيب",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 أهلاً وسهلاً، معك {{employeeName}} من بيورجيم، كيف أقدر أساعدك؟",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-welcome-en",
    title: "Welcome",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Hello, this is {{employeeName}} from PureGym. How can I assist you?",
    source: "quick-clean"
  },
  {
    key: "quick-uae-welcome-ar",
    title: "ترحيب",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 أهلاً وسهلاً، معك {{employeeName}} من بيورجيم، كيف أقدر أساعدك؟",
    source: "quick-clean"
  },
  {
    key: "quick-uae-welcome-en",
    title: "Welcome",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Hello, this is {{employeeName}} from PureGym. How can I assist you?",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-salam-ar",
    title: "رد السلام",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 وعليكم السلام ورحمة الله وبركاته",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-salam-en",
    title: "Salam reply",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Hello and welcome.",
    source: "quick-clean"
  },
  {
    key: "quick-uae-salam-ar",
    title: "رد السلام",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 وعليكم السلام ورحمة الله وبركاته",
    source: "quick-clean"
  },
  {
    key: "quick-uae-salam-en",
    title: "Salam reply",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Hello and welcome.",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-end-ar",
    title: "إنهاء المحادثة",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 سعدنا بخدمتك، شكرًا لتواصلك معنا 🙏\nراح أترك لك رابط التقييم 🌸",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-end-en",
    title: "End chat",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 It was a pleasure assisting you 🙏\nWe appreciate your feedback 🌸",
    source: "quick-clean"
  },
  {
    key: "quick-uae-end-ar",
    title: "إنهاء المحادثة",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 سعدنا بخدمتك، شكرًا لتواصلك معنا 🙏\nراح أترك لك رابط التقييم 🌸",
    source: "quick-clean"
  },
  {
    key: "quick-uae-end-en",
    title: "End chat",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 It was a pleasure assisting you 🙏\nWe appreciate your feedback 🌸",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-member-info-ar",
    title: "طلب بيانات العضوية",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال المرتبط بعضويتك لنتمكن من خدمتك بشكل أفضل 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-member-info-en",
    title: "Request membership details",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Kindly provide your email address and phone number linked to your membership so we can assist you better 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-member-info-ar",
    title: "طلب بيانات العضوية",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال المرتبط بعضويتك لنتمكن من خدمتك بشكل أفضل 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-member-info-en",
    title: "Request membership details",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Kindly provide your email address and phone number linked to your membership so we can assist you better 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-cancel-info-ar",
    title: "طلب بيانات الإلغاء",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 ولا يهمك، يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال ورقم الهوية والاسم المرتبط بعضويتك لنتمكن من خدمتك بشكل أفضل 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-cancel-info-en",
    title: "Cancellation details request",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 No worries, please provide us with the email address, phone number, ID number, and the name associated with your membership so we can assist you better 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-cancel-info-ar",
    title: "طلب بيانات الإلغاء",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 ولا يهمك، يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال ورقم الهوية والاسم المرتبط بعضويتك لنتمكن من خدمتك بشكل أفضل 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-cancel-info-en",
    title: "Cancellation details request",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 No worries, please provide us with the email address, phone number, ID number, and the name associated with your membership so we can assist you better 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-freeze-request-info-ar",
    title: "طلب بيانات التجميد",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 يرجى تزويدنا بفترة التجميد المطلوبة وتاريخ بدء التجميد.",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-freeze-request-info-en",
    title: "Freeze details request",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Please provide us with the requested freeze period and the freeze start date.",
    source: "quick-clean"
  },
  {
    key: "quick-uae-freeze-request-info-ar",
    title: "طلب بيانات التجميد",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 يرجى تزويدنا بفترة التجميد المطلوبة وتاريخ بدء التجميد.",
    source: "quick-clean"
  },
  {
    key: "quick-uae-freeze-request-info-en",
    title: "Freeze details request",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Please provide us with the requested freeze period and the freeze start date.",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-wait-ar",
    title: "لحظات من فضلك",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 ولا يهمك، لحظات من فضلك 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-wait-en",
    title: "Please wait",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 No worries, please allow me a moment 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-wait-ar",
    title: "لحظات من فضلك",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 ولا يهمك، لحظات من فضلك 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-wait-en",
    title: "Please wait",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 No worries, please allow me a moment 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-anything-else-ar",
    title: "هل يوجد استفسار آخر؟",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 هل يوجد أي خدمة أو استفسار آخر أقدر أساعدك فيه؟ 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-anything-else-en",
    title: "Anything else?",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Is there anything else I can assist you with? 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-anything-else-ar",
    title: "هل يوجد استفسار آخر؟",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 هل يوجد أي خدمة أو استفسار آخر أقدر أساعدك فيه؟ 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-anything-else-en",
    title: "Anything else?",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Is there anything else I can assist you with? 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-still-with-us-ar",
    title: "هل ما زلت معنا؟",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 هل ما زلت معنا؟ أنا هنا لأي استفسار 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-still-with-us-en",
    title: "Still with us?",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Are you still with us? I’m here for any questions 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-still-with-us-ar",
    title: "هل ما زلت معنا؟",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 هل ما زلت معنا؟ أنا هنا لأي استفسار 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-still-with-us-en",
    title: "Still with us?",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Are you still with us? I’m here for any questions 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-busy-ar",
    title: "العميل مشغول",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 يبدو أن الوقت غير مناسب حاليًا، سيتم إنهاء المحادثة الآن، ويمكنك الرجوع لنا بأي وقت 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-busy-en",
    title: "Customer busy",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 It seems this may not be a convenient time. The chat will be closed for now, and you can reach out to us anytime 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-busy-ar",
    title: "العميل مشغول",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 يبدو أن الوقت غير مناسب حاليًا، سيتم إنهاء المحادثة الآن، ويمكنك الرجوع لنا بأي وقت 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-busy-en",
    title: "Customer busy",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 It seems this may not be a convenient time. The chat will be closed for now, and you can reach out to us anytime 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-no-reply-warning-ar",
    title: "تنبيه عدم الرد",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 إذا ما جانا رد، سيتم إنهاء المحادثة وتقدر ترجع لنا بأي وقت 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-no-reply-warning-en",
    title: "No response warning",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 If we don’t hear back from you, the chat will be closed. You can reach out anytime 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-no-reply-warning-ar",
    title: "تنبيه عدم الرد",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 إذا ما جانا رد، سيتم إنهاء المحادثة وتقدر ترجع لنا بأي وقت 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-uae-no-reply-warning-en",
    title: "No response warning",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 If we don’t hear back from you, the chat will be closed. You can reach out anytime 🙏",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-close-no-reply-ar",
    title: "إغلاق بسبب عدم الرد",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 سيتم إنهاء المحادثة بسبب عدم وجود رد، نشكرك على تواصلك معنا، ونسعد بتقييمك لتجربتك 🌸",
    source: "quick-clean"
  },
  {
    key: "quick-ksa-close-no-reply-en",
    title: "Close due to no response",
    category: "Quick Scripts",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 The chat will be closed due to no response.\nThank you for contacting us, we’d appreciate your feedback 🌸",
    source: "quick-clean"
  },
  {
    key: "quick-uae-close-no-reply-ar",
    title: "إغلاق بسبب عدم الرد",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 سيتم إنهاء المحادثة بسبب عدم وجود رد، نشكرك على تواصلك معنا، ونسعد بتقييمك لتجربتك 🌸",
    source: "quick-clean"
  },
  {
    key: "quick-uae-close-no-reply-en",
    title: "Close due to no response",
    category: "Quick Scripts",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 The chat will be closed due to no response.\nThank you for contacting us, we’d appreciate your feedback 🌸",
    source: "quick-clean"
  },
  {
    key: "membership-details-confirm-ar",
    title: "تأكيد بيانات العضوية",
    category: "Membership & Packages",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "بعد التحقق من النظام، هذه هي بيانات عضويتك المسجلة لدينا:\n\nالبريد الإلكتروني: example@email.com\nرقم الجوال: 0000000000\nالاسم: [الاسم]\nنوع العضوية: [نوع العضوية]\n\nهل هذه المعلومات صحيحة؟",
    source: "quick-file"
  },
  {
    key: "membership-details-confirm-en",
    title: "Membership details confirmation",
    category: "Membership & Packages",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "After checking the system, here are your membership details:\n\nEmail: example@email.com\nPhone number: 0000000000\nName: [Name]\nMembership type: [Membership Type]\n\nPlease confirm if these details are correct.",
    source: "quick-file"
  },
  {
    key: "cancel-reason-ksa-ar",
    title: "سبب الإلغاء",
    category: "Cancellation & Retention",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 ممكن توضح لنا سبب رغبتك في إلغاء العضوية؟\nملاحظتك تهمنا كثير وبتساعدنا نحسّن خدماتنا ونقدّم تجربة أفضل 🙏",
    source: "quick-file"
  },
  {
    key: "cancel-reason-ksa-en",
    title: "Cancellation reason",
    category: "Cancellation & Retention",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Could you please share the reason for cancelling your membership?\nYour feedback is very important to us and helps us improve our services 🙏",
    source: "quick-file"
  },
  {
    key: "cancel-too-late-ksa-ar",
    title: "لا يمكن الإلغاء الآن",
    category: "Cancellation & Retention",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 نأسف لإبلاغك أنه لا يمكن إلغاء العضوية حاليًا.\nحيث تنص شروط وأحكام العضوية على ضرورة التواصل معنا قبل يومين أو أكثر من تاريخ التجديد، وقد تمت الموافقة عليها أثناء التسجيل.\n\nسيتم محاولة السحب بتاريخ: 00-00-2020 في أواخر ساعات الليل.\nوفي حال فشل عملية الدفع، سيتم تعليق العضوية مؤقتًا.\nوسيتم إعادة المحاولة بعد 10 أيام من تاريخ الدفعة الفائتة.\nوفي حال فشلت المحاولة الثانية، سيتم إلغاء العضوية تلقائيًا 🙏",
    source: "quick-file"
  },
  {
    key: "cancel-too-late-ksa-en",
    title: "Too late to cancel",
    category: "Cancellation & Retention",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 We regret to inform you that the membership cannot be cancelled at this time.\nAccording to the membership terms and conditions, you must contact us at least 2 days before the renewal date, which was agreed upon during registration.\n\nA payment attempt will be made on: 00-00-2020 late at night.\nIf the payment fails, the membership will be temporarily suspended.\nA second attempt will be made after 10 days from the failed payment date.\nIf the second attempt also fails, the membership will be automatically cancelled 🙏",
    source: "quick-file"
  },
  {
    key: "cancel-reason-uae-ar",
    title: "سبب الإلغاء",
    category: "Cancellation & Retention",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 ممكن توضح لنا سبب رغبتك في إلغاء العضوية؟\nملاحظتك تهمنا كثير وبتساعدنا نحسّن خدماتنا ونقدّم تجربة أفضل 🙏",
    source: "quick-file"
  },
  {
    key: "cancel-reason-uae-en",
    title: "Cancellation reason",
    category: "Cancellation & Retention",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Could you please share the reason for cancelling your membership?\nYour feedback is very important to us and helps us improve our services 🙏",
    source: "quick-file"
  },
  {
    key: "cancel-too-late-uae-ar",
    title: "لا يمكن الإلغاء الآن",
    category: "Cancellation & Retention",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 نأسف لإبلاغك أنه لا يمكن إلغاء العضوية حاليًا.\nحيث تنص شروط وأحكام العضوية على ضرورة التواصل معنا قبل يومين أو أكثر من تاريخ التجديد، وقد تمت الموافقة عليها أثناء التسجيل.\n\nسيتم محاولة السحب بتاريخ: 00-00-2020 في أواخر ساعات الليل.\nوفي حال فشل عملية الدفع، سيتم تعليق العضوية مؤقتًا.\nوسيتم إعادة المحاولة بعد 10 أيام من تاريخ الدفعة الفائتة.\nوفي حال فشلت المحاولة الثانية، سيتم إلغاء العضوية تلقائيًا 🙏",
    source: "quick-file"
  },
  {
    key: "cancel-too-late-uae-en",
    title: "Too late to cancel",
    category: "Cancellation & Retention",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 We regret to inform you that the membership cannot be cancelled at this time.\nAccording to the membership terms and conditions, you must contact us at least 2 days before the renewal date, which was agreed upon during registration.\n\nA payment attempt will be made on: 00-00-2020 late at night.\nIf the payment fails, the membership will be temporarily suspended.\nA second attempt will be made after 10 days from the failed payment date.\nIf the second attempt also fails, the membership will be automatically cancelled 🙏",
    source: "quick-file"
  },
  {
    key: "retention-freeze-month-ar",
    title: "عرض تجميد شهر بدل الإلغاء",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "قبل إتمام الإلغاء، نقدر نوفر لك خيار تجميد العضوية لمدة شهر بدل الإلغاء، حتى ترجع تتمرن لما يكون الوقت أنسب لك.\nهل يناسبك هذا الخيار؟",
    source: "manual-retention"
  },
  {
    key: "retention-freeze-month-en",
    title: "Retention - Free freeze month",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Before proceeding with cancellation, we can offer you a one-month membership freeze instead, so you can return when the timing is better for you.\nWould this option work for you?",
    source: "manual-retention"
  },
  {
    key: "retention-transfer-branch-ar",
    title: "نقل العضوية لفرع آخر بدل الإلغاء",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "إذا سبب الإلغاء هو تغيير السكن أو صعوبة الوصول للفرع الحالي، نقدر نساعدك بنقل العضوية إلى فرع آخر مناسب بدل الإلغاء.\nهل ترغب أن نتحقق لك من الفرع المناسب؟",
    source: "manual-retention"
  },
  {
    key: "retention-transfer-branch-en",
    title: "Retention - Branch transfer",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "If the cancellation reason is a change of location or difficulty reaching your current gym, we can help transfer your membership to another suitable branch instead of cancellation.\nWould you like us to check the suitable branch?",
    source: "manual-retention"
  },
  {
    key: "retention-upgrade-plus-ar",
    title: "ترقية العضوية إلى Plus بدل الإلغاء",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "إذا كنت تحتاج مرونة أكثر، ممكن تكون ترقية العضوية إلى Plus خيار أفضل بدل الإلغاء، لأنها تمنحك مزايا أكثر حسب نوع العضوية مثل دخول فروع إضافية وBring a Friend ومزايا أخرى.\nهل ترغب أن نوضح لك خيارات الترقية؟",
    source: "manual-retention"
  },
  {
    key: "retention-upgrade-plus-en",
    title: "Retention - Upgrade to Plus",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "If you need more flexibility, upgrading to Plus may be a better option than cancellation, as it gives you more benefits depending on your membership type, such as access to more branches, Bring a Friend, and other features.\nWould you like us to explain the upgrade options?",
    source: "manual-retention"
  },
  {
    key: "retention-free-pt-ar",
    title: "جلسة تدريب شخصي مجانية بدل الإلغاء",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "قبل إتمام الإلغاء، نقدر نرفع طلب للاستفادة من جلسة تدريب شخصي مجانية حسب المتاح لتحسين تجربتك بالنادي.\nهل ترغب أن نرفع الطلب؟",
    source: "manual-retention"
  },
  {
    key: "retention-free-pt-en",
    title: "Retention - Free PT session",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Before proceeding with cancellation, we can raise a request for a free personal training session depending on availability to improve your gym experience.\nWould you like us to raise the request?",
    source: "manual-retention"
  },
  {
    key: "retention-family-transfer-ar",
    title: "نقل العضوية لأحد أفراد العائلة بدل الإلغاء",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "إذا سبب الإلغاء هو السفر أو عدم القدرة على استخدام العضوية، يمكننا التحقق من إمكانية نقل العضوية لأحد أفراد العائلة بدل الإلغاء حسب الشروط.\nهل ترغب أن نتحقق لك من هذا الخيار؟",
    source: "manual-retention"
  },
  {
    key: "retention-family-transfer-en",
    title: "Retention - Transfer to family member",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "If the cancellation reason is travel or inability to use the membership, we can check whether transferring the membership to a family member is possible instead of cancellation, subject to the terms.\nWould you like us to check this option?",
    source: "manual-retention"
  },
  {
    key: "cancel-auto-renewal-completed-ar",
    title: "إيقاف التجديد التلقائي - مكتمل",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تم إيقاف التجديد التلقائي لعضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: example@email.com\n• رقم الجوال: 0000000000\n\nستبقى عضويتك فعالة حتى 00-00-2020، ولن يتم خصم أي مبلغ بعد ذلك.\n\nيمكنك متابعة حالة عضويتك عبر التطبيق وستكون حالتها غير فعالة.",
    source: "image-action"
  },
  {
    key: "cancel-auto-renewal-completed-en",
    title: "Cancel Auto-Renewal - Completed",
    category: "Cancellation & Retention",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "The auto-renewal for your [Membership Type] membership has been successfully stopped.\n\nAccount details:\n• Email: example@email.com\n• Phone: 0000000000\n\nYour membership will remain active until 00-00-2020, and no further charges will be applied after that.\n\nYou can track your membership through the app, and status will be shown as Inactive.",
    source: "image-action"
  },
  {
    key: "freeze-monthly-completed-ar",
    title: "تجميد العضوية الشهرية - مكتمل",
    category: "Freeze",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تم تجميد عضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: example@email.com\n• رقم الجوال: 0000000000\n\nفترة التجميد:\nمن 00-00-2020 إلى 00-00-2020 وموعد فاتورتك القادمة 00-00-2020 بقيمة 00 SAR\n\nسيتم استئناف العضوية تلقائيًا بعد انتهاء فترة التجميد.\n\nيمكنك دائمًا متابعة تفاصيل عضويتك عبر التطبيق.",
    source: "image-action"
  },
  {
    key: "freeze-monthly-completed-en",
    title: "Freeze Monthly - Completed",
    category: "Freeze",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Your [Membership Type] membership has been successfully frozen.\n\nAccount details:\n• Email: example@email.com\n• Mobile number: 0000000000\n\nFreeze period:\nFrom 00-00-2020 to 00-00-2020. Your next billing date will be on 00-00-2020 with an amount of 00 SAR.\n\nYour membership will automatically resume once the freeze period ends.\n\nYou can always view your membership details through the app.",
    source: "image-action"
  },
  {
    key: "freeze-pif-completed-ar",
    title: "تجميد العضوية محددة المدة - مكتمل",
    category: "Freeze",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تم تجميد عضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: example@email.com\n• رقم الجوال: 0000000000\n\nفترة التجميد:\nمن 00-00-2020 إلى 00-00-2020 وموعد انتهاء عضويتك في 00-00-2020\n\nسيتم استئناف العضوية تلقائيًا بعد انتهاء فترة التجميد.\n\nيمكنك دائمًا متابعة تفاصيل عضويتك عبر التطبيق.",
    source: "image-action"
  },
  {
    key: "freeze-pif-completed-en",
    title: "Freeze PIF - Completed",
    category: "Freeze",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Your [Membership Type] membership has been successfully frozen.\n\nAccount details:\n• Email: example@email.com\n• Mobile number: 0000000000\n\nFreeze period:\nFrom 00-00-2020 to 00-00-2020, and your membership will expire on 00-00-2020.\n\nYour membership will automatically resume once the freeze period ends.\n\nYou can always view your membership details through the app.",
    source: "image-action"
  },
  {
    key: "freeze-paid-link-39-ar",
    title: "رابط دفع تجميد مدفوع",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "سيتم إرسال بريد إلكتروني خلال ساعات يحتوي على رابط دفع بقيمة 39 ر.س لإتمام عملية التجميد.\nيرجى ملاحظة أن رابط الدفع صالح لمدة 48 ساعة.\nكما يلزم التواصل معنا بعد الدفع لإتمام تجميد العضوية.",
    source: "quick-file"
  },
  {
    key: "freeze-paid-link-39-en",
    title: "Paid freeze payment link",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "An email will be sent within a few hours containing a payment link for 39 SAR to complete the freeze process.\nPlease note that the payment link is valid for 48 hours.\nYou will need to contact us after payment to complete the membership freeze.",
    source: "quick-file"
  },
  {
    key: "freeze-policy-core-monthly-ar",
    title: "كور شهري - 30 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "يحق لك تجميد عضويتك مجانًا لمدة ٨ أيام خلال كل ٣٠ يوم.\nلو احتجت تزيد عن ٨ أيام، يتم احتساب ٣٩ ريال لكل ٣٠ يوم إضافي.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-monthly-en",
    title: "Core Monthly - 30 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You're entitled to freeze your membership for 8 days for free every 30 days.\nIf you need more than 8 days, a fee of SAR 39 applies for each additional 30 day period.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-3m-ar",
    title: "كور 3 شهور - 90 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "يحق لك ٢٢ يوم تجميد مجاني خلال فترة عضويتك.\nتقدر تجمدها لمرة واحدة مجانًا ويبدأ التجميد من ١١ يوم كحد أدنى، وبعد أول طلب تجميد مجاني أي أيام إضافية يتم احتسابها برسوم ٣٩ ريال لكل ٣٠ يوم.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-3m-en",
    title: "Core 3 Months - 90 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You are entitled to 22 days of free freeze during your membership period.\nYou can freeze your membership once for free, starting from a minimum of 11 days.\nAfter the first free freeze request, any additional days will be charged at 39 SAR per 30 days.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-4m-ar",
    title: "كور 4 شهور - 120 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "يحق لك ٣٠ يوم تجميد مجاني خلال فترة عضويتك.\nتقدر تجمدها لمرة واحدة ويبدأ التجميد من ١٥ يوم كحد أدنى، وبعد أول طلب تجميد مجاني أي أيام إضافية يتم احتسابها برسوم ٣٩ ريال لكل ٣٠ يوم.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-4m-en",
    title: "Core 4 Months - 120 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You are entitled to 30 days of free freeze during your membership period.\nYou can freeze your membership once, starting from a minimum of 15 days.\nAfter the first free freeze request, any additional days will be charged at 39 SAR per 30 days.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-6m-ar",
    title: "كور 6 شهور - 180 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "يحق لك ٤٥ يوم تجميد مجاني خلال فترة عضويتك.\nتقدر تجمدها لمرة واحدة ويبدأ التجميد من ١٥ يوم كحد أدنى، وبعد أول طلب تجميد مجاني أي أيام إضافية يتم احتسابها برسوم ٣٩ ريال لكل ٣٠ يوم.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-6m-en",
    title: "Core 6 Months - 180 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You are entitled to 45 days of free freeze during your membership period.\nYou can freeze your membership once, starting from a minimum of 15 days.\nAfter the first free freeze request, any additional days will be charged at 39 SAR per 30 days.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-12m-ar",
    title: "كور 12 شهر - 365 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "يحق لك ٩١ يوم تجميد مجاني بالسنة.\nتقدر تجمدها لمرة واحدة ويبدأ التجميد من ١٥ يوم كحد أدنى، وبعد أول طلب تجميد مجاني أي أيام إضافية تُحسب عليها رسوم ٤٩ ريال لكل ٣٠ يوم.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-core-12m-en",
    title: "Core 12 Months - 365 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You are entitled to 91 days of free freeze per year.\nYou can freeze your membership once, starting from a minimum of 15 days.\nAfter the first free freeze request, any additional days will be charged at 49 SAR per 30 days.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-monthly-ar",
    title: "بلس شهري - 30 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "عضويتك فيها ٩١ يوم تجميد مجاني، تقدر تستخدمها على فترات خلال اشتراكك، والحد الأدنى للتجميد هو ١٥ يوم.\nما فيه أي رسوم طول ما أنت ما تعديت الحد. لو تجاوزت ٩١ يوم، الرسوم بتكون ٣٩ ريال لكل ٣٠ يوم إضافي.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-monthly-en",
    title: "Plus Monthly - 30 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "Your membership includes 91 free freeze days. You can use them in periods throughout your subscription, and the minimum freeze duration is 15 days. There are no fees as long as you don’t exceed the limit.\nIf you go beyond the 91 days, the fee will be 39 SAR for each additional 30 days.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-3m-ar",
    title: "بلس 3 شهور - 90 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "عندك ٢٢ يوم تجميد مجاني، وتقدر تقسّمهم على مرتين كل مرة ١١ يوم.\nويتم احتساب ٣٩ ريال لكل ٣٠ يوم تجميد إضافي.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-3m-en",
    title: "Plus 3 Months - 90 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You have 22 days of free freeze, and you can split them into two periods of 11 days each.\nAny additional freeze days will be charged at 39 SAR per 30 days.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-4m-ar",
    title: "بلس 4 شهور - 120 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "عندك ٣٠ يوم تجميد مجاني خلال الاشتراك، وتقدر تقسّمهم على مرتين كل مرة ١٥ يوم.\nويتم احتساب ٣٩ ريال لكل ٣٠ يوم تجميد إضافي.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-4m-en",
    title: "Plus 4 Months - 120 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You have 30 days of free freeze during your membership, and you can split them into two periods of 15 days each.\nAny additional freeze days will be charged at 39 SAR per 30 days.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-6m-ar",
    title: "بلس 6 شهور - 180 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "عندك ٤٥ يوم تجميد مجاني خلال مدة العضوية.\nتقدر تستخدمها على فترات بدون أي رسوم، والحد الأدنى للتجميد هو ١٥ يوم.\nولو تجاوزت الـ٤٥ يوم، يتم احتساب ٣٩ ريال لكل ٣٠ يوم إضافي.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-6m-en",
    title: "Plus 6 Months - 180 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You have 45 days of free freeze during your membership period.\nYou can use them in multiple periods with no charge, with a minimum freeze of 15 days.\nIf you exceed the 45 days, an additional 39 SAR will be charged per 30 extra days.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-12m-ar",
    title: "بلس 12 شهر - 365 يوم",
    category: "Freeze",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "يحق لك تجميد عضويتك لمدة ٩١ يوم مجانًا خلال السنة.\nتقدر تقسمها وتستخدمها بأي وقت يناسبك والحد الأدنى للتجميد هو ١٥ يوم.\nبعد ما تخلص مدة التجميد المجاني، تُحسب رسوم ٤٩ ريال لكل ٣٠ يوم إضافي.",
    source: "image-freeze-policy"
  },
  {
    key: "freeze-policy-plus-12m-en",
    title: "Plus 12 Months - 365 Days",
    category: "Freeze",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You are entitled to 91 days of free freeze during the year.\nYou can split it and use it at any time that suits you, with a minimum freeze of 15 days.\nAfter the free freeze period ends, 49 SAR will be charged for each additional 30 days.",
    source: "image-freeze-policy"
  },
  {
    key: "transfer-escalated-ar",
    title: "نقل عضوية - خلال 24 ساعة",
    category: "Transfers & Refunds",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تم استلام طلب نقل عضويتك [نوع العضوية] بالتفاصيل التالية:\n\nبيانات الحساب:\n• البريد الإلكتروني: example@email.com\n• رقم الجوال: 0000000000\n\nتفاصيل النقل:\n• من فرع: [الفرع الحالي]\n• إلى فرع: [الفرع المطلوب]\n\nتم تحويل الطلب إلى الفريق المختص لتنفيذه.\nسيتم إتمام النقل خلال 24 ساعة، وستظهر التحديثات مباشرة في التطبيق.",
    source: "image-action"
  },
  {
    key: "transfer-escalated-en",
    title: "Transfer - Escalated 24h",
    category: "Transfers & Refunds",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Your transfer request for your [Membership Type] membership has been received:\n\nAccount details:\n• Email: example@email.com\n• Phone: 0000000000\n\nTransfer details:\n• From branch: [Current Branch]\n• To branch: [Target Branch]\n\nWe’ve shared this with our Membership Services team.\nThe transfer will be completed within 24 hours, and you’ll see the update in your app.",
    source: "image-action"
  },
  {
    key: "transfer-done-ar",
    title: "نقل عضوية - تم مباشرة",
    category: "Transfers & Refunds",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تم نقل عضويتك [نوع العضوية] بالتفاصيل التالية:\n\nبيانات الحساب:\n• البريد الإلكتروني: example@email.com\n• رقم الجوال: 0000000000\n\nتفاصيل النقل:\n• من فرع: [الفرع الحالي]\n• إلى فرع: [الفرع المطلوب]\n\nستظهر التحديثات مباشرة في التطبيق.",
    source: "image-action"
  },
  {
    key: "transfer-done-en",
    title: "Transfer - Done Immediately",
    category: "Transfers & Refunds",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Your transfer for your [Membership Type] membership has been done:\n\nAccount details:\n• Email: example@email.com\n• Phone: 0000000000\n\nTransfer details:\n• From branch: [Current Branch]\n• To branch: [Target Branch]\n\nYou’ll see the update in your app directly.",
    source: "image-action"
  },
  {
    key: "refund-requested-ar",
    title: "طلب استرجاع نقدي",
    category: "Transfers & Refunds",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تم رفع طلب الاسترجاع النقدي لعضويتك [نوع العضوية] إلى القسم المعني.\n\nبيانات الحساب:\n• البريد الإلكتروني: example@email.com\n• رقم الجوال: 0000000000\n\nتفاصيل الاسترجاع:\n• المبلغ: 00 SAR\n\nسيتم معالجة الاسترجاع خلال 3–5 أيام عمل حسب سياسة البنك.\n\nسيعود المبلغ إلى نفس وسيلة الدفع المستخدمة عند الاشتراك في حال الموافقة على طلبك.",
    source: "image-action"
  },
  {
    key: "refund-requested-en",
    title: "Refund - Requested",
    category: "Transfers & Refunds",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Your refund request for your [Membership Type] has been submitted to the concerned department.\n\nAccount details:\n• Email: example@email.com\n• Mobile number: 0000000000\n\nRefund details:\n• Amount: 00 SAR\n\nThe refund will be processed within 3–5 business days according to the bank’s policy.\n\nThe amount will be returned to the same payment method used at the time of subscription, if your request is approved.",
    source: "image-action"
  },
  {
    key: "payment-issue-checklist-ar",
    title: "مشكلة في الدفع",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "في حال واجهت مشكلة في الدفع، يرجى التأكد من التالي:\n\n• توفر رصيد كافي في البطاقة.\n• أن البطاقة تدعم الدفع الإلكتروني.\n• إدخال بيانات البطاقة بشكل صحيح.\n• وجود اتصال إنترنت مستقر.\n• عدم استخدام VPN أثناء عملية الدفع.\n• في حال اختيار عضوية شهرية، لن يظهر خيار تابي لأنه متاح فقط للعضويات محددة المدة.\n\nفي حال استمرار المشكلة، يرجى المحاولة مرة أخرى لاحقًا أو التواصل معنا.",
    source: "quick-file"
  },
  {
    key: "payment-issue-checklist-en",
    title: "Payment issue checklist",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "If you are facing a payment issue, please make sure of the following:\n\n• Sufficient balance is available on your card.\n• Your card supports online transactions.\n• Card details are entered correctly.\n• Your internet connection is stable.\n• Do not use a VPN during payment.\n• If you selected a monthly membership, Tabby will not appear as it is only available for fixed-term memberships.\n\nIf the issue persists, please try again later or contact us.",
    source: "quick-file"
  },
  {
    key: "add-membership-payment-request-ar",
    title: "إضافة عضوية جديدة - تأكيد الطلب",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "تقدر تشترك عن طريقنا بإضافة عضوية جديدة على عضويتك الحالية.\nسيتم إرسال بريد إلكتروني يحتوي على رابط دفع بقيمة العضوية الجديدة، وبعد إتمام الدفع سيتم إضافة العضوية الجديدة لتبدأ بعد انتهاء عضويتك الحالية.\n\nيرجى ملاحظة أن رابط الدفع صالح لمدة 48 ساعة.\nكما يلزم التواصل معنا بعد الدفع لإتمام إضافة العضوية.\nعلمًا بأنه لا يمكن الدفع عن طريق تابي لهذه العملية.\n\nهل ترغب في تأكيد الطلب؟",
    source: "quick-file"
  },
  {
    key: "add-membership-payment-request-en",
    title: "Add new membership - Confirm request",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "You can subscribe through us by adding a new membership to your current one.\nAn email will be sent to you with a payment link for the new membership. Once the payment is completed, the new membership will be added to start after your current one ends.\n\nPlease note that the payment link is valid for 48 hours.\nYou will need to contact us after payment to complete the process.\nKindly note that Tabby is not available for this type of payment.\n\nWould you like to confirm the request?",
    source: "quick-file"
  },
  {
    key: "payment-link-sent-ar",
    title: "رابط دفع تم إرساله",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "سيتم إرسال بريد إلكتروني خلال ساعات يحتوي على رابط دفع بقيمة (___) ريال.\nبعد إتمام الدفع، سيتم إضافة العضوية الجديدة لتبدأ بعد انتهاء عضويتك الحالية.\n\nيرجى ملاحظة أن رابط الدفع صالح لمدة 48 ساعة.\nكما نرجو التواصل معنا بعد الدفع لإتمام إضافة العضوية.",
    source: "quick-file"
  },
  {
    key: "payment-link-sent-en",
    title: "Payment link sent",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "An email will be sent within a few hours containing a payment link for the amount of (___) SAR.\nOnce the payment is completed, the new membership will be added to start after your current one ends.\n\nPlease note that the payment link is valid for 48 hours.\nKindly contact us after payment to complete adding the membership.",
    source: "quick-file"
  },
  {
    key: "failed-renewal-suspended-ar",
    title: "فشل التجديد والعضوية معلقة",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "نود التوضيح أنه كانت هناك محاولة تجديد تلقائي بتاريخ 00-00-2020 ولم تنجح، لذلك تم تعليق عضويتك لمدة 10 أيام.\n\nبعد انتهاء فترة التعليق، سيتم إجراء محاولة تجديد تلقائي أخرى، وفي حال فشلت سيتم إلغاء العضوية تلقائيًا.\n\nبإمكانك الدخول إلى الموقع وتسجيل الدخول إلى حسابك وسداد المبلغ يدويًا باستخدام أي بطاقة دون الحاجة لانتظار المحاولة القادمة، وذلك لتمكينك من دخول النادي.",
    source: "quick-file"
  },
  {
    key: "failed-renewal-suspended-en",
    title: "Failed renewal - Membership suspended",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "We would like to inform you that an automatic renewal attempt was made on 00-00-2020, but it was unsuccessful. As a result, your membership has been suspended for 10 days.\n\nAfter this period, another automatic payment attempt will be made. If it fails again, the membership will be cancelled automatically.\n\nYou can log in to your account through the website and complete the payment manually using any card without waiting for the next attempt, so you can regain access to the gym.",
    source: "quick-file"
  },
  {
    key: "change-card-steps-ar",
    title: "طريقة تغيير البطاقة",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "كل اللي عليك تسويه أنك تسجل دخول على حسابك من هذا الرابط:\nhttps://ksa.puregymarabia.com/login/\n\nتضغط على \"يدير\" تحت بطاقة الصالة الرياضية، بعدها تضغط على طريقة الدفع أو السداد وتغير معلومات البطاقة من هناك.",
    source: "quick-file"
  },
  {
    key: "change-card-steps-en",
    title: "Change payment card steps",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "All you need to do is log in to your account through this link:\nhttps://ksa.puregymarabia.com/login/\n\nClick “Manage” under the gym membership card, then click on payment method and update your card details from there.",
    source: "quick-file"
  },
  {
    key: "monthly-to-pif-conversion-ar",
    title: "تحويل من شهري إلى محدد المدة",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "في حال رغبتك بتحويل عضويتك من عضوية شهرية إلى عضوية محددة المدة ()، فسيتم سحب فرق السعر بين العضويتين وهو () ريال تقريبًا فجر الغد.\nيرجى التأكد من توفر مبلغ أكثر بقليل من المطلوب للتأكد من إتمام عملية السحب دون مشاكل.\n\nعلمًا بأن عضويتك الجديدة ستبدأ من تاريخ غد، وعملية السحب ستتم من نفس البطاقة المسجلة على عضويتك الشهرية.\n\nإذا فشل تحصيل فرق السعر للمرة الأولى، سيتم محاولة السحب مرة أخرى بعد 10 أيام، وفي حال فشل عملية السحب للمرة الثانية سيتم إلغاء عضويتك بشكل نهائي ولا يمكن استرجاعها.\n\nهل نأكد على العملية؟\n\nملاحظة: إذا تم تحويل عضويتك إلى عضوية ثابتة وتم سحب المبلغ، ولاحقًا وصلك تنبيه بخصوص قرب موعد دفعتك الشهرية، يرجى تجاهل الرسالة لأنها تابعة لعضويتك الشهرية السابقة.",
    source: "quick-file"
  },
  {
    key: "monthly-to-pif-conversion-en",
    title: "Monthly to fixed-term conversion",
    category: "Payment & Billing",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "If you would like to convert your membership from a monthly membership to a fixed-term membership (), the price difference between both memberships, which is approximately () SAR, will be charged early tomorrow morning.\nPlease make sure that a little more than the required amount is available to ensure the payment is completed without any issues.\n\nPlease note that your new membership will start tomorrow, and the payment will be taken from the same card registered on your monthly membership.\n\nIf the first attempt to collect the price difference fails, another attempt will be made after 10 days. If the second attempt also fails, your membership will be permanently cancelled and cannot be restored.\n\nWould you like us to confirm the process?\n\nPlease note that if your membership is converted to a fixed-term membership and the payment is successfully taken, and you later receive an alert regarding your upcoming monthly payment, please ignore it as it is related to your previous monthly membership.",
    source: "quick-file"
  },
  {
    key: "password-reset-permission-ar",
    title: "طلب إذن إعادة تعيين كلمة السر",
    category: "App / Login / Password",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "هل تسمح لي بإعادة تعيين كلمة السر لك؟",
    source: "manual"
  },
  {
    key: "password-reset-permission-en",
    title: "Password reset permission",
    category: "App / Login / Password",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Do I have your permission to reset the password for you?",
    source: "manual"
  },
  {
    key: "password-reset-done-ar",
    title: "تمت إعادة تعيين كلمة السر",
    category: "App / Login / Password",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تم إعادة تعيين كلمة السر الخاصة بك بنجاح.\nبإمكانك الآن تسجيل الدخول باستخدام المعلومات التالية:\n\nالبريد الإلكتروني: example@email.com\nكلمة السر: 12345678",
    source: "manual"
  },
  {
    key: "password-reset-done-en",
    title: "Password reset completed",
    category: "App / Login / Password",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Your password has been successfully reset.\nYou can now log in using the following details:\n\nEmail: example@email.com\nPassword: 12345678",
    source: "manual"
  },
  {
    key: "logout-login-update-ar",
    title: "تسجيل الخروج والدخول لتحديث البيانات",
    category: "App / Login / Password",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "نرجو منك فقط تسجيل الخروج من التطبيق ثم تسجيل الدخول مرة أخرى، وسوف يتم تحديث البيانات تلقائيًا.",
    source: "manual"
  },
  {
    key: "logout-login-update-en",
    title: "Logout and login to update",
    category: "App / Login / Password",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "We only ask you to log out of the application and then log in again, and the information will be updated automatically.",
    source: "manual"
  },
  {
    key: "logout-login-troubleshoot-ar",
    title: "حل مشكلة تسجيل الدخول من التطبيق",
    category: "App / Login / Password",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تمام، أرجو منك تجربة التالي:\n\nأغلق التطبيق بشكل كامل، وسجل خروج من الموقع في المتصفح إذا كان مسجل دخول، ثم أغلق المتصفح بشكل كامل.\n\nبعدها ادخل إلى المتصفح مرة أخرى وافتح موقع بيورجيم وسجل دخول:\nhttps://ksa.puregymarabia.com/\n\nبعدها خَلّي المتصفح والموقع شغالين في الخلفية، وادخل التطبيق مرة أخرى وسوي تسجيل دخول أيضًا.\n\nمعلومات التسجيل:\nexample@email.com\n12345678",
    source: "manual"
  },
  {
    key: "logout-login-troubleshoot-en",
    title: "App login troubleshooting",
    category: "App / Login / Password",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Please try the following:\n\nClose the app completely, log out from the website in your browser if you are logged in, then close the browser completely.\n\nAfter that, open the browser again, go to the PureGym website and log in:\nhttps://ksa.puregymarabia.com/\n\nThen keep the browser and website running in the background, open the app again, and log in there as well.\n\nLogin details:\nexample@email.com\n12345678",
    source: "manual"
  },
  {
    key: "remove-friend-confirm-ar",
    title: "تأكيد إزالة الصديق",
    category: "Friend / Bring a Friend",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "هل تريد إزالة الصديق (اسم الصديق) من عضويتك؟",
    source: "quick-file"
  },
  {
    key: "remove-friend-confirm-en",
    title: "Remove friend confirmation",
    category: "Friend / Bring a Friend",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Would you like to remove your friend (Friend Name) from your membership?",
    source: "quick-file"
  },
  {
    key: "remove-friend-done-ar",
    title: "تمت إزالة الصديق",
    category: "Friend / Bring a Friend",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "تم إزالة الصديق من عضويتك.\nيمكنك الآن تسجيل الخروج من التطبيق ثم تسجيل الدخول مرة أخرى، وسوف يتم تحديث البيانات تلقائيًا.\nبعد ذلك يمكنك إضافة صديق جديد.",
    source: "quick-file"
  },
  {
    key: "remove-friend-done-en",
    title: "Friend removed",
    category: "Friend / Bring a Friend",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "The friend has been removed from your membership.\nYou can now log out of the application and log in again, and the information will update automatically.\nAfter that, you can add a new friend.",
    source: "quick-file"
  },
  {
    key: "bring-friend-plus-ar",
    title: "ميزة Bring a Friend",
    category: "Friend / Bring a Friend",
    country: "ALL" as Country,
    language: "AR" as ScriptLanguage,
    body: "نعم صحيح، باقة Plus تتيح لك دعوة صديق 4 مرات شهريًا من خلال التطبيق.\nفقط ادخل إلى القائمة واختر خيار Bring a Friend.",
    source: "quick-file"
  },
  {
    key: "bring-friend-plus-en",
    title: "Bring a Friend Plus benefit",
    category: "Friend / Bring a Friend",
    country: "ALL" as Country,
    language: "EN" as ScriptLanguage,
    body: "Yes, that’s correct. The Plus membership allows you to invite a friend 4 times per month through the application.\nSimply open the menu and select the “Bring a Friend” option.",
    source: "quick-file"
  },
  {
    key: "prices-ksa-ar",
    title: "رابط الأسعار",
    category: "Offers, Prices & PT",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 الأسعار تختلف حسب الفرع ونوع العضوية ومدتها.\nيمكنك الاطلاع على الأسعار واختيار الفرع المناسب من خلال الرابط التالي:\nhttps://ksa.puregymarabia.com/join/",
    source: "quick-file"
  },
  {
    key: "prices-ksa-en",
    title: "Prices link",
    category: "Offers, Prices & PT",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Prices vary depending on the branch, membership type, and duration.\nYou can check the prices and choose your preferred branch through the following link:\nhttps://ksa.puregymarabia.com/join/",
    source: "quick-file"
  },
  {
    key: "offer-pgm30-ksa-ar",
    title: "العرض الحالي PGM30 / PG3M",
    category: "Offers, Prices & PT",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "💚 العرض الحالي لفترة محدودة!\n\nعندنا حاليًا عروض بخصم 30٪ 🔥\n\n✅ إذا حاب الاشتراك الشهري، تقدر تحصل على خصم 30٪ على أول شهر لعضويات كور وبلس باستخدام كود: PGM30\n\n✅ وإذا تفضل العضويات محددة المدة، فيه خصم 30٪ على عضوية 3 شهور بلس باستخدام كود: PG3M\n\nالعروض مناسبة جدًا إذا حاب تبدأ النادي بسعر أقل وتستفيد من مميزات العضوية 💪",
    source: "quick-file"
  },
  {
    key: "offer-pgm30-ksa-en",
    title: "Current offer PGM30 / PG3M",
    category: "Offers, Prices & PT",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "💚 Limited time offer!\n\nGet 30% off your first month on monthly memberships using code: PGM30.\n\nFor fixed-term memberships, you can get 30% off the 3-month Plus membership using code: PG3M.\n\nA great option to start at a lower price and enjoy the membership benefits 💪",
    source: "quick-file"
  },
  {
    key: "prices-uae-ar",
    title: "رابط الأسعار",
    category: "Offers, Prices & PT",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 الأسعار تختلف حسب الفرع ونوع العضوية ومدتها.\nيمكنك الاطلاع على الأسعار واختيار الفرع المناسب من خلال الرابط التالي:\nhttps://uae.puregymarabia.com/join/",
    source: "quick-file"
  },
  {
    key: "prices-uae-en",
    title: "Prices link",
    category: "Offers, Prices & PT",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Prices vary depending on the branch, membership type, and duration.\nYou can check the prices and choose your preferred branch through the following link:\nhttps://uae.puregymarabia.com/join/",
    source: "quick-file"
  },
  {
    key: "offer-pgm30-uae-ar",
    title: "العرض الحالي PGM30 / PG3M",
    category: "Offers, Prices & PT",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "💙 العرض الحالي لفترة محدودة!\n\nعندنا حاليًا عروض بخصم 30٪ 🔥\n\n✅ إذا حاب الاشتراك الشهري، تقدر تحصل على خصم 30٪ على أول شهر لعضويات كور وبلس باستخدام كود: PGM30\n\n✅ وإذا تفضل العضويات محددة المدة، فيه خصم 30٪ على عضوية 3 شهور بلس باستخدام كود: PG3M\n\nالعروض مناسبة جدًا إذا حاب تبدأ النادي بسعر أقل وتستفيد من مميزات العضوية 💪",
    source: "quick-file"
  },
  {
    key: "offer-pgm30-uae-en",
    title: "Current offer PGM30 / PG3M",
    category: "Offers, Prices & PT",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "💙 Limited time offer!\n\nGet 30% off your first month on monthly memberships using code: PGM30.\n\nFor fixed-term memberships, you can get 30% off the 3-month Plus membership using code: PG3M.\n\nA great option to start at a lower price and enjoy the membership benefits 💪",
    source: "quick-file"
  },
  {
    key: "pt-pricing-ksa-ar",
    title: "أسعار التدريب الشخصي السعودية",
    category: "Offers, Prices & PT",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "أسعار التدريب الشخصي ثابتة، وهذه أسعار باقات التدريب الشخصي عندنا:\n\nجلسة وحدة ← 249.55 ريال | صالحة يومين\n5 جلسات ← 1,148.85 ريال | صالحة 21 يوم\n10 جلسات ← 2,276.42 ريال | صالحة 45 يوم\n20 جلسة ← 4,183.70 ريال | صالحة 90 يوم\n30 جلسة ← 5,906.40 ريال | صالحة 120 يوم\n48 جلسة ← 8,921.12 ريال | صالحة 180 يوم\n\nالتقسيط متاح عن طريق تابي فقط من باقة الـ 10 جلسات وفوق. أما جلسة وحدة والـ 5 جلسات فتُدفع كاملة بدون تقسيط.",
    source: "image"
  },
  {
    key: "pt-pricing-ksa-en",
    title: "KSA PT Pricing",
    category: "Offers, Prices & PT",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "Our Personal Training prices are fixed, and here are our packages:\n\n1 Session → SAR 249.55 | 2 days\n5 Sessions → SAR 1,148.85 | 21 days\n10 Sessions → SAR 2,276.42 | 45 days\n20 Sessions → SAR 4,183.70 | 90 days\n30 Sessions → SAR 5,906.40 | 120 days\n48 Sessions → SAR 8,921.12 | 180 days\n\nTabby is available from the 10-session package and above. The 1-session and 5-session packages are full payment only.",
    source: "image"
  },
  {
    key: "pt-pricing-uae-ar",
    title: "أسعار التدريب الشخصي الإمارات",
    category: "Offers, Prices & PT",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "بخصوص التدريب الشخصي، الكوتش عندنا فري لانس، يعني كل كوتش يحدد أسعاره بنفسه.\n\nالسيشن الواحدة تبدأ من حوالي 200 درهم\nوباقات الـ 12 سيشن عادةً تتراوح بين 2,700 و3,500 درهم\n\nعندنا كوتشات رجال وحريم في كل الجيمات ويتكلمون لغات كثيرة. تقدر تتواصل مع أي كوتش مباشرة في الجيم وتسأله عن أوقاته وأسعاره.",
    source: "image"
  },
  {
    key: "pt-pricing-uae-en",
    title: "UAE PT Pricing",
    category: "Offers, Prices & PT",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "For personal training, our coaches are freelancers, so each coach sets their own rates.\n\nSingle sessions start from around AED 200.\n12-session packages usually range between AED 2,700 and AED 3,500.\n\nWe have male and female coaches across our gyms who speak many languages. Feel free to speak to any coach directly at the gym and ask about their schedule and prices.",
    source: "image"
  },
  {
    key: "core-plus-difference-ar",
    title: "الفرق بين كور وبلس",
    category: "Membership & Packages",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "خلّنا نوضح لك الفرق بين الباقتين:\n\n🔹 باقة كور:\nتتمرن في فرعك الأساسي فقط، تحجز الكلاسات قبلها بـ 8 أيام، وتستخدم أكثر من 180 جهاز حديث.\nوتقدر تجمّد عضويتك مجانًا حسب المدة المسموحة، وإذا تجاوزت المدة يتم احتساب رسوم حسب الشروط.\n\n🔸 باقة بلس:\nمميزاتها أكثر. تدخل أكثر من فرع حسب الباقة، وتحجز الكلاسات قبلها بـ 14 يوم.\nتقدر تضيف صديق 4 مرات شهريًا مجانًا، وتستفيد من مزايا إضافية مثل Boditrax ومياه Yanga حسب توفرها.\n\nكل باقة مصممة تناسب احتياجك، اختَر الأنسب وابدأ مشوارك الرياضي معنا.",
    source: "image"
  },
  {
    key: "core-plus-difference-en",
    title: "Core vs Plus",
    category: "Membership & Packages",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "Let us walk you through the difference between the two packages:\n\n🔹 Core Package:\nYou can work out at your home branch only, book classes up to 8 days in advance, and use more than 180 modern machines.\nYou can freeze your membership for free based on the allowed period, and if you exceed it, fees apply according to the terms.\n\n🔸 Plus Package:\nMore benefits. You can access more than one branch depending on the plan and book classes up to 14 days in advance.\nYou can bring a friend 4 times per month for free and enjoy extra benefits such as Boditrax and Yanga where available.\n\nEach package is designed to fit your needs. Choose the one that suits you best and start your fitness journey with us.",
    source: "image"
  },
  {
    key: "working-hours-ksa-ar",
    title: "أوقات العمل السعودية",
    category: "Branches, Hours & Links",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "أفرع الرجال تفتح على مدار الساعة طوال الأسبوع، يعني تقدر تزورنا بأي وقت يناسبك.\n\nأما أفرع النساء تفتح في الأوقات التالية:\nيوم الجمعة: من 6:30 صباحًا إلى 10:30 مساءً\nباقي الأيام: من 6:30 صباحًا إلى منتصف الليل 💪",
    source: "image"
  },
  {
    key: "working-hours-ksa-en",
    title: "KSA Working Hours",
    category: "Branches, Hours & Links",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "Men’s branches are open 24/7, so you can visit anytime.\n\nWomen’s branches operate on the following schedule:\nFridays: 6:30 AM – 10:30 PM\nOther days: 6:30 AM – 12:00 AM 💪",
    source: "image"
  },
  {
    key: "location-links-ksa-ar",
    title: "روابط مواقع الفروع KSA",
    category: "Branches, Hours & Links",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "Khobar Branches:\nAl-Rakah Women: https://goo.gl/maps/qBMRA6rcB2YfdeRi6\nGolden Belt Men: https://goo.gl/maps/HAymbyuT6wY7hffZ9\n\nRiyadh Branches:\nAl-Rabwah Men: https://goo.gl/maps/CpgtzBLSd5GGD81R8\nAl-Yasmin Men: https://goo.gl/maps/y6gTZe3mfPDGa6YA9\nAl-Mansourah Men: https://goo.gl/maps/JSrGSHfqyu9aKvsJ6\nAl-Aziziyah Women: https://goo.gl/maps/sSMLSE6H2gNYnGYG8\nAl-Hamra Women: https://goo.gl/maps/fqRyHVmsKxELA1cG7\nAl-Hamra Men: https://goo.gl/maps/FsLFuoGykaidt7JQ7\nAl-Sahafa Women: https://goo.gl/maps/PfgCDMED3wRfnqDu7\nAl-Munsiyah Men: https://goo.gl/maps/GVUpxGcQtDseBT6i6\nAl-Munsiyah Women: https://goo.gl/maps/DC2Bkjf1LSHbDTqq9\nAl-Nasim Men: https://maps.app.goo.gl/NH9zipUBRXZuruvA7\nAl-Nasim Women: https://maps.app.goo.gl/poYk75XixrHJmX9B7\nAs Saadah Men: https://maps.app.goo.gl/UUUaPG18F6EddUpu9\nAl-Rabwah Women: https://maps.app.goo.gl/QaJ8cPUkCTuGnkuq9\n\nDammam Branches:\nAl-Faisaliyah Men: https://goo.gl/maps/91vsMiDSy2yozSZH6\nAl-Qairawan Men: https://goo.gl/maps/eSe7jX1gy1329CiZ8\nAl-Shatea Women: https://maps.app.goo.gl/fsqpsLZbsdY213uDA\n\nJeddah Branches:\nAlsafa Men: https://maps.app.goo.gl/4ALVTeDC8APoK6kw9?g_st=iw\nAlsafa Women: https://maps.app.goo.gl/4ALVTeDC8APoK6kw9?g_st=iw\nAlzahrah Women: https://maps.app.goo.gl/GoWDJ8t2EvVq6tTk7",
    source: "image"
  },
  {
    key: "location-links-ksa-en",
    title: "KSA Location Links",
    category: "Branches, Hours & Links",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "Khobar Branches:\nAl-Rakah Women: https://goo.gl/maps/qBMRA6rcB2YfdeRi6\nGolden Belt Men: https://goo.gl/maps/HAymbyuT6wY7hffZ9\n\nRiyadh Branches:\nAl-Rabwah Men: https://goo.gl/maps/CpgtzBLSd5GGD81R8\nAl-Yasmin Men: https://goo.gl/maps/y6gTZe3mfPDGa6YA9\nAl-Mansourah Men: https://goo.gl/maps/JSrGSHfqyu9aKvsJ6\nAl-Aziziyah Women: https://goo.gl/maps/sSMLSE6H2gNYnGYG8\nAl-Hamra Women: https://goo.gl/maps/fqRyHVmsKxELA1cG7\nAl-Hamra Men: https://goo.gl/maps/FsLFuoGykaidt7JQ7\nAl-Sahafa Women: https://goo.gl/maps/PfgCDMED3wRfnqDu7\nAl-Munsiyah Men: https://goo.gl/maps/GVUpxGcQtDseBT6i6\nAl-Munsiyah Women: https://goo.gl/maps/DC2Bkjf1LSHbDTqq9\nAl-Nasim Men: https://maps.app.goo.gl/NH9zipUBRXZuruvA7\nAl-Nasim Women: https://maps.app.goo.gl/poYk75XixrHJmX9B7\nAs Saadah Men: https://maps.app.goo.gl/UUUaPG18F6EddUpu9\nAl-Rabwah Women: https://maps.app.goo.gl/QaJ8cPUkCTuGnkuq9\n\nDammam Branches:\nAl-Faisaliyah Men: https://goo.gl/maps/91vsMiDSy2yozSZH6\nAl-Qairawan Men: https://goo.gl/maps/eSe7jX1gy1329CiZ8\nAl-Shatea Women: https://maps.app.goo.gl/fsqpsLZbsdY213uDA\n\nJeddah Branches:\nAlsafa Men: https://maps.app.goo.gl/4ALVTeDC8APoK6kw9?g_st=iw\nAlsafa Women: https://maps.app.goo.gl/4ALVTeDC8APoK6kw9?g_st=iw\nAlzahrah Women: https://maps.app.goo.gl/GoWDJ8t2EvVq6tTk7",
    source: "image"
  },
  {
    key: "virtual-tour-links-ksa-ar",
    title: "روابط الجولات الافتراضية KSA",
    category: "Branches, Hours & Links",
    country: "KSA" as Country,
    language: "AR" as ScriptLanguage,
    body: "Khobar Branches:\nGolden Belt Men: https://my.matterport.com/show/?m=ft4ft5vD6sx\nAl-Rakah Women: https://my.matterport.com/show/?m=gzePUKqJeWs\n\nRiyadh Branches:\nAl-Mansourah Men: https://my.matterport.com/show/?m=V6tR4bmLB6n\nAl-Yasmin Men: https://my.matterport.com/show/?m=U9KB5yJnw94\nAl-Hamra Men: https://my.matterport.com/show/?m=Wmk94DhwSZ8\nAl-Hamra Women: https://my.matterport.com/show/?m=zLktpNYqcUJ\nAs Sahafa Women: https://virtual.property360.tours/show/?m=gCbuQMdhqVN\nAl-Aziziyah Women: https://my.matterport.com/show/?m=7fc8KE68DdE\nAl-Munsiyah Men: https://my.matterport.com/show/?m=9CVhboEe2kj\nAl-Munsiyah Women: https://my.matterport.com/show/?m=HrBZBTBQSry\nAl-Nasim Men: https://my.matterport.com/show/?m=kGC3pviiKyr\nAl-Nasim Women: https://my.matterport.com/show/?m=5btVHXzr1ke\nAs Saadah Men: https://my.matterport.com/show/?m=TbToTDwfdMv\n\nDammam Branches:\nAl-Faisaliyah Men: https://my.matterport.com/show/?m=2sfg6Tv6A7e\nAl-Shatea Women: https://my.matterport.com/show/?m=g1chmo2JBw7\nAl-Qairawan Men: https://virtual.property360.tours/show/?m=n3n9yav3bMf\n\nJeddah Branches:\nAlsafa Women: https://www.youtube.com/watch?v=RrmZsaFwEOE\nAlsafa Men: https://www.youtube.com/watch?v=5QdIVddUqyA\nAlzahrah Women: https://www.youtube.com/watch?v=qS05iTvb2kY",
    source: "image"
  },
  {
    key: "virtual-tour-links-ksa-en",
    title: "KSA Virtual Tour Links",
    category: "Branches, Hours & Links",
    country: "KSA" as Country,
    language: "EN" as ScriptLanguage,
    body: "Khobar Branches:\nGolden Belt Men: https://my.matterport.com/show/?m=ft4ft5vD6sx\nAl-Rakah Women: https://my.matterport.com/show/?m=gzePUKqJeWs\n\nRiyadh Branches:\nAl-Mansourah Men: https://my.matterport.com/show/?m=V6tR4bmLB6n\nAl-Yasmin Men: https://my.matterport.com/show/?m=U9KB5yJnw94\nAl-Hamra Men: https://my.matterport.com/show/?m=Wmk94DhwSZ8\nAl-Hamra Women: https://my.matterport.com/show/?m=zLktpNYqcUJ\nAs Sahafa Women: https://virtual.property360.tours/show/?m=gCbuQMdhqVN\nAl-Aziziyah Women: https://my.matterport.com/show/?m=7fc8KE68DdE\nAl-Munsiyah Men: https://my.matterport.com/show/?m=9CVhboEe2kj\nAl-Munsiyah Women: https://my.matterport.com/show/?m=HrBZBTBQSry\nAl-Nasim Men: https://my.matterport.com/show/?m=kGC3pviiKyr\nAl-Nasim Women: https://my.matterport.com/show/?m=5btVHXzr1ke\nAs Saadah Men: https://my.matterport.com/show/?m=TbToTDwfdMv\n\nDammam Branches:\nAl-Faisaliyah Men: https://my.matterport.com/show/?m=2sfg6Tv6A7e\nAl-Shatea Women: https://my.matterport.com/show/?m=g1chmo2JBw7\nAl-Qairawan Men: https://virtual.property360.tours/show/?m=n3n9yav3bMf\n\nJeddah Branches:\nAlsafa Women: https://www.youtube.com/watch?v=RrmZsaFwEOE\nAlsafa Men: https://www.youtube.com/watch?v=5QdIVddUqyA\nAlzahrah Women: https://www.youtube.com/watch?v=qS05iTvb2kY",
    source: "image"
  },
  {
    key: "location-links-uae-ar",
    title: "روابط مواقع الفروع UAE",
    category: "Branches, Hours & Links",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "Dubai Nad Al Sheba: https://maps.app.goo.gl/vj6Y7pVJpjqXPYse9\nDubai Al Barsha: https://maps.app.goo.gl/522EbHVZ5y8pBnkJ9",
    source: "image"
  },
  {
    key: "location-links-uae-en",
    title: "UAE Location Links",
    category: "Branches, Hours & Links",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "Dubai Nad Al Sheba: https://maps.app.goo.gl/vj6Y7pVJpjqXPYse9\nDubai Al Barsha: https://maps.app.goo.gl/522EbHVZ5y8pBnkJ9",
    source: "image"
  },
  {
    key: "virtual-tour-links-uae-ar",
    title: "روابط الجولات الافتراضية UAE",
    category: "Branches, Hours & Links",
    country: "UAE" as Country,
    language: "AR" as ScriptLanguage,
    body: "Dubai Branches:\nNad Al Sheba: https://my.matterport.com/show/?m=cpYJYiRJycw\nAl Barsha: https://my.matterport.com/show/?m=DrJ1JsW8as9",
    source: "image"
  },
  {
    key: "virtual-tour-links-uae-en",
    title: "UAE Virtual Tour Links",
    category: "Branches, Hours & Links",
    country: "UAE" as Country,
    language: "EN" as ScriptLanguage,
    body: "Dubai Branches:\nNad Al Sheba: https://my.matterport.com/show/?m=cpYJYiRJycw\nAl Barsha: https://my.matterport.com/show/?m=DrJ1JsW8as9",
    source: "image"
  }
];

export function getSeedScripts() {
  return seedScripts;
}
