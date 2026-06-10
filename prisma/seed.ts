import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { seedScripts } from "../lib/seed-data";

const prisma = new PrismaClient();

const googleReviewScripts = [
  {
    key: "google-review-hours-24-ar",
    title: "ساعات العمل - لماذا النادي ليس مفتوح لمدة 24 ساعة؟",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `حياك الله (اسم العميل)، نشكرك على تعليقك. حالياً أوقات العمل محددة حسب سياسة النادي وجدول التشغيل لكل فرع، لذلك ما نقدر حالياً نشغل النادي 24 ساعة. ومع ذلك، نراجع باستمرار أوقات العمل ونقيّم إمكانية تمديدها مستقبلاً إذا كان هذا يخدم مشتركينا بشكل أفضل.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-hours-24-en",
    title: "Operating Hours - Why is the gym not open 24/7?",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi (Member Name), thank you for your comment. Currently, our operating hours are set based on gym policy and each branch’s schedule. That’s why we’re unable to open 24/7 at the moment. However, we regularly review our hours and evaluate the possibility of extending them if it better serves our members.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-classes-ar",
    title: "الكلاسات - الكلاسات",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا فيك (اسم العميل)، شكرًا على تعليقك. بيورجيم يقدم مجموعة من الكلاسات المتنوعة بإشراف مدربين معتمدين، ونتابع تحديث الجداول بشكل مستمر حسب الإقبال والظروف التشغيلية. لو عندك استفسار أو ملاحظات بخصوص جدول الكلاسات، تقدر تتواصل مع مدير النادي مباشرة أو مع فريق خدمات الأعضاء، وراح نحرص نوصل صوتك ونساعدك تستفيد أكثر من تجربتك معنا.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-classes-en",
    title: "Classes - Classes",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hey (Member Name), thanks for your comment. PureGym offers a variety of classes led by certified trainers, and we continuously update the schedules based on demand and operational capacity. If you have questions or feedback about the class schedule, feel free to speak directly with the gym manager or reach out to our Member Services Team, we’ll make sure your voice is heard and help you make the most of your experience.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-complaint-transfer-ar",
    title: "شكوى - تحويل - تعليق سلبي - التحويل إلى GM/MS",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `حياك الله (اسم العميل)، نعتذر إن تجربتك ما كانت بالمستوى اللي نتمناه لك. ودنا نسمع منك أكثر عن التفاصيل عشان نقدر نعالج الموضوع بأسرع وقت. تقدر تراسلنا على ksa.member.services@puregymarabia.com، وحنا بنتابع معك مباشرة.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-complaint-transfer-en",
    title: "Complaint Transfer - Negative Review to GM/MS",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), we’re sorry your experience didn’t meet your expectations. We’d love to hear more details so we can address it promptly. You can email us at: ksa.member.services@puregymarabia.com and we’ll follow up with you directly.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-negative-internal-ar",
    title: "شكوى - توجيه داخلي - مراجعة سلبية إلى GM/MS",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا (العميل)، شكراً على تعليقك. إذا تقدر تتواصل مع مدير النادي أو فريق خدمات الأعضاء وتزودنا بتفاصيل مثل التاريخ والوقت والأسماء، بنكون شاكرين لك ونقدر نراجع الموضوع بدقة.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-negative-internal-en",
    title: "Internal Direction - Negative Review to GM/MS",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hey (Member Name), thank you for your feedback. If you could speak directly with the gym manager or our Member Services Team and provide details like date, time, and staff involved, we’d really appreciate it, that’ll help us review the issue properly.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-negative-private-ar",
    title: "شكوى - توجيه خاص - مراجعة سلبية على الخاص",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا (اسم العميل)، نسعد دائماً بخدمة مشتركينا. أرسل لنا تفاصيل أكثر على ksa.member.services@puregymarabia.com، وبإذن الله بنتابع معك ونحرص ترجع تجربتك أفضل.
(اسم الموظف)، فريق خدمات الأعضاء.`,
  },
  {
    key: "google-review-negative-private-en",
    title: "Private Follow-up - Negative Review",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi (Member Name), we’re always happy to support our members. Please email us more details at: ksa.member.services@puregymarabia.com and we’ll follow up with you to make sure your next visit is better.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-negative-experience-ar",
    title: "تجربة سلبية - تجربة سلبية",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `حياك الله (اسم العميل)، يؤسفنا إن تجربتك معنا ما كانت بالمستوى اللي نطمح له، ونعتذر عن أي إزعاج سببناه لك. نراجع كل التعليقات ونتأكد من معالجة الملاحظات في النادي، وحرصنا دائم إن التجربة تتحسن للأفضل. إذا لاحظت تحسن في تجربتك القادمة، نتمنى يعكس تقييمك القادم انطباعك الجديد.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-negative-experience-en",
    title: "Negative Experience - Negative Experience",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), we’re sorry your experience wasn’t up to the standard we aim for, and we apologize for any inconvenience caused. We carefully review all feedback to ensure that concerns are addressed at the gym level. If you notice an improvement on your next visit, we’d love for your future review to reflect that updated experience.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-crowded-app-ar",
    title: "الزحمة - تعليق سلبي - مشغول ومزدحم",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا فيك (اسم العميل)، نعرف أن بعض الأوقات يكون فيها النادي مزدحم أكثر، وهذا طبيعي لأن المشتركين يحبون يتمرنون بنفس الفترات. همّنا راحتك، وعشان تجربتك تكون أهدأ وأمتع، تقدر من خلال التطبيق تشوف العدد الحالي وأوقات الزحمة المتوقعة وتختار الوقت اللي يناسبك. هدفنا دايم نخليك تستمتع بتمرينك وتطلع وأنت راضي.
