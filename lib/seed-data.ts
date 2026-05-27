import type { Country, ScriptLanguage } from "@prisma/client";

export type SeedScript = {
  key: string;
  title: string;
  category: string;
  country: Country;
  language: ScriptLanguage;
  body: string;
  source?: string;
  sortOrder?: number;
};

export const seedScripts: SeedScript[] = [
  {
    key: "quick-welcome-ksa-ar",
    title: "ترحيب",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 أهلاً وسهلاً، معك {{employeeName}} من بيورجيم، كيف أقدر أساعدك؟",
    source: "quick",
    sortOrder: 10
  },
  {
    key: "quick-welcome-ksa-en",
    title: "Welcome",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 Hello, this is {{employeeName}} from PureGym. How can I assist you?",
    source: "quick",
    sortOrder: 20
  },
  {
    key: "quick-welcome-uae-ar",
    title: "ترحيب",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 أهلاً وسهلاً، معك {{employeeName}} من بيورجيم، كيف أقدر أساعدك؟",
    source: "quick",
    sortOrder: 30
  },
  {
    key: "quick-welcome-uae-en",
    title: "Welcome",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 Hello, this is {{employeeName}} from PureGym. How can I assist you?",
    source: "quick",
    sortOrder: 40
  },
  {
    key: "quick-salam-ksa-ar",
    title: "رد السلام",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً.",
    source: "quick",
    sortOrder: 50
  },
  {
    key: "quick-salam-ksa-en",
    title: "Salam reply",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 Hello and welcome.",
    source: "quick",
    sortOrder: 60
  },
  {
    key: "quick-salam-uae-ar",
    title: "رد السلام",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً.",
    source: "quick",
    sortOrder: 70
  },
  {
    key: "quick-salam-uae-en",
    title: "Salam reply",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 Hello and welcome.",
    source: "quick",
    sortOrder: 80
  },
  {
    key: "quick-wait-ksa-ar",
    title: "لحظات من فضلك",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 ولا يهمك، لحظات من فضلك 🙏",
    source: "quick",
    sortOrder: 90
  },
  {
    key: "quick-wait-ksa-en",
    title: "Please wait",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 No worries, please allow me a moment 🙏",
    source: "quick",
    sortOrder: 100
  },
  {
    key: "quick-wait-uae-ar",
    title: "لحظات من فضلك",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 ولا يهمك، لحظات من فضلك 🙏",
    source: "quick",
    sortOrder: 110
  },
  {
    key: "quick-wait-uae-en",
    title: "Please wait",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 No worries, please allow me a moment 🙏",
    source: "quick",
    sortOrder: 120
  },
  {
    key: "quick-membership-info-ksa-ar",
    title: "طلب بيانات العضوية",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال المرتبطين بالعضوية لنتمكن من خدمتك بشكل أفضل 🙏",
    source: "quick",
    sortOrder: 130
  },
  {
    key: "quick-membership-info-ksa-en",
    title: "Request membership details",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 Kindly provide the email address and mobile number linked to the membership so we can assist you better 🙏",
    source: "quick",
    sortOrder: 140
  },
  {
    key: "quick-membership-info-uae-ar",
    title: "طلب بيانات العضوية",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال المرتبطين بالعضوية لنتمكن من خدمتك بشكل أفضل 🙏",
    source: "quick",
    sortOrder: 150
  },
  {
    key: "quick-membership-info-uae-en",
    title: "Request membership details",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 Kindly provide the email address and mobile number linked to the membership so we can assist you better 🙏",
    source: "quick",
    sortOrder: 160
  },
  {
    key: "quick-cancel-info-ksa-ar",
    title: "طلب بيانات الإلغاء",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 يرجى تزويدنا بالبريد الإلكتروني، رقم الجوال، رقم الهوية، والاسم المرتبط بعضويتك لنتمكن من مساعدتك في طلب الإلغاء 🙏",
    source: "quick",
    sortOrder: 170
  },
  {
    key: "quick-cancel-info-ksa-en",
    title: "Cancellation details request",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 Kindly provide the email address, mobile number, ID number, and name linked to the membership so we can assist you with the cancellation request 🙏",
    source: "quick",
    sortOrder: 180
  },
  {
    key: "quick-cancel-info-uae-ar",
    title: "طلب بيانات الإلغاء",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 يرجى تزويدنا بالبريد الإلكتروني، رقم الجوال، رقم الهوية، والاسم المرتبط بعضويتك لنتمكن من مساعدتك في طلب الإلغاء 🙏",
    source: "quick",
    sortOrder: 190
  },
  {
    key: "quick-cancel-info-uae-en",
    title: "Cancellation details request",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 Kindly provide the email address, mobile number, ID number, and name linked to the membership so we can assist you with the cancellation request 🙏",
    source: "quick",
    sortOrder: 200
  },
  {
    key: "quick-anything-ksa-ar",
    title: "استفسار آخر",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 هل يوجد أي خدمة أو استفسار آخر أقدر أساعدك فيه؟ 🙏",
    source: "quick",
    sortOrder: 210
  },
  {
    key: "quick-anything-ksa-en",
    title: "Anything else",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 Is there anything else I can assist you with? 🙏",
    source: "quick",
    sortOrder: 220
  },
  {
    key: "quick-anything-uae-ar",
    title: "استفسار آخر",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 هل يوجد أي خدمة أو استفسار آخر أقدر أساعدك فيه؟ 🙏",
    source: "quick",
    sortOrder: 230
  },
  {
    key: "quick-anything-uae-en",
    title: "Anything else",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 Is there anything else I can assist you with? 🙏",
    source: "quick",
    sortOrder: 240
  },
  {
    key: "quick-still-ksa-ar",
    title: "هل ما زلت معنا؟",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 هل ما زلت معنا؟ أنا هنا لأي استفسار 🙏",
    source: "quick",
    sortOrder: 250
  },
  {
    key: "quick-still-ksa-en",
    title: "Still with us",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 Are you still with us? I’m here if you have any questions 🙏",
    source: "quick",
    sortOrder: 260
  },
  {
    key: "quick-still-uae-ar",
    title: "هل ما زلت معنا؟",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 هل ما زلت معنا؟ أنا هنا لأي استفسار 🙏",
    source: "quick",
    sortOrder: 270
  },
  {
    key: "quick-still-uae-en",
    title: "Still with us",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 Are you still with us? I’m here if you have any questions 🙏",
    source: "quick",
    sortOrder: 280
  },
  {
    key: "quick-busy-ksa-ar",
    title: "الوقت غير مناسب",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 يبدو أن الوقت غير مناسب حاليًا، سيتم إنهاء المحادثة الآن، ويمكنك الرجوع لنا بأي وقت 🙏",
    source: "quick",
    sortOrder: 290
  },
  {
    key: "quick-busy-ksa-en",
    title: "Not a convenient time",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 It seems this may not be a convenient time. The chat will be closed for now, and you can reach out to us anytime 🙏",
    source: "quick",
    sortOrder: 300
  },
  {
    key: "quick-busy-uae-ar",
    title: "الوقت غير مناسب",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 يبدو أن الوقت غير مناسب حاليًا، سيتم إنهاء المحادثة الآن، ويمكنك الرجوع لنا بأي وقت 🙏",
    source: "quick",
    sortOrder: 310
  },
  {
    key: "quick-busy-uae-en",
    title: "Not a convenient time",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 It seems this may not be a convenient time. The chat will be closed for now, and you can reach out to us anytime 🙏",
    source: "quick",
    sortOrder: 320
  },
  {
    key: "quick-close-no-reply-ksa-ar",
    title: "إغلاق بسبب عدم الرد",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 سيتم إنهاء المحادثة بسبب عدم وجود رد، نشكرك على تواصلك معنا، ونسعد بتقييمك لتجربتك 🌸",
    source: "quick",
    sortOrder: 330
  },
  {
    key: "quick-close-no-reply-ksa-en",
    title: "Close due to no response",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 The chat will be closed due to no response.\nThank you for contacting us, and we’d appreciate your feedback 🌸",
    source: "quick",
    sortOrder: 340
  },
  {
    key: "quick-close-no-reply-uae-ar",
    title: "إغلاق بسبب عدم الرد",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 سيتم إنهاء المحادثة بسبب عدم وجود رد، نشكرك على تواصلك معنا، ونسعد بتقييمك لتجربتك 🌸",
    source: "quick",
    sortOrder: 350
  },
  {
    key: "quick-close-no-reply-uae-en",
    title: "Close due to no response",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 The chat will be closed due to no response.\nThank you for contacting us, and we’d appreciate your feedback 🌸",
    source: "quick",
    sortOrder: 360
  },
  {
    key: "quick-end-ksa-ar",
    title: "إنهاء الخدمة",
    category: "Quick Scripts",
    country: "KSA",
    language: "AR",
    body: "💚 سعدنا بخدمتك، شكرًا لتواصلك معنا 🙏\nراح أترك لك رابط التقييم، ونسعد بمشاركتك لتجربتك 🌸",
    source: "quick",
    sortOrder: 370
  },
  {
    key: "quick-end-ksa-en",
    title: "End service",
    category: "Quick Scripts",
    country: "KSA",
    language: "EN",
    body: "💚 It was a pleasure assisting you 🙏\nWe appreciate your feedback and would be happy to hear about your experience 🌸",
    source: "quick",
    sortOrder: 380
  },
  {
    key: "quick-end-uae-ar",
    title: "إنهاء الخدمة",
    category: "Quick Scripts",
    country: "UAE",
    language: "AR",
    body: "💙 سعدنا بخدمتك، شكرًا لتواصلك معنا 🙏\nراح أترك لك رابط التقييم، ونسعد بمشاركتك لتجربتك 🌸",
    source: "quick",
    sortOrder: 390
  },
  {
    key: "quick-end-uae-en",
    title: "End service",
    category: "Quick Scripts",
    country: "UAE",
    language: "EN",
    body: "💙 It was a pleasure assisting you 🙏\nWe appreciate your feedback and would be happy to hear about your experience 🌸",
    source: "quick",
    sortOrder: 400
  },
  {
    key: "cancel-reason-ksa-ar",
    title: "سؤال سبب الإلغاء",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 قبل إتمام الطلب، ممكن توضح لنا سبب رغبتك في إلغاء العضوية؟ ملاحظتك تهمنا وتساعدنا نحسّن تجربتك معنا.",
    source: "clean-v2",
    sortOrder: 410
  },
  {
    key: "cancel-reason-ksa-en",
    title: "Cancellation reason",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 Before proceeding, could you please share the reason for cancelling your membership? Your feedback is important and helps us improve your experience.",
    source: "clean-v2",
    sortOrder: 420
  },
  {
    key: "cancel-reason-uae-ar",
    title: "سؤال سبب الإلغاء",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 قبل إتمام الطلب، ممكن توضح لنا سبب رغبتك في إلغاء العضوية؟ ملاحظتك تهمنا وتساعدنا نحسّن تجربتك معنا.",
    source: "clean-v2",
    sortOrder: 430
  },
  {
    key: "cancel-reason-uae-en",
    title: "Cancellation reason",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 Before proceeding, could you please share the reason for cancelling your membership? Your feedback is important and helps us improve your experience.",
    source: "clean-v2",
    sortOrder: 440
  },
  {
    key: "cancel-done-ksa-ar",
    title: "إيقاف التجديد التلقائي - مكتمل",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 تم إيقاف التجديد التلقائي لعضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: \n• رقم الجوال: \n\nستبقى عضويتك فعالة حتى 00-00-2020، ولن يتم خصم أي مبلغ بعد ذلك.\n\nيمكنك متابعة حالة عضويتك عبر التطبيق وستظهر كغير فعالة بعد تاريخ الانتهاء.",
    source: "clean-v2",
    sortOrder: 450
  },
  {
    key: "cancel-done-ksa-en",
    title: "Cancel auto-renewal - Completed",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 The auto-renewal for your [Membership Type] membership has been successfully stopped.\n\nAccount details:\n• Email: \n• Mobile number: \n\nYour membership will remain active until 00-00-2020, and no further charges will be applied after that.\n\nYou can track your membership through the app, and it will show as inactive after the end date.",
    source: "clean-v2",
    sortOrder: 460
  },
  {
    key: "cancel-done-uae-ar",
    title: "إيقاف التجديد التلقائي - مكتمل",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 تم إيقاف التجديد التلقائي لعضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: \n• رقم الجوال: \n\nستبقى عضويتك فعالة حتى 00-00-2020، ولن يتم خصم أي مبلغ بعد ذلك.\n\nيمكنك متابعة حالة عضويتك عبر التطبيق وستظهر كغير فعالة بعد تاريخ الانتهاء.",
    source: "clean-v2",
    sortOrder: 470
  },
  {
    key: "cancel-done-uae-en",
    title: "Cancel auto-renewal - Completed",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 The auto-renewal for your [Membership Type] membership has been successfully stopped.\n\nAccount details:\n• Email: \n• Mobile number: \n\nYour membership will remain active until 00-00-2020, and no further charges will be applied after that.\n\nYou can track your membership through the app, and it will show as inactive after the end date.",
    source: "clean-v2",
    sortOrder: 480
  },
  {
    key: "cancel-too-late-ksa-ar",
    title: "لا يمكن الإلغاء الآن",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 نعتذر، لا يمكن إلغاء العضوية حاليًا لأن الطلب وصل خلال أقل من 48 ساعة قبل موعد التجديد حسب الشروط والأحكام.\n\nسيتم محاولة السحب بتاريخ 00-00-2020 في أواخر ساعات الليل. في حال فشل الدفع سيتم تعليق العضوية مؤقتًا، ثم تتم إعادة المحاولة بعد 10 أيام. وإذا فشلت المحاولة الثانية، سيتم إلغاء العضوية تلقائيًا.",
    source: "clean-v2",
    sortOrder: 490
  },
  {
    key: "cancel-too-late-ksa-en",
    title: "Too late to cancel",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 We’re sorry, the membership cannot be cancelled at this time because the request was received less than 48 hours before the renewal date, as per the terms and conditions.\n\nA payment attempt will be made on 00-00-2020 late at night. If the payment fails, the membership will be temporarily suspended, then another attempt will be made after 10 days. If the second attempt fails, the membership will be cancelled automatically.",
    source: "clean-v2",
    sortOrder: 500
  },
  {
    key: "cancel-too-late-uae-ar",
    title: "لا يمكن الإلغاء الآن",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 نعتذر، لا يمكن إلغاء العضوية حاليًا لأن الطلب وصل خلال أقل من 48 ساعة قبل موعد التجديد حسب الشروط والأحكام.\n\nسيتم محاولة السحب بتاريخ 00-00-2020 في أواخر ساعات الليل. في حال فشل الدفع سيتم تعليق العضوية مؤقتًا، ثم تتم إعادة المحاولة بعد 10 أيام. وإذا فشلت المحاولة الثانية، سيتم إلغاء العضوية تلقائيًا.",
    source: "clean-v2",
    sortOrder: 510
  },
  {
    key: "cancel-too-late-uae-en",
    title: "Too late to cancel",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 We’re sorry, the membership cannot be cancelled at this time because the request was received less than 48 hours before the renewal date, as per the terms and conditions.\n\nA payment attempt will be made on 00-00-2020 late at night. If the payment fails, the membership will be temporarily suspended, then another attempt will be made after 10 days. If the second attempt fails, the membership will be cancelled automatically.",
    source: "clean-v2",
    sortOrder: 520
  },
  {
    key: "payment-failed-suspended-ksa-ar",
    title: "فشل الدفع والعضوية معلقة",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 نعتذر، لا يمكن إلغاء العضوية في الوقت الحالي لأن عملية التجديد فشلت والعضوية معلقة.\n\nسيتم إعادة محاولة الدفع بعد 10 أيام من تاريخ الدفعة الفائتة. في حال فشلت المحاولة الثانية سيتم إلغاء العضوية تلقائيًا.",
    source: "clean-v2",
    sortOrder: 530
  },
  {
    key: "payment-failed-suspended-ksa-en",
    title: "Payment failed and membership suspended",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 We’re sorry, the membership cannot be cancelled at this time because the renewal payment failed and the membership is currently suspended.\n\nA second payment attempt will be made 10 days after the missed payment date. If the second attempt fails, the membership will be cancelled automatically.",
    source: "clean-v2",
    sortOrder: 540
  },
  {
    key: "payment-failed-suspended-uae-ar",
    title: "فشل الدفع والعضوية معلقة",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 نعتذر، لا يمكن إلغاء العضوية في الوقت الحالي لأن عملية التجديد فشلت والعضوية معلقة.\n\nسيتم إعادة محاولة الدفع بعد 10 أيام من تاريخ الدفعة الفائتة. في حال فشلت المحاولة الثانية سيتم إلغاء العضوية تلقائيًا.",
    source: "clean-v2",
    sortOrder: 550
  },
  {
    key: "payment-failed-suspended-uae-en",
    title: "Payment failed and membership suspended",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 We’re sorry, the membership cannot be cancelled at this time because the renewal payment failed and the membership is currently suspended.\n\nA second payment attempt will be made 10 days after the missed payment date. If the second attempt fails, the membership will be cancelled automatically.",
    source: "clean-v2",
    sortOrder: 560
  },
  {
    key: "ret-freeze-ksa-ar",
    title: "عرض تجميد شهر بدل الإلغاء",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 قبل إتمام الإلغاء، نقدر نعرض عليك تجميد العضوية مجانًا لمدة شهر بدل الإلغاء، حتى ترجع للتمرين بدون رسوم تسجيل جديدة. هل يناسبك هذا الخيار؟",
    source: "clean-v2",
    sortOrder: 570
  },
  {
    key: "ret-freeze-ksa-en",
    title: "Retention - one month freeze",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 Before proceeding with cancellation, we can offer to freeze your membership for one month for free instead, so you can return without paying a new joining fee. Would this option work for you?",
    source: "clean-v2",
    sortOrder: 580
  },
  {
    key: "ret-freeze-uae-ar",
    title: "عرض تجميد شهر بدل الإلغاء",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 قبل إتمام الإلغاء، نقدر نعرض عليك تجميد العضوية مجانًا لمدة شهر بدل الإلغاء، حتى ترجع للتمرين بدون رسوم تسجيل جديدة. هل يناسبك هذا الخيار؟",
    source: "clean-v2",
    sortOrder: 590
  },
  {
    key: "ret-freeze-uae-en",
    title: "Retention - one month freeze",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 Before proceeding with cancellation, we can offer to freeze your membership for one month for free instead, so you can return without paying a new joining fee. Would this option work for you?",
    source: "clean-v2",
    sortOrder: 600
  },
  {
    key: "ret-transfer-ksa-ar",
    title: "نقل العضوية لفرع آخر",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 إذا سبب الإلغاء هو تغيير مكان السكن أو صعوبة الوصول للفرع الحالي، نقدر نتحقق من إمكانية نقل العضوية إلى فرع أنسب لك بدل الإلغاء.",
    source: "clean-v2",
    sortOrder: 610
  },
  {
    key: "ret-transfer-ksa-en",
    title: "Retention - branch transfer",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 If the reason for cancellation is a change of location or difficulty reaching your current gym, we can check whether transferring your membership to a more suitable branch is possible instead of cancelling.",
    source: "clean-v2",
    sortOrder: 620
  },
  {
    key: "ret-transfer-uae-ar",
    title: "نقل العضوية لفرع آخر",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 إذا سبب الإلغاء هو تغيير مكان السكن أو صعوبة الوصول للفرع الحالي، نقدر نتحقق من إمكانية نقل العضوية إلى فرع أنسب لك بدل الإلغاء.",
    source: "clean-v2",
    sortOrder: 630
  },
  {
    key: "ret-transfer-uae-en",
    title: "Retention - branch transfer",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 If the reason for cancellation is a change of location or difficulty reaching your current gym, we can check whether transferring your membership to a more suitable branch is possible instead of cancelling.",
    source: "clean-v2",
    sortOrder: 640
  },
  {
    key: "ret-plus-ksa-ar",
    title: "ترقية العضوية إلى بلس",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 إذا تحتاج مرونة أكثر، ممكن تكون عضوية Plus خيار أفضل بدل الإلغاء، لأنها تمنحك مزايا أكثر مثل دخول فروع إضافية وBring a Friend حسب نوع العضوية.",
    source: "clean-v2",
    sortOrder: 650
  },
  {
    key: "ret-plus-ksa-en",
    title: "Retention - Plus upgrade",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 If you need more flexibility, upgrading to Plus may be a better option than cancelling, as it gives you additional benefits such as access to more branches and Bring a Friend, depending on your membership type.",
    source: "clean-v2",
    sortOrder: 660
  },
  {
    key: "ret-plus-uae-ar",
    title: "ترقية العضوية إلى بلس",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 إذا تحتاج مرونة أكثر، ممكن تكون عضوية Plus خيار أفضل بدل الإلغاء، لأنها تمنحك مزايا أكثر مثل دخول فروع إضافية وBring a Friend حسب نوع العضوية.",
    source: "clean-v2",
    sortOrder: 670
  },
  {
    key: "ret-plus-uae-en",
    title: "Retention - Plus upgrade",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 If you need more flexibility, upgrading to Plus may be a better option than cancelling, as it gives you additional benefits such as access to more branches and Bring a Friend, depending on your membership type.",
    source: "clean-v2",
    sortOrder: 680
  },
  {
    key: "ret-pt-ksa-ar",
    title: "جلسة تدريب شخصي مجانية",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 قبل الإلغاء، نقدر نرفع طلب للاستفادة من جلسة تدريب شخصي مجانية حسب المتاح لتحسين تجربتك داخل النادي.",
    source: "clean-v2",
    sortOrder: 690
  },
  {
    key: "ret-pt-ksa-en",
    title: "Retention - free PT session",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 Before cancelling, we can raise a request for a free personal training session, subject to availability, to help improve your experience at the gym.",
    source: "clean-v2",
    sortOrder: 700
  },
  {
    key: "ret-pt-uae-ar",
    title: "جلسة تدريب شخصي مجانية",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 قبل الإلغاء، نقدر نرفع طلب للاستفادة من جلسة تدريب شخصي مجانية حسب المتاح لتحسين تجربتك داخل النادي.",
    source: "clean-v2",
    sortOrder: 710
  },
  {
    key: "ret-pt-uae-en",
    title: "Retention - free PT session",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 Before cancelling, we can raise a request for a free personal training session, subject to availability, to help improve your experience at the gym.",
    source: "clean-v2",
    sortOrder: 720
  },
  {
    key: "ret-family-ksa-ar",
    title: "نقل العضوية لأحد أفراد العائلة",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 إذا سبب الإلغاء هو السفر أو عدم القدرة على استخدام العضوية، نقدر نتحقق من إمكانية نقلها لأحد أفراد العائلة حسب الشروط بدل الإلغاء.",
    source: "clean-v2",
    sortOrder: 730
  },
  {
    key: "ret-family-ksa-en",
    title: "Retention - family transfer",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 If the cancellation reason is travel or inability to use the membership, we can check whether it can be transferred to a family member, subject to the terms, instead of cancelling.",
    source: "clean-v2",
    sortOrder: 740
  },
  {
    key: "ret-family-uae-ar",
    title: "نقل العضوية لأحد أفراد العائلة",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 إذا سبب الإلغاء هو السفر أو عدم القدرة على استخدام العضوية، نقدر نتحقق من إمكانية نقلها لأحد أفراد العائلة حسب الشروط بدل الإلغاء.",
    source: "clean-v2",
    sortOrder: 750
  },
  {
    key: "ret-family-uae-en",
    title: "Retention - family transfer",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 If the cancellation reason is travel or inability to use the membership, we can check whether it can be transferred to a family member, subject to the terms, instead of cancelling.",
    source: "clean-v2",
    sortOrder: 760
  },
  {
    key: "chargeback-block-ksa-ar",
    title: "إلغاء وحظر العضوية بسبب بلاغ سحب",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "AR",
    body: "💚 نود إعلامك بأنه تم إلغاء عضويتك وحظرها اعتبارًا من 00-00-2020 بسبب الإبلاغ عن عملية سحب قمنا بمعالجتها، وقد تم رد المبلغ من قبل البنك.\n\nنود التنويه إلى أن عمليات السحب تتم باسم شركة اكتمال الرياضية. إذا كنت ترغب بإعادة الانضمام، يرجى تأكيد عدم الإبلاغ عن أي عملية سحب مستقبلية والالتزام بدفع المبلغ الذي تم استرجاعه مرة أخرى.\n\nإعادة الانضمام تتطلب دفع رسوم العضوية الجديدة بالإضافة إلى رسوم الانضمام، كما سيتم إصدار فاتورة بالمبلغ الذي تم الإبلاغ عنه لدفعه.\n\nإذا كنت موافقًا على هذه الشروط، يرجى إعلامنا حتى نتمكن من إخطار القسم المختص لرفع الحظر عن عضويتك، وبعدها يمكنك إعادة الانضمام.",
    source: "clean-v2",
    sortOrder: 770
  },
  {
    key: "chargeback-block-ksa-en",
    title: "Chargeback block and rejoin terms",
    category: "Cancellation & Retention",
    country: "KSA",
    language: "EN",
    body: "💚 We would like to inform you that your membership was cancelled and blocked as of 00-00-2020 because a payment processed by us was reported, and the amount was refunded by the bank.\n\nPlease note that payments are processed under Ektimal Sports Company. If you would like to rejoin, please confirm that you will not report any future payments and that you agree to repay the refunded amount.\n\nRejoining will require paying the new membership fee and the joining fee. Once your membership is reactivated, an invoice will also be issued for the reported amount.\n\nIf you agree to these terms, please let us know so we can notify the concerned team to lift the block on your membership, allowing you to rejoin.",
    source: "clean-v2",
    sortOrder: 780
  },
  {
    key: "chargeback-block-uae-ar",
    title: "إلغاء وحظر العضوية بسبب بلاغ سحب",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "AR",
    body: "💙 نود إعلامك بأنه تم إلغاء عضويتك وحظرها اعتبارًا من 00-00-2020 بسبب الإبلاغ عن عملية سحب قمنا بمعالجتها، وقد تم رد المبلغ من قبل البنك.\n\nنود التنويه إلى أن عمليات السحب تتم باسم شركة اكتمال الرياضية. إذا كنت ترغب بإعادة الانضمام، يرجى تأكيد عدم الإبلاغ عن أي عملية سحب مستقبلية والالتزام بدفع المبلغ الذي تم استرجاعه مرة أخرى.\n\nإعادة الانضمام تتطلب دفع رسوم العضوية الجديدة بالإضافة إلى رسوم الانضمام، كما سيتم إصدار فاتورة بالمبلغ الذي تم الإبلاغ عنه لدفعه.\n\nإذا كنت موافقًا على هذه الشروط، يرجى إعلامنا حتى نتمكن من إخطار القسم المختص لرفع الحظر عن عضويتك، وبعدها يمكنك إعادة الانضمام.",
    source: "clean-v2",
    sortOrder: 790
  },
  {
    key: "chargeback-block-uae-en",
    title: "Chargeback block and rejoin terms",
    category: "Cancellation & Retention",
    country: "UAE",
    language: "EN",
    body: "💙 We would like to inform you that your membership was cancelled and blocked as of 00-00-2020 because a payment processed by us was reported, and the amount was refunded by the bank.\n\nPlease note that payments are processed under Ektimal Sports Company. If you would like to rejoin, please confirm that you will not report any future payments and that you agree to repay the refunded amount.\n\nRejoining will require paying the new membership fee and the joining fee. Once your membership is reactivated, an invoice will also be issued for the reported amount.\n\nIf you agree to these terms, please let us know so we can notify the concerned team to lift the block on your membership, allowing you to rejoin.",
    source: "clean-v2",
    sortOrder: 800
  },
  {
    key: "ksa-core-monthly-ar",
    title: "كور شهري - 30 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية كور الشهرية تشمل 8 أيام تجميد مجانية لكل 30 يوم. إذا احتجت مدة أكثر من 8 أيام، يتم احتساب رسوم 39 ريال لكل 30 يوم إضافي.",
    source: "freeze-policy",
    sortOrder: 810
  },
  {
    key: "ksa-core-monthly-en",
    title: "Core Monthly - 30 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Core monthly membership includes 8 free freeze days every 30 days. If you need more than 8 days, a fee of SAR 39 applies for each additional 30-day period.",
    source: "freeze-policy",
    sortOrder: 820
  },
  {
    key: "ksa-core-3-ar",
    title: "كور 3 شهور - 90 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية كور 3 شهور تشمل 22 يوم تجميد مجاني خلال مدة العضوية. الحد الأدنى للتجميد 11 يوم، وبعد استخدام التجميد المجاني يتم احتساب 39 ريال لكل 30 يوم إضافي.",
    source: "freeze-policy",
    sortOrder: 830
  },
  {
    key: "ksa-core-3-en",
    title: "Core 3 Months - 90 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Core 3-month membership includes 22 free freeze days during the membership period. The minimum freeze period is 11 days. After the free freeze allowance is used, SAR 39 applies for each additional 30-day period.",
    source: "freeze-policy",
    sortOrder: 840
  },
  {
    key: "ksa-core-4-ar",
    title: "كور 4 شهور - 120 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية كور 4 شهور تشمل 30 يوم تجميد مجاني خلال مدة العضوية. الحد الأدنى للتجميد 15 يوم، وبعد استخدام التجميد المجاني يتم احتساب 39 ريال لكل 30 يوم إضافي.",
    source: "freeze-policy",
    sortOrder: 850
  },
  {
    key: "ksa-core-4-en",
    title: "Core 4 Months - 120 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Core 4-month membership includes 30 free freeze days during the membership period. The minimum freeze period is 15 days. After the free freeze allowance is used, SAR 39 applies for each additional 30-day period.",
    source: "freeze-policy",
    sortOrder: 860
  },
  {
    key: "ksa-core-6-ar",
    title: "كور 6 شهور - 180 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية كور 6 شهور تشمل 45 يوم تجميد مجاني خلال مدة العضوية. الحد الأدنى للتجميد 15 يوم، وبعد استخدام التجميد المجاني يتم احتساب 39 ريال لكل 30 يوم إضافي.",
    source: "freeze-policy",
    sortOrder: 870
  },
  {
    key: "ksa-core-6-en",
    title: "Core 6 Months - 180 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Core 6-month membership includes 45 free freeze days during the membership period. The minimum freeze period is 15 days. After the free freeze allowance is used, SAR 39 applies for each additional 30-day period.",
    source: "freeze-policy",
    sortOrder: 880
  },
  {
    key: "ksa-core-12-ar",
    title: "كور 12 شهر - 365 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية كور 12 شهر تشمل 91 يوم تجميد مجاني بالسنة. الحد الأدنى للتجميد 15 يوم، وبعد استخدام التجميد المجاني يتم احتساب 49 ريال لكل 30 يوم إضافي.",
    source: "freeze-policy",
    sortOrder: 890
  },
  {
    key: "ksa-core-12-en",
    title: "Core 12 Months - 365 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Core 12-month membership includes 91 free freeze days per year. The minimum freeze period is 15 days. After the free freeze allowance is used, SAR 49 applies for each additional 30-day period.",
    source: "freeze-policy",
    sortOrder: 900
  },
  {
    key: "ksa-plus-monthly-ar",
    title: "بلس شهري - 30 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية بلس الشهرية تشمل حتى 91 يوم تجميد مجاني يمكن استخدامها على فترات خلال الاشتراك، والحد الأدنى للتجميد 15 يوم. لا توجد رسوم طالما لم يتم تجاوز الحد. عند تجاوز 91 يوم، يتم احتساب 39 ريال لكل 30 يوم إضافي.",
    source: "freeze-policy",
    sortOrder: 910
  },
  {
    key: "ksa-plus-monthly-en",
    title: "Plus Monthly - 30 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Plus monthly membership includes up to 91 free freeze days that can be used in periods during the subscription. The minimum freeze period is 15 days. There are no fees as long as the limit is not exceeded. If you exceed 91 days, SAR 39 applies for each additional 30-day period.",
    source: "freeze-policy",
    sortOrder: 920
  },
  {
    key: "ksa-plus-3-ar",
    title: "بلس 3 شهور - 90 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية بلس 3 شهور تشمل 22 يوم تجميد مجاني، ويمكن تقسيمها على مرتين كل مرة 11 يوم. أي تجميد إضافي يتم احتسابه برسوم 39 ريال لكل 30 يوم.",
    source: "freeze-policy",
    sortOrder: 930
  },
  {
    key: "ksa-plus-3-en",
    title: "Plus 3 Months - 90 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Plus 3-month membership includes 22 free freeze days, which can be split into two periods of 11 days each. Any additional freeze is charged at SAR 39 per 30 days.",
    source: "freeze-policy",
    sortOrder: 940
  },
  {
    key: "ksa-plus-4-ar",
    title: "بلس 4 شهور - 120 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية بلس 4 شهور تشمل 30 يوم تجميد مجاني، ويمكن تقسيمها على مرتين كل مرة 15 يوم. أي تجميد إضافي يتم احتسابه برسوم 39 ريال لكل 30 يوم.",
    source: "freeze-policy",
    sortOrder: 950
  },
  {
    key: "ksa-plus-4-en",
    title: "Plus 4 Months - 120 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Plus 4-month membership includes 30 free freeze days, which can be split into two periods of 15 days each. Any additional freeze is charged at SAR 39 per 30 days.",
    source: "freeze-policy",
    sortOrder: 960
  },
  {
    key: "ksa-plus-6-ar",
    title: "بلس 6 شهور - 180 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية بلس 6 شهور تشمل 45 يوم تجميد مجاني خلال مدة العضوية. يمكن استخدامها على فترات، والحد الأدنى للتجميد 15 يوم. عند تجاوز 45 يوم، يتم احتساب 39 ريال لكل 30 يوم إضافي.",
    source: "freeze-policy",
    sortOrder: 970
  },
  {
    key: "ksa-plus-6-en",
    title: "Plus 6 Months - 180 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Plus 6-month membership includes 45 free freeze days during the membership period. They can be used in multiple periods, with a minimum freeze of 15 days. If you exceed 45 days, SAR 39 applies for each additional 30-day period.",
    source: "freeze-policy",
    sortOrder: 980
  },
  {
    key: "ksa-plus-12-ar",
    title: "بلس 12 شهر - 365 يوم",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 عضوية بلس 12 شهر تشمل 91 يوم تجميد مجاني خلال السنة. يمكن تقسيمها واستخدامها حسب الحاجة، والحد الأدنى للتجميد 15 يوم. بعد انتهاء المدة المجانية، يتم احتساب 49 ريال لكل 30 يوم إضافي.",
    source: "freeze-policy",
    sortOrder: 990
  },
  {
    key: "ksa-plus-12-en",
    title: "Plus 12 Months - 365 Days",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Plus 12-month membership includes 91 free freeze days during the year. They can be split and used as needed, with a minimum freeze of 15 days. After the free allowance is used, SAR 49 applies for each additional 30-day period.",
    source: "freeze-policy",
    sortOrder: 1000
  },
  {
    key: "uae-core-monthly-ar",
    title: "كور شهري - الإمارات",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 عضوية كور الشهرية في الإمارات لا تشمل تجميد مجاني. يبدأ التجميد من تاريخ الدفع القادم ولكل شهر يتم تجميده حسب سياسة العضوية.",
    source: "freeze-policy",
    sortOrder: 1010
  },
  {
    key: "uae-core-monthly-en",
    title: "Core Monthly - UAE",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 UAE Core monthly membership does not include free freeze. The freeze starts from the next payment date, and the freeze is applied according to the membership policy.",
    source: "freeze-policy",
    sortOrder: 1020
  },
  {
    key: "uae-core-pif-ar",
    title: "كور محددة المدة - الإمارات",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 عضويات كور محددة المدة في الإمارات لا تشمل تجميد مجاني خلال 3، 4، 6، أو 12 شهر. يتم قبول التجميد الصحي فقط لمدة أقصاها 3 شهور بشرط أن يكون التقرير الطبي حديثًا.",
    source: "freeze-policy",
    sortOrder: 1030
  },
  {
    key: "uae-core-pif-en",
    title: "Core PIF - UAE",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 UAE Core fixed-term memberships do not include free freeze for 3, 4, 6, or 12 months. Medical freeze may be accepted for up to 3 months only, provided the medical report is recent.",
    source: "freeze-policy",
    sortOrder: 1040
  },
  {
    key: "uae-plus-monthly-ar",
    title: "بلس شهري - الإمارات",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 عضوية بلس الشهرية في الإمارات تشمل تجميد مجاني لمدة 3 شهور. يبدأ التجميد من تاريخ الدفع القادم.",
    source: "freeze-policy",
    sortOrder: 1050
  },
  {
    key: "uae-plus-monthly-en",
    title: "Plus Monthly - UAE",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 UAE Plus monthly membership includes up to 3 months of free freeze. The freeze starts from the next payment date.",
    source: "freeze-policy",
    sortOrder: 1060
  },
  {
    key: "uae-plus-3-ar",
    title: "بلس 3 شهور - الإمارات",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 عضوية بلس 3 شهور تشمل تجميد مجاني لمدة واحدة بحد أدنى 15 يوم، ولا يمكن تقسيمها أو تمديدها لفترة أكثر ضمن نفس الطلب.",
    source: "freeze-policy",
    sortOrder: 1070
  },
  {
    key: "uae-plus-3-en",
    title: "Plus 3 Months - UAE",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 UAE Plus 3-month membership includes one free freeze period with a minimum of 15 days. It cannot be split or extended for more within the same request.",
    source: "freeze-policy",
    sortOrder: 1080
  },
  {
    key: "uae-plus-4-ar",
    title: "بلس 4 شهور - الإمارات",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 عضوية بلس 4 شهور تشمل تجميد مجاني لمدة واحدة بحد أدنى 15 يوم، ولا يمكن تقسيمها أو تمديدها لفترة أكثر ضمن نفس الطلب.",
    source: "freeze-policy",
    sortOrder: 1090
  },
  {
    key: "uae-plus-4-en",
    title: "Plus 4 Months - UAE",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 UAE Plus 4-month membership includes one free freeze period with a minimum of 15 days. It cannot be split or extended for more within the same request.",
    source: "freeze-policy",
    sortOrder: 1100
  },
  {
    key: "uae-plus-6-ar",
    title: "بلس 6 شهور - الإمارات",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 عضوية بلس 6 شهور تشمل تجميد مجاني لمدة 45 يوم بحد أدنى 15 يوم.",
    source: "freeze-policy",
    sortOrder: 1110
  },
  {
    key: "uae-plus-6-en",
    title: "Plus 6 Months - UAE",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 UAE Plus 6-month membership includes 45 free freeze days with a minimum freeze period of 15 days.",
    source: "freeze-policy",
    sortOrder: 1120
  },
  {
    key: "uae-plus-12-ar",
    title: "بلس 12 شهر - الإمارات",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 عضوية بلس 12 شهر تشمل تجميد مجاني لمدة 90 يوم بحد أدنى 15 يوم.",
    source: "freeze-policy",
    sortOrder: 1130
  },
  {
    key: "uae-plus-12-en",
    title: "Plus 12 Months - UAE",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 UAE Plus 12-month membership includes 90 free freeze days with a minimum freeze period of 15 days.",
    source: "freeze-policy",
    sortOrder: 1140
  },
  {
    key: "freeze-complete-monthly-ksa-ar",
    title: "تجميد العضوية الشهرية - مكتمل",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 تم تجميد عضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: \n• رقم الجوال: \n\nفترة التجميد:\nمن 00-00-2020 إلى 00-00-2020، وموعد فاتورتك القادمة 00-00-2020 بقيمة [قيمة الدفعة القادمة].\n\nسيتم استئناف العضوية تلقائيًا بعد انتهاء فترة التجميد. يمكنك دائمًا متابعة تفاصيل عضويتك عبر التطبيق.",
    source: "clean-v2",
    sortOrder: 1150
  },
  {
    key: "freeze-complete-monthly-ksa-en",
    title: "Freeze monthly - Completed",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Your [Membership Type] membership has been successfully frozen.\n\nAccount details:\n• Email: \n• Mobile number: \n\nFreeze period:\nFrom 00-00-2020 to 00-00-2020. Your next billing date will be on 00-00-2020 with an amount of [Next Payment Amount].\n\nYour membership will automatically resume once the freeze period ends. You can always view your membership details through the app.",
    source: "clean-v2",
    sortOrder: 1160
  },
  {
    key: "freeze-complete-monthly-uae-ar",
    title: "تجميد العضوية الشهرية - مكتمل",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 تم تجميد عضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: \n• رقم الجوال: \n\nفترة التجميد:\nمن 00-00-2020 إلى 00-00-2020، وموعد فاتورتك القادمة 00-00-2020 بقيمة [قيمة الدفعة القادمة].\n\nسيتم استئناف العضوية تلقائيًا بعد انتهاء فترة التجميد. يمكنك دائمًا متابعة تفاصيل عضويتك عبر التطبيق.",
    source: "clean-v2",
    sortOrder: 1170
  },
  {
    key: "freeze-complete-monthly-uae-en",
    title: "Freeze monthly - Completed",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 Your [Membership Type] membership has been successfully frozen.\n\nAccount details:\n• Email: \n• Mobile number: \n\nFreeze period:\nFrom 00-00-2020 to 00-00-2020. Your next billing date will be on 00-00-2020 with an amount of [Next Payment Amount].\n\nYour membership will automatically resume once the freeze period ends. You can always view your membership details through the app.",
    source: "clean-v2",
    sortOrder: 1180
  },
  {
    key: "freeze-complete-pif-ksa-ar",
    title: "تجميد العضوية محددة المدة - مكتمل",
    category: "Freeze Policy",
    country: "KSA",
    language: "AR",
    body: "💚 تم تجميد عضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: \n• رقم الجوال: \n\nفترة التجميد:\nمن 00-00-2020 إلى 00-00-2020، وموعد انتهاء عضويتك الجديد في 00-00-2020.\n\nسيتم استئناف العضوية تلقائيًا بعد انتهاء فترة التجميد. يمكنك دائمًا متابعة تفاصيل عضويتك عبر التطبيق.",
    source: "clean-v2",
    sortOrder: 1190
  },
  {
    key: "freeze-complete-pif-ksa-en",
    title: "Freeze PIF - Completed",
    category: "Freeze Policy",
    country: "KSA",
    language: "EN",
    body: "💚 Your [Membership Type] membership has been successfully frozen.\n\nAccount details:\n• Email: \n• Mobile number: \n\nFreeze period:\nFrom 00-00-2020 to 00-00-2020, and your new membership expiry date will be 00-00-2020.\n\nYour membership will automatically resume once the freeze period ends. You can always view your membership details through the app.",
    source: "clean-v2",
    sortOrder: 1200
  },
  {
    key: "freeze-complete-pif-uae-ar",
    title: "تجميد العضوية محددة المدة - مكتمل",
    category: "Freeze Policy",
    country: "UAE",
    language: "AR",
    body: "💙 تم تجميد عضويتك [نوع العضوية] بنجاح.\n\nبيانات الحساب:\n• البريد الإلكتروني: \n• رقم الجوال: \n\nفترة التجميد:\nمن 00-00-2020 إلى 00-00-2020، وموعد انتهاء عضويتك الجديد في 00-00-2020.\n\nسيتم استئناف العضوية تلقائيًا بعد انتهاء فترة التجميد. يمكنك دائمًا متابعة تفاصيل عضويتك عبر التطبيق.",
    source: "clean-v2",
    sortOrder: 1210
  },
  {
    key: "freeze-complete-pif-uae-en",
    title: "Freeze PIF - Completed",
    category: "Freeze Policy",
    country: "UAE",
    language: "EN",
    body: "💙 Your [Membership Type] membership has been successfully frozen.\n\nAccount details:\n• Email: \n• Mobile number: \n\nFreeze period:\nFrom 00-00-2020 to 00-00-2020, and your new membership expiry date will be 00-00-2020.\n\nYour membership will automatically resume once the freeze period ends. You can always view your membership details through the app.",
    source: "clean-v2",
    sortOrder: 1220
  },
  {
    key: "payment-link-permission-ksa-ar",
    title: "طلب موافقة لإرسال رابط دفع",
    category: "Payment & Billing",
    country: "KSA",
    language: "AR",
    body: "💚 قبل إرسال رابط الدفع، هل توافق على استلام فاتورة إلكترونية لإتمام عملية الدفع؟ سيتم إرسالها إلى بريدك الإلكتروني من hyperbill@hyperpay.com.",
    source: "clean-v2",
    sortOrder: 1230
  },
  {
    key: "payment-link-permission-ksa-en",
    title: "Payment link permission",
    category: "Payment & Billing",
    country: "KSA",
    language: "EN",
    body: "💚 Before sending the payment link, do you agree to receive an electronic invoice to complete the payment? It will be sent to your email from hyperbill@hyperpay.com.",
    source: "clean-v2",
    sortOrder: 1240
  },
  {
    key: "payment-link-permission-uae-ar",
    title: "طلب موافقة لإرسال رابط دفع",
    category: "Payment & Billing",
    country: "UAE",
    language: "AR",
    body: "💙 قبل إرسال رابط الدفع، هل توافق على استلام فاتورة إلكترونية لإتمام عملية الدفع؟ سيتم إرسالها إلى بريدك الإلكتروني من hyperbill@hyperpay.com.",
    source: "clean-v2",
    sortOrder: 1250
  },
  {
    key: "payment-link-permission-uae-en",
    title: "Payment link permission",
    category: "Payment & Billing",
    country: "UAE",
    language: "EN",
    body: "💙 Before sending the payment link, do you agree to receive an electronic invoice to complete the payment? It will be sent to your email from hyperbill@hyperpay.com.",
    source: "clean-v2",
    sortOrder: 1260
  },
  {
    key: "payment-link-sent-ksa-ar",
    title: "إرسال رابط دفع",
    category: "Payment & Billing",
    country: "KSA",
    language: "AR",
    body: "💚 سيتم إرسال فاتورة إلكترونية من البريد التالي: hyperbill@hyperpay.com\nإلى بريدك الإلكتروني: \nوتتضمن الفاتورة رابطًا لإتمام عملية الدفع الخاصة بمبلغ [المبلغ].\n\nيرجى بعد الدفع التواصل معنا لإتمام طلبك.",
    source: "clean-v2",
    sortOrder: 1270
  },
  {
    key: "payment-link-sent-ksa-en",
    title: "Payment link sent",
    category: "Payment & Billing",
    country: "KSA",
    language: "EN",
    body: "💚 An electronic invoice will be sent from: hyperbill@hyperpay.com\nTo your email: \nThe invoice will include a payment link to complete the payment for the amount of [Amount].\n\nAfter payment, please contact us so we can complete your request.",
    source: "clean-v2",
    sortOrder: 1280
  },
  {
    key: "payment-link-sent-uae-ar",
    title: "إرسال رابط دفع",
    category: "Payment & Billing",
    country: "UAE",
    language: "AR",
    body: "💙 سيتم إرسال فاتورة إلكترونية من البريد التالي: hyperbill@hyperpay.com\nإلى بريدك الإلكتروني: \nوتتضمن الفاتورة رابطًا لإتمام عملية الدفع الخاصة بمبلغ [المبلغ].\n\nيرجى بعد الدفع التواصل معنا لإتمام طلبك.",
    source: "clean-v2",
    sortOrder: 1290
  },
  {
    key: "payment-link-sent-uae-en",
    title: "Payment link sent",
    category: "Payment & Billing",
    country: "UAE",
    language: "EN",
    body: "💙 An electronic invoice will be sent from: hyperbill@hyperpay.com\nTo your email: \nThe invoice will include a payment link to complete the payment for the amount of [Amount].\n\nAfter payment, please contact us so we can complete your request.",
    source: "clean-v2",
    sortOrder: 1300
  },
  {
    key: "paid-still-suspended-ksa-ar",
    title: "تم الدفع والعضوية ما زالت غير مفعلة",
    category: "Payment & Billing",
    country: "KSA",
    language: "AR",
    body: "💚 نعتذر عن ذلك. يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال المرتبطين بالعضوية، مع صورة أو رقم العملية إن وجد، حتى نتمكن من رفع الطلب للفريق المختص.",
    source: "clean-v2",
    sortOrder: 1310
  },
  {
    key: "paid-still-suspended-ksa-en",
    title: "Paid but membership still inactive",
    category: "Payment & Billing",
    country: "KSA",
    language: "EN",
    body: "💚 We apologize for that. Please provide the email address and mobile number linked to the membership, along with a payment screenshot or transaction ID if available, so we can escalate it to the concerned team.",
    source: "clean-v2",
    sortOrder: 1320
  },
  {
    key: "paid-still-suspended-uae-ar",
    title: "تم الدفع والعضوية ما زالت غير مفعلة",
    category: "Payment & Billing",
    country: "UAE",
    language: "AR",
    body: "💙 نعتذر عن ذلك. يرجى تزويدنا بالبريد الإلكتروني ورقم الجوال المرتبطين بالعضوية، مع صورة أو رقم العملية إن وجد، حتى نتمكن من رفع الطلب للفريق المختص.",
    source: "clean-v2",
    sortOrder: 1330
  },
  {
    key: "paid-still-suspended-uae-en",
    title: "Paid but membership still inactive",
    category: "Payment & Billing",
    country: "UAE",
    language: "EN",
    body: "💙 We apologize for that. Please provide the email address and mobile number linked to the membership, along with a payment screenshot or transaction ID if available, so we can escalate it to the concerned team.",
    source: "clean-v2",
    sortOrder: 1340
  },
  {
    key: "tabby-info-ksa-ar",
    title: "تابي",
    category: "Payment & Billing",
    country: "KSA",
    language: "AR",
    body: "💚 التقسيط عن طريق تابي متاح لبعض العضويات أو الباقات حسب الخيارات الظاهرة لك أثناء الدفع على الموقع.",
    source: "clean-v2",
    sortOrder: 1350
  },
  {
    key: "tabby-info-ksa-en",
    title: "Tabby",
    category: "Payment & Billing",
    country: "KSA",
    language: "EN",
    body: "💚 Tabby installments are available for selected memberships or packages depending on the options shown during checkout on the website.",
    source: "clean-v2",
    sortOrder: 1360
  },
  {
    key: "tabby-info-uae-ar",
    title: "تابي",
    category: "Payment & Billing",
    country: "UAE",
    language: "AR",
    body: "💙 التقسيط عن طريق تابي متاح لبعض العضويات أو الباقات حسب الخيارات الظاهرة لك أثناء الدفع على الموقع.",
    source: "clean-v2",
    sortOrder: 1370
  },
  {
    key: "tabby-info-uae-en",
    title: "Tabby",
    category: "Payment & Billing",
    country: "UAE",
    language: "EN",
    body: "💙 Tabby installments are available for selected memberships or packages depending on the options shown during checkout on the website.",
    source: "clean-v2",
    sortOrder: 1380
  },
  {
    key: "ticket-inactive-transaction-ksa-ar",
    title: "تذكرة: دفع ولم تتفعل العضوية - Transaction ID",
    category: "Tickets",
    country: "KSA",
    language: "AR",
    body: "💚 العضو دفع للاشتراك لكن العضوية ما زالت غير فعالة، يرجى التحقق واتخاذ اللازم من طرفكم.\n\nالتفاصيل المطلوبة:\nMembership type: Monthly Core / 3-Month Plus / Monthly Plus\nPaid amount: 278 SAR\nTransaction ID: AD-2ede12ed-9eaf-412b-97cb-5d5c1cc6bb5e\n\nشاكرين تعاونكم.",
    source: "tickets",
    sortOrder: 1390
  },
  {
    key: "ticket-inactive-transaction-ksa-en",
    title: "Ticket: Paid but inactive - Transaction ID",
    category: "Tickets",
    country: "KSA",
    language: "EN",
    body: "💚 The member paid to join but the membership is still inactive. Please check and do the needed from your side.\n\nNeeded details:\nMembership type: Monthly Core / 3-Month Plus / Monthly Plus\nPaid amount: 278 SAR\nTransaction ID: AD-2ede12ed-9eaf-412b-97cb-5d5c1cc6bb5e\n\nThanks in advance.",
    source: "tickets",
    sortOrder: 1400
  },
  {
    key: "ticket-inactive-card-ksa-ar",
    title: "تذكرة: دفع ولم تتفعل العضوية - Card details",
    category: "Tickets",
    country: "KSA",
    language: "AR",
    body: "💚 العضو دفع للاشتراك لكن العضوية ما زالت غير فعالة، يرجى التحقق واتخاذ اللازم من طرفكم.\n\nالتفاصيل المطلوبة:\nMembership type: Monthly Core / 3-Month Plus / Monthly Plus\nPaid amount: 278 SAR\nFirst 6 digits: 123456\nLast 4 digits: 1234\nCard Holder Name: [Card Holder Name]\n\nمرفق تقرير الدفع، يرجى التحقق من المشكلة واتخاذ اللازم. شاكرين تعاونكم.",
    source: "tickets",
    sortOrder: 1410
  },
  {
    key: "ticket-inactive-card-ksa-en",
    title: "Ticket: Paid but inactive - Card details",
    category: "Tickets",
    country: "KSA",
    language: "EN",
    body: "💚 The member paid to join but the membership is still inactive. Please check and do the needed from your side.\n\nNeeded details:\nMembership type: Monthly Core / 3-Month Plus / Monthly Plus\nPaid amount: 278 SAR\nFirst 6 digits: 123456\nLast 4 digits: 1234\nCard Holder Name: [Card Holder Name]\n\nAttached is the payment report. Please check the issue and do the needful from your side. Thanks in advance.",
    source: "tickets",
    sortOrder: 1420
  },
  {
    key: "ticket-inactive-transaction-uae-ar",
    title: "تذكرة: دفع ولم تتفعل العضوية - Transaction ID",
    category: "Tickets",
    country: "UAE",
    language: "AR",
    body: "💙 العضو دفع للاشتراك لكن العضوية ما زالت غير فعالة، يرجى التحقق واتخاذ اللازم من طرفكم.\n\nالتفاصيل المطلوبة:\nMembership type: Monthly Core / 3-Month Plus / Monthly Plus\nPaid amount: 278 AED\nTransaction ID: AD-2ede12ed-9eaf-412b-97cb-5d5c1cc6bb5e\n\nشاكرين تعاونكم.",
    source: "tickets",
    sortOrder: 1430
  },
  {
    key: "ticket-inactive-transaction-uae-en",
    title: "Ticket: Paid but inactive - Transaction ID",
    category: "Tickets",
    country: "UAE",
    language: "EN",
    body: "💙 The member paid to join but the membership is still inactive. Please check and do the needed from your side.\n\nNeeded details:\nMembership type: Monthly Core / 3-Month Plus / Monthly Plus\nPaid amount: 278 AED\nTransaction ID: AD-2ede12ed-9eaf-412b-97cb-5d5c1cc6bb5e\n\nThanks in advance.",
    source: "tickets",
    sortOrder: 1440
  },
  {
    key: "ticket-inactive-card-uae-ar",
    title: "تذكرة: دفع ولم تتفعل العضوية - Card details",
    category: "Tickets",
    country: "UAE",
    language: "AR",
    body: "💙 العضو دفع للاشتراك لكن العضوية ما زالت غير فعالة، يرجى التحقق واتخاذ اللازم من طرفكم.\n\nالتفاصيل المطلوبة:\nMembership type: Monthly Core / 3-Month Plus / Monthly Plus\nPaid amount: 278 AED\nFirst 6 digits: 123456\nLast 4 digits: 1234\nCard Holder Name: [Card Holder Name]\n\nمرفق تقرير الدفع، يرجى التحقق من المشكلة واتخاذ اللازم. شاكرين تعاونكم.",
    source: "tickets",
    sortOrder: 1450
  },
  {
    key: "ticket-inactive-card-uae-en",
    title: "Ticket: Paid but inactive - Card details",
    category: "Tickets",
    country: "UAE",
    language: "EN",
    body: "💙 The member paid to join but the membership is still inactive. Please check and do the needed from your side.\n\nNeeded details:\nMembership type: Monthly Core / 3-Month Plus / Monthly Plus\nPaid amount: 278 AED\nFirst 6 digits: 123456\nLast 4 digits: 1234\nCard Holder Name: [Card Holder Name]\n\nAttached is the payment report. Please check the issue and do the needful from your side. Thanks in advance.",
    source: "tickets",
    sortOrder: 1460
  },
  {
    key: "password-reset-ksa-ar",
    title: "إعادة تعيين كلمة السر",
    category: "App / Login / Password",
    country: "KSA",
    language: "AR",
    body: "💚 هل تسمح لي بإعادة تعيين كلمة السر لحسابك؟",
    source: "clean-v2",
    sortOrder: 1470
  },
  {
    key: "password-reset-ksa-en",
    title: "Password reset permission",
    category: "App / Login / Password",
    country: "KSA",
    language: "EN",
    body: "💚 Do I have your permission to reset the password for your account?",
    source: "clean-v2",
    sortOrder: 1480
  },
  {
    key: "password-reset-uae-ar",
    title: "إعادة تعيين كلمة السر",
    category: "App / Login / Password",
    country: "UAE",
    language: "AR",
    body: "💙 هل تسمح لي بإعادة تعيين كلمة السر لحسابك؟",
    source: "clean-v2",
    sortOrder: 1490
  },
  {
    key: "password-reset-uae-en",
    title: "Password reset permission",
    category: "App / Login / Password",
    country: "UAE",
    language: "EN",
    body: "💙 Do I have your permission to reset the password for your account?",
    source: "clean-v2",
    sortOrder: 1500
  },
  {
    key: "logout-login-ksa-ar",
    title: "تسجيل خروج ودخول",
    category: "App / Login / Password",
    country: "KSA",
    language: "AR",
    body: "💚 يرجى تسجيل الخروج من التطبيق ثم تسجيل الدخول مرة أخرى بنفس بيانات الحساب. هذا الإجراء لا يؤثر على عضويتك.",
    source: "clean-v2",
    sortOrder: 1510
  },
  {
    key: "logout-login-ksa-en",
    title: "Logout and login",
    category: "App / Login / Password",
    country: "KSA",
    language: "EN",
    body: "💚 Please log out of the app and log back in using the same account details. This will not affect your membership.",
    source: "clean-v2",
    sortOrder: 1520
  },
  {
    key: "logout-login-uae-ar",
    title: "تسجيل خروج ودخول",
    category: "App / Login / Password",
    country: "UAE",
    language: "AR",
    body: "💙 يرجى تسجيل الخروج من التطبيق ثم تسجيل الدخول مرة أخرى بنفس بيانات الحساب. هذا الإجراء لا يؤثر على عضويتك.",
    source: "clean-v2",
    sortOrder: 1530
  },
  {
    key: "logout-login-uae-en",
    title: "Logout and login",
    category: "App / Login / Password",
    country: "UAE",
    language: "EN",
    body: "💙 Please log out of the app and log back in using the same account details. This will not affect your membership.",
    source: "clean-v2",
    sortOrder: 1540
  },
  {
    key: "remove-friend-ksa-ar",
    title: "إزالة صديق",
    category: "Friend / Bring a Friend",
    country: "KSA",
    language: "AR",
    body: "💚 هل ترغب بإزالة الصديق [اسم الصديق] من عضويتك؟",
    source: "clean-v2",
    sortOrder: 1550
  },
  {
    key: "remove-friend-ksa-en",
    title: "Remove a friend",
    category: "Friend / Bring a Friend",
    country: "KSA",
    language: "EN",
    body: "💚 Would you like to remove [Friend Name] from your membership?",
    source: "clean-v2",
    sortOrder: 1560
  },
  {
    key: "remove-friend-uae-ar",
    title: "إزالة صديق",
    category: "Friend / Bring a Friend",
    country: "UAE",
    language: "AR",
    body: "💙 هل ترغب بإزالة الصديق [اسم الصديق] من عضويتك؟",
    source: "clean-v2",
    sortOrder: 1570
  },
  {
    key: "remove-friend-uae-en",
    title: "Remove a friend",
    category: "Friend / Bring a Friend",
    country: "UAE",
    language: "EN",
    body: "💙 Would you like to remove [Friend Name] from your membership?",
    source: "clean-v2",
    sortOrder: 1580
  },
  {
    key: "bring-friend-info-ksa-ar",
    title: "إضافة صديق",
    category: "Friend / Bring a Friend",
    country: "KSA",
    language: "AR",
    body: "💚 ميزة Bring a Friend تتيح لك إضافة صديق حسب مزايا عضويتك وشروطها. يرجى التأكد من توفر الميزة في عضويتك من خلال التطبيق.",
    source: "clean-v2",
    sortOrder: 1590
  },
  {
    key: "bring-friend-info-ksa-en",
    title: "Bring a Friend info",
    category: "Friend / Bring a Friend",
    country: "KSA",
    language: "EN",
    body: "💚 Bring a Friend allows you to add a friend according to your membership benefits and terms. Please check the app to confirm if this benefit is available on your membership.",
    source: "clean-v2",
    sortOrder: 1600
  },
  {
    key: "bring-friend-info-uae-ar",
    title: "إضافة صديق",
    category: "Friend / Bring a Friend",
    country: "UAE",
    language: "AR",
    body: "💙 ميزة Bring a Friend تتيح لك إضافة صديق حسب مزايا عضويتك وشروطها. يرجى التأكد من توفر الميزة في عضويتك من خلال التطبيق.",
    source: "clean-v2",
    sortOrder: 1610
  },
  {
    key: "bring-friend-info-uae-en",
    title: "Bring a Friend info",
    category: "Friend / Bring a Friend",
    country: "UAE",
    language: "EN",
    body: "💙 Bring a Friend allows you to add a friend according to your membership benefits and terms. Please check the app to confirm if this benefit is available on your membership.",
    source: "clean-v2",
    sortOrder: 1620
  },
  {
    key: "no-free-trial-ksa-ar",
    title: "التجربة المجانية",
    category: "Offers, Prices & PT",
    country: "KSA",
    language: "AR",
    body: "💚 لا نقدم تجارب مجانية، لكن نرحب بك لزيارة النادي وتلقي جولة من فريقنا. وإذا رغبت بتجربة النادي قبل الاشتراك، يمكنك شراء دخول ليوم واحد من خلال رابط الانضمام الرسمي.",
    source: "clean-v2",
    sortOrder: 1630
  },
  {
    key: "no-free-trial-ksa-en",
    title: "Free trial",
    category: "Offers, Prices & PT",
    country: "KSA",
    language: "EN",
    body: "💚 We do not offer free trials, but you are welcome to visit the gym and get a tour from our team. If you would like to try the gym before joining, you can purchase a day pass through the official join link.",
    source: "clean-v2",
    sortOrder: 1640
  },
  {
    key: "no-free-trial-uae-ar",
    title: "التجربة المجانية",
    category: "Offers, Prices & PT",
    country: "UAE",
    language: "AR",
    body: "💙 لا نقدم تجارب مجانية، لكن نرحب بك لزيارة النادي وتلقي جولة من فريقنا. وإذا رغبت بتجربة النادي قبل الاشتراك، يمكنك شراء دخول ليوم واحد من خلال رابط الانضمام الرسمي.",
    source: "clean-v2",
    sortOrder: 1650
  },
  {
    key: "no-free-trial-uae-en",
    title: "Free trial",
    category: "Offers, Prices & PT",
    country: "UAE",
    language: "EN",
    body: "💙 We do not offer free trials, but you are welcome to visit the gym and get a tour from our team. If you would like to try the gym before joining, you can purchase a day pass through the official join link.",
    source: "clean-v2",
    sortOrder: 1660
  },
  {
    key: "pt-pricing-ksa-ar",
    title: "أسعار التدريب الشخصي KSA",
    category: "Offers, Prices & PT",
    country: "KSA",
    language: "AR",
    body: "💚 أسعار التدريب الشخصي:\nجلسة واحدة: 249.55 ريال | صالحة يومين\n5 جلسات: 1,148.85 ريال | صالحة 21 يوم\n10 جلسات: 2,276.42 ريال | صالحة 45 يوم\n20 جلسة: 4,183.70 ريال | صالحة 90 يوم\n30 جلسة: 5,906.40 ريال | صالحة 120 يوم\n48 جلسة: 8,921.12 ريال | صالحة 180 يوم\n\nالتقسيط متاح عن طريق تابي من باقة 10 جلسات وأكثر.",
    source: "clean-v2",
    sortOrder: 1670
  },
  {
    key: "pt-pricing-ksa-en",
    title: "PT Pricing KSA",
    category: "Offers, Prices & PT",
    country: "KSA",
    language: "EN",
    body: "💚 Personal training prices:\n1 Session: SAR 249.55 | Valid for 2 days\n5 Sessions: SAR 1,148.85 | Valid for 21 days\n10 Sessions: SAR 2,276.42 | Valid for 45 days\n20 Sessions: SAR 4,183.70 | Valid for 90 days\n30 Sessions: SAR 5,906.40 | Valid for 120 days\n48 Sessions: SAR 8,921.12 | Valid for 180 days\n\nTabby installments are available from the 10-session package and above.",
    source: "clean-v2",
    sortOrder: 1680
  },
  {
    key: "pt-pricing-uae-ar",
    title: "أسعار التدريب الشخصي UAE",
    category: "Offers, Prices & PT",
    country: "UAE",
    language: "AR",
    body: "💙 التدريب الشخصي في الإمارات يتم عن طريق مدربين فري لانس، لذلك كل مدرب يحدد أسعاره بنفسه.\n\nالسيشن الواحدة تبدأ تقريبًا من 200 درهم، وباقات 12 سيشن عادةً تتراوح بين 2,700 و3,500 درهم. يمكنك التواصل مع المدرب مباشرة في النادي لمعرفة الأسعار والأوقات.",
    source: "clean-v2",
    sortOrder: 1690
  },
  {
    key: "pt-pricing-uae-en",
    title: "PT Pricing UAE",
    category: "Offers, Prices & PT",
    country: "UAE",
    language: "EN",
    body: "💙 Personal training in the UAE is provided by freelance coaches, so each coach sets their own pricing.\n\nSingle sessions usually start from around AED 200, and 12-session packages usually range between AED 2,700 and AED 3,500. You can speak directly with a coach at the gym for pricing and availability.",
    source: "clean-v2",
    sortOrder: 1700
  },
  {
    key: "core-plus-difference-ksa-ar",
    title: "الفرق بين كور وبلس",
    category: "Membership & Packages",
    country: "KSA",
    language: "AR",
    body: "💚 باقة كور تتيح لك التمرين في فرعك الأساسي، حجز الكلاسات حسب المدة المتاحة، واستخدام أجهزة النادي.\n\nباقة بلس تمنحك مزايا إضافية حسب نوع العضوية مثل دخول فروع إضافية، حجز الكلاسات بمرونة أكبر، Bring a Friend، وبعض الخدمات الإضافية حسب توفرها.",
    source: "clean-v2",
    sortOrder: 1710
  },
  {
    key: "core-plus-difference-ksa-en",
    title: "Core vs Plus",
    category: "Membership & Packages",
    country: "KSA",
    language: "EN",
    body: "💚 Core lets you train at your home gym, book classes according to the available booking window, and use the gym equipment.\n\nPlus gives additional benefits depending on the membership type, such as access to additional gyms, more flexible class booking, Bring a Friend, and extra services where available.",
    source: "clean-v2",
    sortOrder: 1720
  },
  {
    key: "core-plus-difference-uae-ar",
    title: "الفرق بين كور وبلس",
    category: "Membership & Packages",
    country: "UAE",
    language: "AR",
    body: "💙 باقة كور تتيح لك التمرين في فرعك الأساسي، حجز الكلاسات حسب المدة المتاحة، واستخدام أجهزة النادي.\n\nباقة بلس تمنحك مزايا إضافية حسب نوع العضوية مثل دخول فروع إضافية، حجز الكلاسات بمرونة أكبر، Bring a Friend، وبعض الخدمات الإضافية حسب توفرها.",
    source: "clean-v2",
    sortOrder: 1730
  },
  {
    key: "core-plus-difference-uae-en",
    title: "Core vs Plus",
    category: "Membership & Packages",
    country: "UAE",
    language: "EN",
    body: "💙 Core lets you train at your home gym, book classes according to the available booking window, and use the gym equipment.\n\nPlus gives additional benefits depending on the membership type, such as access to additional gyms, more flexible class booking, Bring a Friend, and extra services where available.",
    source: "clean-v2",
    sortOrder: 1740
  },
  {
    key: "official-links-ksa-ar",
    title: "الروابط الرسمية",
    category: "Branches, Hours & Links",
    country: "KSA",
    language: "AR",
    body: "💚 روابط السعودية الرسمية:\n\nالانضمام: https://ksa.puregymarabia.com/join/\nالانضمام English: https://ksa.puregymarabia.com/en-gb/join/\nالصالات الرياضية: https://ksa.puregymarabia.com/gyms/\nGyms English: https://ksa.puregymarabia.com/en-gb/gyms/\nالتطبيق: https://ksa.puregymarabia.com/puregym-app/\nApp English: https://ksa.puregymarabia.com/en-gb/puregym-app/\nتسجيل الدخول: https://ksa.puregymarabia.com/login/",
    source: "official-links",
    sortOrder: 1750
  },
  {
    key: "official-links-ksa-en",
    title: "Official links",
    category: "Branches, Hours & Links",
    country: "KSA",
    language: "EN",
    body: "💚 Official KSA links:\n\nJoin Arabic: https://ksa.puregymarabia.com/join/\nJoin English: https://ksa.puregymarabia.com/en-gb/join/\nGyms Arabic: https://ksa.puregymarabia.com/gyms/\nGyms English: https://ksa.puregymarabia.com/en-gb/gyms/\nApp Arabic: https://ksa.puregymarabia.com/puregym-app/\nApp English: https://ksa.puregymarabia.com/en-gb/puregym-app/\nLogin: https://ksa.puregymarabia.com/login/",
    source: "official-links",
    sortOrder: 1760
  },
  {
    key: "official-links-uae-ar",
    title: "الروابط الرسمية",
    category: "Branches, Hours & Links",
    country: "UAE",
    language: "AR",
    body: "💙 روابط الإمارات الرسمية:\n\nالانضمام: https://uae.puregymarabia.com/join/\nالانضمام English: https://uae.puregymarabia.com/en-gb/join/\nالصالات الرياضية: https://uae.puregymarabia.com/gyms/\nGyms English: https://uae.puregymarabia.com/en-gb/gyms/\nالتطبيق: https://uae.puregymarabia.com/puregym-app/\nApp English: https://uae.puregymarabia.com/en-gb/puregym-app/\nتسجيل الدخول: https://uae.puregymarabia.com/login/",
    source: "official-links",
    sortOrder: 1770
  },
  {
    key: "official-links-uae-en",
    title: "Official links",
    category: "Branches, Hours & Links",
    country: "UAE",
    language: "EN",
    body: "💙 Official UAE links:\n\nJoin Arabic: https://uae.puregymarabia.com/join/\nJoin English: https://uae.puregymarabia.com/en-gb/join/\nGyms Arabic: https://uae.puregymarabia.com/gyms/\nGyms English: https://uae.puregymarabia.com/en-gb/gyms/\nApp Arabic: https://uae.puregymarabia.com/puregym-app/\nApp English: https://uae.puregymarabia.com/en-gb/puregym-app/\nLogin: https://uae.puregymarabia.com/login/",
    source: "official-links",
    sortOrder: 1780
  },
  {
    key: "working-hours-ksa-ar",
    title: "أوقات العمل",
    category: "Branches, Hours & Links",
    country: "KSA",
    language: "AR",
    body: "💚 أفرع الرجال تعمل على مدار الساعة طوال أيام الأسبوع. أما أفرع النساء: الجمعة من 6:30 صباحًا إلى 10:30 مساءً، وباقي الأيام من 6:30 صباحًا إلى منتصف الليل.",
    source: "clean-v2",
    sortOrder: 1790
  },
  {
    key: "working-hours-ksa-en",
    title: "Working hours",
    category: "Branches, Hours & Links",
    country: "KSA",
    language: "EN",
    body: "💚 Men’s branches are open 24/7. Women’s branches: Friday from 6:30 AM to 10:30 PM, and all other days from 6:30 AM to midnight.",
    source: "clean-v2",
    sortOrder: 1800
  },
  {
    key: "working-hours-uae-ar",
    title: "أوقات العمل",
    category: "Branches, Hours & Links",
    country: "UAE",
    language: "AR",
    body: "💙 أفرع الرجال تعمل على مدار الساعة طوال أيام الأسبوع. أما أفرع النساء: الجمعة من 6:30 صباحًا إلى 10:30 مساءً، وباقي الأيام من 6:30 صباحًا إلى منتصف الليل.",
    source: "clean-v2",
    sortOrder: 1810
  },
  {
    key: "working-hours-uae-en",
    title: "Working hours",
    category: "Branches, Hours & Links",
    country: "UAE",
    language: "EN",
    body: "💙 Men’s branches are open 24/7. Women’s branches: Friday from 6:30 AM to 10:30 PM, and all other days from 6:30 AM to midnight.",
    source: "clean-v2",
    sortOrder: 1820
  }
];

export function getSeedScripts() {
  return seedScripts;
}
