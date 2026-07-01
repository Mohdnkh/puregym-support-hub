import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Transcribed from the Corporate Offers spreadsheet screenshot.
// Columns: [arabicName, englishName, code, priceAfterDiscount, description, active, startDate, endDate]
// KSA only, Arabic language tag. Source tag "corporate-offers" so the whole
// set can be re-imported or removed cleanly without touching other scripts.
type Row = [string, string, string, string, string, boolean, string, string];

const rows: Row[] = [
  // ---- Active ----
  ["مجموعة الواسط الطبية", "Al-Waseet Medical Group", "WASEET", "1300SR & 870SR", "12M & 6M - Plus Only", true, "22-Apr-26", "22-Apr-26"],
  ["فرع وزارة الشؤون الإسلامية بالرياض", "Riyadh branch of the Ministry of Islamic Affairs", "RS20", "1300SR & 870SR", "12M & 6M - Plus Only", true, "18-Feb-26", "18-May-26"],
  ["شركة اي بن", "e-Ben Company", "EBEN", "1300SR & 870SR", "12M & 6M - Plus Only", true, "18-Feb-26", "18-May-26"],
  ["شركة بلسم الرعاية الطبية", "Balsam Medical Care Company", "CARE", "1300SR & 870SR", "12M & 6M - Plus Only", true, "20-Feb-26", "20-May-26"],
  ["شركة رزيات", "Rezzayat company", "RZYT", "1300SR & 870SR", "12M & 6M - Plus Only", true, "24-Feb-26", "24-May-26"],
  ["مكنون (جمعية تحفيظ القرآن بالرياض)", "Maknon Association for Quran Memorization", "MAKNON", "1300SR & 870SR", "12M & 6M - Plus Only", true, "1-Mar-26", "1-Jun-26"],
  ["بنك ANB - عرض حاملي البطاقات", "ANB Cardholders offer", "ANB", "1300SR & 870SR", "12M & 6M - Plus Only", true, "27-Jan-26", "27-Apr-26"],
  ["مصانع الجميح للتعبئة", "AL JOMAIH BOTTLING PLANTS", "KBR", "1300SR & 870SR", "12M & 6M - Plus Only", true, "27-Jan-26", "27-Apr-26"],
  ["عيادات الفارابي", "Al-Farabi Clinics", "FARABI", "1300SR & 870SR", "12M & 6M - Plus Only", true, "27-Jan-26", "27-Apr-26"],
  ["شركة علم", "ELM company", "ELM", "1300SR & 870SR", "12M & 6M - Plus Only", true, "28-Jan-26", "28-Apr-26"],
  ["شركة اكسترا", "Extra Company", "EXTRA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "28-Jan-26", "28-Apr-26"],
  ["مستشفى الجزيرة", "Al Jazeera Hospital", "JAZEERA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "2-Feb-26", "2-Mar-26"],
  ["الأمن العام السعودي", "Saudi Public Security", "PSS45", "Month Free + 1M extra", "12M & 6M - Plus Only", true, "8-Feb-26", "8-May-26"],
  ["مصنع عبد الرحمن صالح العقيل للمفروشات", "Abdul Rahman Saleh Al-Aqeel Furniture Factory Company", "MAA45", "Month Free + 870SR + 1M extra", "12M & 6M - Plus Only", true, "10-Feb-26", "10-May-26"],
  ["شركة المجدوعي للسيارات", "Almajdouie Motors company", "MAJD", "Month Free + 870SR + 1M extra", "12M & 6M - Plus Only", true, "15-Feb-26", "15-May-26"],
  ["مدينة الملك فهد الطبية", "King Fahd Medical City", "RC2", "Month Free + 870SR + 1M extra", "12M & 6M - Plus Only", true, "16-Feb-26", "16-May-26"],
  ["مجموعة سيرا القابضة", "Siera Holding Group", "SEERA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "2-Nov-25", "2-Feb-26"],
  ["العثيم مول", "Al Othaim Mall", "OTHAIM", "1300SR & 870SR", "12M & 6M - Plus Only", true, "3-Nov-25", "3-Feb-26"],
  ["تطبيق خصومات وعروض النخبة", "Elite Discounts & Offers App", "ELITE", "1300SR & 870SR", "12M & 6M - Plus Only", true, "5-Nov-25", "5-Nov-26"],
  ["مدارس الظهران الأهلية", "Dhahran Ahlia Schools", "DAS", "1300SR & 870SR", "12M & 6M - Plus Only", true, "4-Nov-25", "5-Nov-26"],
  ["شركة الاندلس التعليمية", "Andalus Educational Company", "ANDL", "1300SR & 870SR", "12M & 6M - Plus Only", true, "6-Nov-25", "6-Nov-26"],
  ["بنك الرياض", "Riyad Bank", "RYDB", "1300SR & 870SR", "12M & 6M - Plus Only", true, "9-Nov-25", "9-Feb-26"],
  ["شركة سلة لحلول الأعمال", "Selat For Business Solution Company", "SLT", "1300SR & 870SR", "12M & 6M - Plus Only", true, "9-Nov-25", "9-Feb-26"],
  ["وزارة الصحة", "Ministry of Health", "MOH", "1300SR & 870SR", "12M & 6M - Plus Only", true, "13-Nov-25", "13-Nov-26"],
  ["الهلال الأحمر السعودي", "Saudi Red Crescent", "SRC", "1200SR & 650SR", "12M & 6M - Plus Only", true, "18-Dec-25", "18-Dec-26"],
  ["شركة سلامة الآبار", "Welbore Integrity Company", "WBI", "1300SR & 870SR", "12M & 6M - Plus Only", true, "23-Nov-25", "6-Apr-26"],
  ["الشركة السعودية للصناعات الميكانيكية", "Saudi Mechanical Industries", "SMI", "1300SR & 870SR", "12M & 6M - Plus Only", true, "27-Nov-25", "6-Apr-26"],
  ["شركة نسما المتحدة للصناعات", "Nesma United Industries", "NESMA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "2-Dec-25", "6-Apr-26"],
  ["شركة سافيلز", "Savills Company", "SAV", "1300SR & 870SR", "12M & 6M - Plus Only", true, "2-Dec-25", "6-Apr-26"],
  ["شركة جوراء", "JAWRAA Company", "JAWR", "1300SR & 870SR", "12M & 6M - Plus Only", true, "4-Dec-25", "6-Apr-26"],
  ["أسواق التميمي", "Tamimi Markets Company", "TAMIMI", "1300SR & 870SR", "12M & 6M - Plus Only", true, "7-Dec-25", "6-Apr-26"],
  ["إمارة المنطقة الشرقية", "Emirate of the Eastern Province", "SHRQ", "1300SR & 870SR", "12M & 6M - Plus Only", true, "9-Dec-25", "6-Apr-26"],
  ["شركة التميمي للتمويل", "Tamimi Finance Company", "TAMAM", "1300SR & 870SR", "12M & 6M - Plus Only", true, "18-Dec-25", "18-Jan-26"],
  ["شركة اتش سي ال", "Hcl Company", "HCL", "1300SR & 870SR", "12M & 6M - Plus Only", true, "18-Dec-25", "31-Jan-26"],
  ["شركة معادن", "Maaden Company", "MAADEN", "1300SR & 870SR", "12M & 6M - Plus Only", true, "23-Dec-25", "23-Mar-26"],
  ["عيادات رام", "RAM Clinics", "RAM", "1300SR & 870SR", "12M & 6M - Plus Only", true, "24-Dec-25", "24-Mar-26"],
  ["مجموعة ابانا", "ABANA Enterprises Group", "ABANA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "24-Dec-25", "24-Mar-26"],
  ["مستشفى المانع", "AL-Mana Hospital", "MANA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "31-Dec-25", "31-Mar-26"],
  ["مجلس الشورى السعودي", "Saudi Shura Council", "SHURA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "5-Jan-26", "6-Apr-26"],
  ["البنك الأهلي السعودي", "SNB Bank", "SNB87", "1300SR & 870SR", "12M & 6M - Plus Only", true, "11-Jan-26", "11-Apr-26"],
  ["البنك الأهلي السعودي", "SNB Bank", "SNB57", "1300SR & 870SR", "12M & 6M - Plus Only", true, "11-Jan-26", "11-Apr-26"],
  ["معهد المحاسبين القانونيين (إنجلترا وويلز)", "ICAEW Company", "ICAEW", "1300SR & 870SR", "12M & 6M - Plus Only", true, "11-Jan-26", "11-Apr-26"],
  ["برق - فيزا", "BARQ VISA", "BARQ", "1300SR & 870SR", "12M & 6M - Plus Only", true, "29-Jun-26", "29-Jun-26"],
  ["مركز عمليات الأمن الموحد 911", "Unified Security Operations Center 911", "911", "1300SR & 870SR", "12M & 6M - Plus Only", true, "12-Jun-26", "12-Jun-26"],
  ["محفظة سامسونج", "SAMSUNG Wallet", "SAMSUNG", "1300SR & 870SR", "12M & 6M - Plus Only", true, "14-Jan-26", "14-Feb-26"],
  ["شركة كونكورد للتأمين", "Concord Insurance", "CONCORD", "1300SR & 870SR", "12M & 6M - Plus Only", true, "13-Jan-26", "13-Aug-26"],
  ["شركة ضيافة", "Dyafa Company", "DYAFA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "14-Jan-26", "14-Apr-26"],
  ["شركة الصناعات المتطورة للمباني (سيناعت)", "Advanced Building Industries Company (SENAAT)", "SENAAT", "1300SR & 870SR", "12M & 6M - Plus Only", true, "14-Jan-26", "14-Apr-26"],
  ["شركة النهدي الطبية", "Al-Nahdi Medical Company", "NAHDI", "1300SR & 870SR", "12M & 6M - Plus Only", true, "7-Apr-26", "7-Jul-26"],
  ["بنك BSF", "BSF Bank", "BSF", "1300SR & 870SR", "12M & 6M - Plus Only", true, "13-Apr-26", "13-Jul-26"],
  ["الذكاء الاصطناعي والروبوتات - شركة QSS", "QSS AI and Robotics", "QSS", "1300SR & 870SR", "12M & 6M - Plus Only", true, "13-Apr-26", "13-Jul-26"],
  ["وزارة البلديات والإسكان", "Ministry of Municipalities and Housing", "MOMAH", "1300SR & 870SR", "12M & 6M - Plus Only", true, "21-Apr-26", "21-Jul-26"],
  ["مصرف الراجحي", "Al Rajhi Bank", "ARBEMP", "1300SR & 870SR", "12M & 6M - Plus Only", true, "21-Apr-26", "21-Jul-26"],
  ["شركة ماجد الفطيم", "Majid Al Futtaim Company", "MAF26", "1300SR & 870SR", "12M & 6M - Plus Only", true, "22-Apr-26", "21-Jul-26"],
  ["جمعية رحمة الصحية", "Rahma Health Association", "RHS", "1300SR & 870SR", "12M & 6M - Plus Only", true, "23-Apr-26", "23-Jul-26"],
  ["مجموعة الاندلسية الصحية", "Andalusia Health Group", "AHG", "1300SR & 870SR", "12M & 6M - Plus Only", true, "28-Apr-26", "28-Jul-26"],
  ["الندوة العالمية للشباب الإسلامي", "World Assembly of Muslim Youth", "WAMY", "1300SR & 870SR", "12M & 6M - Plus Only", true, "30-Apr-26", "30-Jul-26"],
  ["شركة مترو العاصمة", "Capital Metro Company", "CAMCO", "1300SR & 870SR", "12M & 6M - Plus Only", true, "3-May-26", "3-Aug-26"],
  ["وزارة البلدية والإسكان", "Ministry of Municipality and Housing", "MOMAH", "1200SR & 800SR", "12M & 6M - Plus Only", true, "3-Jul-25", "2-Aug-26"],
  ["الخطوط السعودية", "Saudi Airlines", "SVMazaya", "1300SR & 870SR", "12M & 6M - Plus Only", true, "28-May-25", "28-May-26"],
  ["برنامج واجب", "Wajeb program", "WAJEB", "1300SR & 870SR", "12M & 6M - Plus Only", true, "7-May-26", "7-May-26"],
  ["الجامعة السعودية الإلكترونية", "Saudi Electronic University", "MAZAYA", "1300SR & 870SR", "12M & 6M - Plus Only", true, "22-May-25", "22-May-26"],
  ["تطبيق فاتيزاز / وزارة الدفاع", "FATIZAZ APP / Ministry of defense", "MOD", "1300SR & 870SR", "12M & 6M - Plus Only", true, "22-Jun-25", "22-Jun-26"],
  ["شركة STC", "STC Company", "STC", "1300SR & 870SR", "12M & 6M - Plus Only", true, "31-Aug-25", "30-Nov-25"],
  ["مجموعة القريان", "Al Qaryan Group", "ALQARYAN", "1300SR & 870SR", "12M & 6M - Plus Only", true, "31-Aug-25", "30-Nov-25"],
  ["الكلية التقنية العالمية لعلوم الطيران", "Global Technical College for Aviation Sciences", "FLYATC", "1200SR & 650SR", "12M & 6M - Plus Only", true, "7-Sep-25", "7-Dec-25"],
  ["شركة محمد هادي الراشد وشركاه", "Mohammed Hadi Al Rashid and Partners Company", "ALRC", "1200SR & 650SR", "12M & 6M - Plus Only", true, "11-Sep-25", "11-Dec-25"],
  ["هيئة إعلام المنطقة الشرقية", "Eastern province media Authority", "MEDIA", "1200SR & 650SR", "12M & 6M - Plus Only", true, "15-Sep-25", "15-Dec-25"],
  ["شركة التيسير العربية", "Al Tayseer Arabia Company", "TAC", "1200SR & 650SR", "12M & 6M - Plus Only", true, "17-Sep-25", "17-Dec-25"],
  ["شركة الجميل للفنون", "Al Jameel for Arts Company", "ART", "1200SR & 650SR", "12M & 6M - Plus Only", true, "17-Sep-25", "17-Dec-25"],
  ["شركة تطوير المنتجات الحلال", "Halal Products Development Company", "HPDC", "1300SR & 870SR", "12M & 6M - Plus Only", true, "21-Sep-25", "21-Dec-25"],
  ["شركة شور جلوبال", "Sure Global International", "SURE", "1200SR & 650SR", "12M & 6M - Plus Only", true, "21-Sep-25", "21-Dec-25"],
  ["ولاء بلس", "Wala Plus", "WALA", "1200SR & 650SR", "12M & 6M - Plus Only", true, "21-Sep-25", "21-Dec-25"],
  ["شركة هنكل", "Henkel Company", "HENKEL", "1200SR & 650SR", "12M & 6M - Plus Only", true, "21-Sep-25", "21-Dec-25"],
  ["شركة تيستي للمنتجات الصحية", "Tasty Health Products Company", "TASTY", "1200SR & 650SR", "12M & 6M - Plus Only", true, "22-Sep-25", "22-Dec-25"],
  ["شركة ليفيرا", "Lifera company", "LIFERA", "1200SR & 650SR", "12M & 6M - Plus Only", true, "24-Sep-25", "24-Dec-25"],
  ["شركة وود", "Wood Company", "WOOD", "1200SR & 650SR", "12M & 6M - Plus Only", true, "28-Sep-25", "28-Sep-26"],
  ["مجموعة إنجرس", "Ingress Group", "INGR", "1300SR & 870SR", "12M & 6M - Plus Only", true, "30-Sep-25", "30-Dec-25"],
  ["شركة محمد عبد الرحمن البسام للاستشارات الهندسية", "Mohammed Abdulrahman Al Bassam Engineering Consulting (MAB Consult)", "MAB", "1300SR & 870SR", "12M & 6M - Plus Only", true, "19-Oct-25", "19-Oct-26"],
  ["شركة القدية للاستثمار", "Qiddiya Investment Company", "QID", "1300SR & 870SR", "12M & 6M - Plus Only", true, "27-Oct-25", "27-Jan-26"],
  ["الاتحاد السعودي للإعلام الرياضي", "Saudi Sports Media Federation", "SSMF", "1300SR & 870SR", "12M & 6M - Plus Only", true, "28-Oct-25", "28-Jan-26"],
  ["الرياض القابضة", "Riyadh Holding", "RYDH", "1300SR & 870SR", "12M & 6M - Plus Only", true, "28-Oct-25", "28-Oct-26"],
  ["برق - خصم حاملي البطاقات", "Barq", "Barq", "30% OFF for bank card holders", "12M & 6M - Plus Only", true, "20-Jan-26", "19-Jan-27"],
  ["محفظة سامسونج - خصم حاملي البطاقات", "Samsung Wallet", "SAMSUNG", "30% OFF for bank card holders", "12M & 6M - Plus Only", true, "20-Jan-26", "19-Jan-27"],
  ["البنك الأهلي السعودي - خصم حاملي البطاقات", "Saudi National Bank", "SNB30", "30% OFF for bank card holders", "12M & 6M - Plus Only", true, "20-Jan-26", "19-Jan-27"],
  ["شركة أرامكو السعودية", "Saudi Aramco Company", "ARAMCO", "1300SR & 870SR", "12M & 6M - Plus Only", true, "28-Oct-25", "28-Oct-26"],

  // ---- Inactive (kept hidden, active = false) ----
  ["شركة إنجاز للمقاولات", "Inajz Contracting Injazco", "ICI", "1300SR & 870SR", "12M & 6M - Plus Only", false, "6-Aug-25", "6-Sep-25"],
  ["مجموعة المسيهيل", "Almisehal Group", "MSH15", "1300SR & 870SR", "12M & 6M - Plus Only", false, "6-Aug-25", "6-Sep-25"],
  ["شركة ميديسرف", "Mediserv Company", "MED", "1300SR & 870SR", "12M & 6M - Plus Only", false, "10-Aug-25", "10-Sep-25"],
  ["شركة ذا شيفز", "The Chefz Company", "CHEFZ", "1300SR & 870SR", "12M & 6M - Plus Only", false, "13-Aug-25", "13-Sep-25"],
  ["شركة اليمامة للأعمال", "Al Yamamah Business Company", "YMMA", "1300SR & 870SR", "12M & 6M - Plus Only", false, "13-Aug-25", "13-Sep-25"],
  ["شركة المملكة للوساطة", "Kingdom Brokerage Company", "KBSS", "1300SR & 870SR", "12M & 6M - Plus Only", false, "17-Aug-25", "17-Sep-25"],
  ["شركة الخليج للكيماويات والزيوت الصناعية", "Gulf Chemicals & Industrial Oils Co", "GKIOC", "1300SR & 870SR", "12M & 6M - Plus Only", false, "26-Aug-25", "26-Sep-25"],
  ["عيادات فيرست سمايل", "FIRST SMILE Clinics", "FIRST", "1300SR & 870SR", "12M & 6M - Plus Only", false, "26-Aug-25", "26-Sep-25"],
  ["طيران الرياض", "Riyadh Air", "RIYADHAIR", "1300SR & 870SR", "12M & 6M - Plus Only", false, "26-Aug-25", "26-Sep-25"],
  ["مجموعة MBC", "MBC Group", "MBC", "1300SR & 870SR", "12M & 6M - Plus Only", false, "13-Jul-25", "13-Aug-25"],
  ["شركة معين للموارد البشرية", "Moein Human Resources Company", "MHR", "1300SR & 870SR", "12M & 6M - Plus Only", false, "14-Jul-25", "14-Jul-25"],
  ["صيدلية الدواء", "ALDAWAA PHARMACY", "ALDAWAA", "1300SR & 870SR", "12M & 6M - Plus Only", false, "14-Jul-25", "14-Jul-25"],
  ["شركة التنمية البشرية", "Human Development Company", "HDC", "1300SR & 870SR", "12M & 6M - Plus Only", false, "16-Jul-25", "16-Aug-25"],
  ["شركة بوبا للتأمين", "Bupa Insurance Company", "BUPA", "1300SR & 870SR", "12M & 6M - Plus Only", false, "20-Jul-25", "21-Jul-25"],
  ["شركة بتروجت", "petrojet company", "PTJ", "1300SR & 870SR", "12M & 6M - Plus Only", false, "24-Jul-25", "24-Aug-25"],
  ["بيت التمويل السعودي الكويتي", "Saudi Kuwaiti Finance House Company", "SKFH", "1300SR & 870SR", "12M & 6M - Plus Only", false, "24-Jul-25", "24-Aug-25"],
  ["المركز الوطني", "National Center", "NCG", "1300SR & 870SR", "12M & 6M - Plus Only", false, "24-Jul-25", "24-Aug-25"],
  ["مصنع تبوك للصناعات الدوائية", "Tabuk Pharmaceutical Industries Factory", "TABUK", "1300SR & 870SR", "12M & 6M - Plus Only", false, "8-May-25", "22-May-26"],
  ["شركة المساكن السعودية", "Saudi Homes Company", "BAYUT", "1300SR & 870SR", "12M & 6M - Plus Only", false, "23-Jul-25", "23-Jul-25"],
  ["شركة تحالف العمليات", "OPERATION ALLIANCE OPS CO", "FLOWPR-2025", "1300SR & 870SR", "12M & 6M - Plus Only", false, "21-May-25", "15-Jul-25"],
  ["شركة بيت التأمين", "Insurance House Company", "IHC", "1300SR", "12M - Plus only", false, "28-May-25", "30-Jul-25"],
  ["هيئة الربط الخليجي", "The GCC Interconnection Authority", "PGCC", "1300SR", "12M - Plus only", false, "28-May-25", "28-Jul-25"],
  ["شركة مداد القابضة", "Midad Holding", "MIDAD", "1300SR & 870SR", "12M & 6M - Plus only", false, "27-May-25", "27-Jul-25"],
  ["شركة أملنتت", "Amlantit company", "AMLANTIT", "1300SR & 870SR", "12M & 6M - Plus only", false, "8-May-25", "1-Jun-25"],
  ["شركة المراعي", "AL MARAI COMPANY", "ALMARAI", "1300SR", "12M - Plus only", false, "29-May-25", "29-Jul-25"],
  ["شركة مهارة للموارد البشرية", "Maharah for Human Resources", "PGMHR", "1300SR", "12M - Plus only", false, "28-May-25", "28-Jul-25"],
  ["مستشفى الحياة الوطني", "Hospital Al Hayat Wattani", "PGHHW", "1300SR", "12M - Plus only", false, "28-May-25", "28-Jul-25"],
  ["شركة عجان (كوكا كولا)", "Aujan company (Coca Cola)", "AUJAN", "1300SR", "12M - Plus only", false, "26-May-25", "26-Jul-25"],
  ["الجامعة العربية المفتوحة - السعودية", "Arab open university - saudi arabia", "AOU", "1300SR", "12M - Plus only", false, "28-May-25", "28-Jul-25"],
  ["شركة السيف للمقاولات الهندسية", "El Seif Engineering Contracting Co", "ELSEIF", "1300SR", "12M - Plus only", false, "28-May-25", "28-Jul-25"],
  ["دي اتش ال إكسبريس", "DHL express", "DHL", "1300SR", "12M - Plus only", false, "28-May-25", "11-Aug-25"],
  ["ريدا للسيطرة على المخاطر", "REDA hazard control", "RHC", "1200SR & 800SR", "12M & 6M - Plus only", false, "3-Jun-25", "3-Jul-25"],
  ["شركة أسفار", "Astar company", "ASFAR", "1300SR", "12M - Plus only", false, "3-Jun-25", "3-Jul-25"],
  ["شركة سيسكو", "SISCO Company", "SISCO", "1300SR & 870SR", "12M & 6M - Plus only", false, "3-Jun-25", "3-Jul-25"],
  ["التأمينات الاجتماعية", "social insurance", "GOSI", "1300SR & 870SR", "12M & 6M - Plus only", false, "18-Jun-25", "18-Jul-25"],
  ["الكونسورتيوم الحديث لتزويد الطائرات بالوقود", "Modern Consortium for Refueling Aircraft", "MCRA", "1300SR & 870SR", "12M & 6M - Plus only", false, "18-Jun-25", "17-Jul-25"],
  ["شركة التنفيذي", "ALTANFEETHI", "TAN", "1300SR & 870SR", "12M & 6M - Plus only", false, "22-Jun-25", "22-Jul-25"],
  ["مختبرات دلتا الطبية", "Delta Medical Laboratories", "DELTA", "1300SR & 870SR", "12M & 6M - Plus only", false, "22-Jun-25", "22-Jul-25"],
  ["بنك الجزيرة", "Bank AL Jazira", "BAJ", "1300SR & 870SR", "12M & 6M - Plus only", false, "22-Jun-25", "22-Jul-25"],
  ["البنك العربي الوطني", "Arab National Bank", "ANB-ANB", "1300SR & 870SR", "12M & 6M - Plus only", false, "22-Jun-25", "22-Jul-25"],
  ["البنك السعودي الأول", "Saudi Awwal Bank", "ASB", "1300SR & 870SR", "12M & 6M - Plus only", false, "22-Jun-25", "22-Jul-25"],
  ["تطبيق SDC", "SDC App", "SDC", "1300SR & 870SR", "12M & 6M - Plus only", false, "22-Jun-25", "22-Jul-25"],
];

function slug(code: string, taken: Set<string>) {
  const base = "corporate-offer-" + code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  let key = base;
  let n = 2;
  while (taken.has(key)) key = `${base}-${n++}`;
  taken.add(key);
  return key;
}

async function main() {
  // Recreate cleanly: separate Arabic-only and English-only versions of each offer
  // (Arabic view shows Arabic, English view shows English — no mixed text).
  await prisma.script.deleteMany({ where: { source: "corporate-offers" } });

  const taken = new Set<string>();
  let sortOrder = 100;
  let count = 0;

  for (const [arabicName, englishName, code, price, description, active, start, end] of rows) {
    const arBody =
      `الشركة: ${arabicName}\n` +
      `كود الخصم: ${code}\n` +
      `السعر بعد الخصم: ${price}\n` +
      `التفاصيل: ${description}\n` +
      `الحالة: ${active ? "فعّال" : "منتهي"}\n` +
      `الصلاحية: من ${start} إلى ${end}`;

    const enBody =
      `Company: ${englishName}\n` +
      `Promo code: ${code}\n` +
      `Price after discount: ${price}\n` +
      `Details: ${description}\n` +
      `Status: ${active ? "Active" : "Inactive"}\n` +
      `Valid: ${start} → ${end}`;

    const arKey = slug(`${code}-ar`, taken);
    await prisma.script.create({
      data: { key: arKey, title: `${arabicName} — ${code}`, category: "Corporate Offers", country: "KSA", language: "AR", body: arBody, source: "corporate-offers", active, sortOrder },
    });

    const enKey = slug(`${code}-en`, taken);
    await prisma.script.create({
      data: { key: enKey, title: `${englishName} — ${code}`, category: "Corporate Offers", country: "KSA", language: "EN", body: enBody, source: "corporate-offers", active, sortOrder },
    });

    sortOrder += 10;
    count += 2;
  }

  const total = await prisma.script.count({ where: { category: "Corporate Offers" } });
  console.log(`Created ${count} scripts (AR + EN). Category 'Corporate Offers' now has ${total} scripts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