(اسم الموظف)، فريق خدمات الأعضاء.`,
  },
  {
    key: "google-review-crowded-app-en",
    title: "Crowding - Busy and Crowded",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi (Member Name), we know some times of day can be busier than others, it’s normal as many members prefer working out at the same peak times. Your comfort matters to us, and the app can help by showing real-time gym capacity and peak times so you can choose a quieter time to visit. Our goal is to help you enjoy your workout and leave feeling great.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-crowded-apology-ar",
    title: "الزحمة - اعتذار عن الزحمة",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `حياك الله (اسم العميل)، نعتذر إذا الزحمة أثرت على استمتاعك بالنادي. حرصنا دائماً يكون على راحتك وسلامتك، وبإمكانك عبر التطبيق معرفة العدد الحالي وأوقات الذروة عشان تختار وقت أهدأ لتمرينك. ملاحظتك تهمنا، ونتمنى تكون تجربتك القادمة أفضل وأمتع.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-crowded-apology-en",
    title: "Crowding - Apology for Crowd Impact",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), we’re sorry if the crowd impacted your visit. We care about your comfort and safety, and through the app you can check live member count and peak times to better plan your workout. We appreciate your feedback and hope your next visit is even better.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-equipment-maintenance-ar",
    title: "الأعطال والصيانة - مراجعة سلبية فيما يتعلق بالمعدات",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا (اسم العميل)، نشكرك على تقييمك وملاحظتك بخصوص الأجهزة. نهتم كثير إن تكون كل معداتنا بحالة ممتازة، ونعتذر إذا واجهت أي إزعاج. فريقنا يقوم بصيانة دورية، ونعمل بشكل مستمر مع مزوّدي الأجهزة للتأكد من إصلاح أي عطل بأسرع وقت ممكن وبأعلى معايير السلامة. إذا لاحظت أي مشكلة في جهاز، يهمنا تبلغ الموظفين مباشرة عشان نتصرف بسرعة ونحافظ على جودة تجربتك.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-equipment-maintenance-en",
    title: "Equipment & Maintenance - Negative Equipment Review",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hey (Member Name), thanks for your feedback about the equipment. We care a lot about keeping everything in top condition and apologize if anything caused you inconvenience. Our team performs regular maintenance and works closely with our suppliers to resolve issues as fast and safely as possible. If you spot any issue, please notify the staff directly, we’ll act fast to keep your experience smooth.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-supplies-manager-ar",
    title: "اللوازم - مراجعة سلبية لوازم النادي / داخل النادي",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا(اسم العميل)، نشكرك على تقييمك، وحرصنا دائماً يكون على استقبال الملاحظات عشان نقدر نحسن خدماتنا. بما أن المشكلة داخل النادي، الأفضل تتواصل مباشرة مع مدير النادي حتى يتابعها معك ويحلها بأسرع وقت ممكن. واكيد بيكون سعيد بخدمتك.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-supplies-manager-en",
    title: "Supplies - Inside Gym Issue",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi (Member Name), thank you for your feedback. We’re always open to hearing your concerns so we can improve our service. Since the issue is inside the gym, it’s best to speak directly with the gym manager, they’ll be happy to help and follow up with you quickly.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-cleaning-supplies-ar",
    title: "اللوازم - مستلزمات التنظيف",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `حياك الله (اسم العميل)، نشكرك على ملاحظتك وناخذها بعين الاعتبار دائماً. هدفنا نوفر بيئة آمنة ونظيفة لكل مشتركينا. نعتذر إذا كانت هناك أي ملاحظات بخصوص مستلزمات التنظيف، وبمجرد إبلاغ أي موظف بالنادي، راح يتأكد من معالجتها فوراً. يهمنا أنك تستمتع بتجربتك معنا ونرحب بك دائماً.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-cleaning-supplies-en",
    title: "Supplies - Cleaning Supplies",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), thank you for your feedback, we truly take it to heart. Our goal is to provide a clean, safe, and welcoming space for all members. We’re sorry if there were any concerns about the cleaning supplies, once notified, our team acts quickly to resolve it. We’re glad you’re enjoying the gym overall and always happy to have you with us.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-general-praise-rating-ar",
    title: "إطراءات عامة - إطراءات",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا (اسم العميل)، شكراً على تقييمك! نحب نسمع أكثر منك إذا حاب تشاركنا بتفاصيل عن تجربتك أو أي شي نقدر نحسّنه. تواصلك يهمنا دايم.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-general-praise-rating-en",
    title: "General Praise - Rating",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hey (Member Name), thanks for your rating! We’d love to hear more about your experience or anything we could improve. Your feedback always matters to us.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-general-praise-day-ar",
    title: "إطراءات عامة - تقييم أسعدنا",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا فيك (اسم العميل)، تقييمك أسعدنا! إذا عندك أي تفاصيل حاب تشاركنا فيها عن تجربتك، نحب نسمع منك ونوصلها للفريق. وجودك معنا يعني لنا كثير.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-general-praise-day-en",
    title: "General Praise - Made Our Day",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), your rating made our day! If you have more to share about your experience, we’d love to hear it and pass it on to the team. It really means a lot to have you with us.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-general-praise-journey-ar",
    title: "إطراءات عامة - رحلة رياضية",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `حياك الله (اسم العميل)، تعليقك محل تقدير، ونسعد دايم إننا نكون جزء من رحلتك الرياضية. نتمنى لك التوفيق في أهدافك، وإحنا معك خطوة بخطوة!
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-general-praise-journey-en",
    title: "General Praise - Fitness Journey",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hey (Member Name), your comment is truly appreciated. We're always happy to be part of your fitness journey. Wishing you all the best in reaching your goals, we’re right here cheering you on!
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-general-praise-stars-ar",
    title: "إطراءات عامة - تقييم 4 أو 5 نجوم",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا (اسم العميل)، شكرًا إنك كتبت لنا هالتقييم. ويا زين ما شفنا تقييمك (5، 4) نجوم! وإذا عندك أي ملاحظات كيف نقدر نحسن خدماتنا بالمستقبل، لا تتردد تتواصل معنا!
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-general-praise-stars-en",
    title: "General Praise - 4 or 5 Stars",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), thank you for your great rating (4 or 5 stars)! We’re happy to know you're satisfied with your experience. If you have any suggestions on how we can improve our services further, feel free to reach out anytime.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-coach-praise-general-ar",
    title: "إطراء مدرب - إطراء للمدرب",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا فيك (اسم العميل)، أسعدنا كثير تعليقك الجميل عن مدربينا. نهتم إن كل مشترك يعيش تجربة تدريب ملهمة، وكلماتك الطيبة تعطينا دافع أكبر نستمر ونقدّم أفضل ما عندنا. فخورين بفريق التدريب اللي يشتغل بحب وإخلاص، وأكيد بنوصل لهم تحياتك. ننتظر نشوفك تحقق أهدافك ونكون جزء من نجاحك.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-coach-praise-general-en",
    title: "Coach Praise - Coach Compliment",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi (Member Name), we really appreciated your kind words about our coaches. We always strive to offer inspiring training, and your message gives us even more motivation to keep going. We’re proud of our dedicated team, and we’ll be sure to pass along your message. Hope to see you reach your goals soon!
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-coach-praise-name-ar",
    title: "إطراء مدرب - إطراء لمدرب محدد",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `حياك الله (اسم العميل)، فرحنا إنك استمتعت بالتدريب مع المدرب [اسم المدرب]. هو يبذل جهد كبير عشان يلهم المشتركين ويدعمهم خطوة بخطوة، وكلماتك تشجعه وتخلّيه يستمر بعطائه. هدفنا دايم إنك تلقى الدعم والتحفيز اللي تحتاجه، ونسعد نكون معك في كل مرحلة من رحلتك الرياضية.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-coach-praise-name-en",
    title: "Coach Praise - Named Coach",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), we’re so glad you enjoyed training with [Coach Name]! They work hard to support and inspire every member, and your words go a long way in encouraging them to keep it up. We're always here to support your journey.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-coach-praise-inspiring-ar",
    title: "إطراء مدرب - كلمات عن المدربين",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `أهلاً وسهلاً (اسم العميل)، كلامك عن مدربينا أفرحنا وألهمنا. حنا نؤمن إن النجاح ما يجي بالصدفة، بل بجهدك وتعاون فريق التدريب معك، وهذا بالضبط اللي نشوفه فيك. نتمنى تواصل تقدمك ونشوفك تحقق أهدافك، وأبوابنا مفتوحة لأي دعم تحتاجه.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-coach-praise-inspiring-en",
    title: "Coach Praise - Inspiring Coaches",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi (Member Name), your message about our coaches made our day. We believe success doesn’t happen by accident, it comes from your effort and your connection with the training team. That’s exactly what we see in you. Keep going, and know that we’re always here if you need anything.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-praise-small-note-ar",
    title: "إطراء + ملاحظة بسيطة - إطراء وتعليق سلبي بسيط",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا فيك (اسم العميل)، نشكرك على تقييمك وملاحظتك، ونحرص دائماً على أخذ ملاحظات مشتركينا بعين الاعتبار. هدفنا نوفر لك بيئة آمنة ونظيفة تتمرن فيها براحة. يسعدنا أنك مستمتع بتجربتك معنا، وإذا فيه أي شيء إضافي ممكن نساعدك فيه، حنا حاضرين في أي وقت.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-praise-small-note-en",
    title: "Praise + Small Note - Positive with Minor Feedback",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi (Member Name), thanks so much for your feedback. We always value hearing from our members. Our goal is to give you a clean, safe, and welcoming place to train. We’re glad you’re enjoying your time with us, and we’re always here if there’s anything more we can help with.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-suggestions-general-ar",
    title: "اقتراحات - إقتراحات",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `يا هلا (اسم العميل)، نشكرك على تقييمك وملاحظتك، ودايم نسعى نطور خدماتنا عشان نقدم لك أفضل تجربة ممكنة. إذا عندك أي اقتراح إضافي، يا ليت توصله لمدير النادي أو فريق خدمات الأعضاء عشان نراجعه ونستفيد منه.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-suggestions-general-en",
    title: "Suggestions - Suggestions",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), thanks for your feedback, we’re always looking for ways to improve the experience for you. If you have additional suggestions, please feel free to share them with the gym manager or Member Services so we can review and learn from them.
(Agent Name), Member Services Team`,
  },
  {
    key: "google-review-suggestions-facilities-ar",
    title: "اقتراحات - تطوير المرافق",
    category: "Google Reviews",
    country: "ALL",
    language: "AR",
    body: `حياك الله (اسم العميل)، كل اقتراح من مشتركينا يساعدنا نطوّر المرافق ونحافظ على النادي نظيف وآمن. يسعدنا نسمع منك أي أفكار أو اقتراحات مستقبلية عن طريق مدير النادي أو فريق خدمات الأعضاء. هدفنا دايم نلبي توقعاتك ونرفع مستوى التجربة.
(اسم الموظف)، فريق خدمات الأعضاء`,
  },
  {
    key: "google-review-suggestions-facilities-en",
    title: "Suggestions - Facilities Improvement",
    category: "Google Reviews",
    country: "ALL",
    language: "EN",
    body: `Hi there (Member Name), every suggestion from our members helps us improve our facilities and keep the gym safe and clean. We’d love to hear any future ideas or feedback, just share them with the gym manager or Member Services. We’re always striving to exceed your expectations.
(Agent Name), Member Services Team`,
  },
] as const;

const defaultAiKnowledgeItem = [
  {
    title: "KSA official terms and cancellation basics",
    country: "KSA",
    language: "BOTH",
    kind: "Official Source",
    sourceUrl: "https://ksa.puregymarabia.com/en-gb/terms-conditions/",
    content:
      "KSA official terms: monthly memberships can be cancelled by contacting Member Services at least 2 days before the next deduction date; membership remains active until the day before next payment then terminates. Fixed-term/PIF memberships cannot be cancelled and can only be frozen according to freeze terms. Failed monthly payment temporarily suspends the membership; PureGym retries after 10 days and if the second attempt fails the membership is automatically cancelled. Hyper Bill payment links may be used for one-off services, upgrades/freezes, failed payments, and ad hoc requests.",
  },
  {
    title: "UAE official terms and freeze basics",
    country: "UAE",
    language: "BOTH",
    kind: "Official Source",
    sourceUrl: "https://uae.puregymarabia.com/terms-conditions/",
    content:
      "UAE official terms: freeze fee is 39 AED. Unless the member is PLUS, freeze can be for a maximum of 3 months, after which membership automatically unfreezes and returns to monthly rate. Freeze starts from payment date and must be actioned at least 2 working days before payment date. Monthly cancellation must be requested at least 2 days before next deduction. Fixed-term/paid-in-full memberships are not refundable and cannot be cancelled.",
  },
  {
    title: "Gym rules dual language summary",
    country: "ALL",
    language: "BOTH",
    kind: "Gym Rules",
    sourceUrl: "GymRules A4-DUAL-REV1.pdf",
    content:
      "Members must use their own QR/PIN/access device and must not share it. QR/PIN misuse may be monitored and can result in charges, cancellation, or denied access. Minimum age is 16+. Smoking/e-cigarettes are prohibited. Suitable sports attire and shoes are required. Members must wipe equipment, return weights, avoid dropping/slamming weights, avoid aggressive behavior, not bring external equipment, and follow class cancellation/on-time rules.",
  },
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
        emailVerifiedAt: new Date(),
      },
      create: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        nameAr: process.env.ADMIN_NAME_AR || "Admin",
        nameEn: process.env.ADMIN_NAME_EN || "Admin",
        role: "SUPER_ADMIN",
        emailVerifiedAt: new Date(),
      },
    });

    console.log(`Super Admin ready: ${adminEmail}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set. Skipping admin user.");
  }

  // IMPORTANT: Neon is the source of truth for the current production script library.
  // To avoid overwriting scripts that were added/edited from Admin Editor, the old project seed list
  // only syncs when SYNC_SEED_SCRIPTS=true is explicitly set.
  const syncProjectSeedScripts = process.env.SYNC_SEED_SCRIPTS === "true";
  let seededScripts = 0;

  if (syncProjectSeedScripts) {
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
          sortOrder: script.sortOrder || 0,
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
          sortOrder: script.sortOrder || 0,
        },
      });
      seededScripts += 1;
    }
  } else {
    console.log(
      "Skipped project seed scripts. Existing Neon/Admin scripts are preserved. Set SYNC_SEED_SCRIPTS=true only when intentionally syncing seed-data.ts.",
    );
  }

  let googleReviewSeeded = 0;
  for (const script of googleReviewScripts) {
    await prisma.script.upsert({
      where: { key: script.key },
      update: {
        title: script.title,
        category: script.category,
        country: script.country as any,
        language: script.language,
        body: script.body,
        source: "google-reviews",
        active: true,
      },
      create: {
        key: script.key,
        title: script.title,
        category: script.category,
        country: script.country as any,
        language: script.language,
        body: script.body,
        source: "google-reviews",
        active: true,
        sortOrder: 9000 + googleReviewSeeded * 10,
      },
    });
    googleReviewSeeded += 1;
  }

  console.log(
    `Seeded/updated ${seededScripts} project scripts and ${googleReviewSeeded} Google Review scripts without deleting existing data.`,
  );

  for (const item of defaultAiKnowledgeItem) {
    await prisma.aiKnowledgeItem.upsert({
      where: {
        id: `seed-${item.country.toLowerCase()}-${item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 40)}`,
      },
      update: {
        title: item.title,
        content: item.content,
        country: item.country as any,
        language: item.language,
        kind: item.kind,
        sourceUrl: item.sourceUrl,
        active: true,
      },
      create: {
        id: `seed-${item.country.toLowerCase()}-${item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 40)}`,
        title: item.title,
        content: item.content,
        country: item.country as any,
        language: item.language,
        kind: item.kind,
        sourceUrl: item.sourceUrl,
        active: true,
      },
    });
  }

  await prisma.aiGlobalMemory.upsert({
    where: { key: "global" },
    update: {},
    create: { key: "global", summary: "" },
  });

  console.log(
    `AI trainer ready with ${defaultAiKnowledgeItem.length} default official knowledge items.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
