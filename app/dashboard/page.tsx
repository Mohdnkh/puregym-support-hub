"use client";

/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  profileImage: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  emailVerified: boolean;
};

type AdminUser = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  profileImage: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  emailVerifiedAt: string | null;
  createdAt: string;
};

type Script = {
  id: string;
  key: string;
  title: string;
  category: string;
  country: "ALL" | "KSA" | "UAE";
  language: "AR" | "EN";
  body: string;
  source?: string;
  active: boolean;
  sortOrder?: number;
};

type Country = "KSA" | "UAE";
type Lang = "AR" | "EN";
type Section =
  | "quick"
  | "scripts"
  | "chatbot"
  | "branches"
  | "calculator"
  | "profile"
  | "admin";
type BranchDirectoryItem = {
  id: string;
  name: string;
  city: string;
  gender: "MEN" | "WOMEN" | "ALL";
  url: string;
};
type VarField = {
  key: string;
  label: string;
  token?: string;
  marker?: string;
  inputMode?: "text" | "decimal";
  placeholder?: string;
};

function isAdminRole(role?: User["role"] | AdminUser["role"] | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function isSuperAdmin(role?: User["role"] | AdminUser["role"] | null) {
  return role === "SUPER_ADMIN";
}

const CATEGORY_ORDER = [
  "Quick Scripts",
  "Cancellation & Retention",
  "Freeze Policy",
  "Payment & Billing",
  "Tickets",
  "App / Login / Password",
  "Friend / Bring a Friend",
  "Offers, Prices & PT",
  "Corporate Offers",
  "Membership & Packages",
  "Branches & Hours",
  "Google Reviews",
  "Links",
];

const HIJRI_MONTHS = [
  [1, "محرم", "Muharram"],
  [2, "صفر", "Safar"],
  [3, "ربيع الأول", "Rabi Al-Awwal"],
  [4, "ربيع الآخر", "Rabi Al-Thani"],
  [5, "جمادى الأولى", "Jumada Al-Awwal"],
  [6, "جمادى الآخرة", "Jumada Al-Thani"],
  [7, "رجب", "Rajab"],
  [8, "شعبان", "Shaaban"],
  [9, "رمضان", "Ramadan"],
  [10, "شوال", "Shawwal"],
  [11, "ذو القعدة", "Dhu Al-Qidah"],
  [12, "ذو الحجة", "Dhu Al-Hijjah"],
] as const;

function categoryRank(category: string) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? 999 : index;
}

function emojiFor(country: Country | "ALL") {
  if (country === "UAE") return "💙";
  return "💚";
}

function applyUserName(text: string, language: Lang, user: User | null) {
  const name =
    language === "AR" ? user?.nameAr || "الفريق" : user?.nameEn || "Team";

  return String(text || "")
    .replaceAll("{{employeeName}}", name)
    .replaceAll("(اسم الموظف)", name)
    .replaceAll("(Agent Name)", name)
    .replaceAll("[Agent Name]", name)
    .replaceAll("معك محمد من بيورجيم", `معك ${name} من بيورجيم`)
    .replaceAll("this is Mohammed from PureGym", `this is ${name} from PureGym`)
    .replaceAll("This is Mohammed from PureGym", `This is ${name} from PureGym`)
    .replaceAll("example@email.com", "")
    .replaceAll("example@gmail.com", "")
    .replaceAll("0000000000", "")
    .replaceAll("00/00/0000", "00-00-2020")
    .replaceAll("__/__/____", "00-00-2020");
}

// Resolve {masculine|feminine} markers based on the selected gender.
function applyGender(text: string, gender: "M" | "F") {
  return String(text || "").replace(
    /\{([^{}|]*)\|([^{}]*)\}/g,
    (_m, masc, fem) => (gender === "F" ? fem : masc),
  );
}

function hasGenderMarkers(text: string) {
  return /\{[^{}|]*\|[^{}]*\}/.test(String(text || ""));
}

// UAE uses a blue heart, KSA (and default) a green heart.
function applyCountryHeart(text: string, country: Country) {
  return country === "UAE" ? String(text || "").replaceAll("💚", "💙") : String(text || "");
}

const EMOJI_RE = /[\p{Extended_Pictographic}](?:\uFE0F|\u200D[\p{Extended_Pictographic}\uFE0F]+)*/gu;
const LEADING_EMOJI_RE = /^((?:[\p{Extended_Pictographic}]\uFE0F?|\s|\u200D)+)/u;
const URL_RE = /https?:\/\/\S+/i;

function moveLeadingEmojiToEnd(text: string) {
  const value = String(text || "").trim();
  const match = value.match(LEADING_EMOJI_RE);
  if (!match?.[1] || !EMOJI_RE.test(match[1])) {
    EMOJI_RE.lastIndex = 0;
    return value;
  }

  EMOJI_RE.lastIndex = 0;
  const emojis = Array.from(match[1].matchAll(EMOJI_RE), (item) => item[0]).join(" ");
  const body = value.slice(match[0].length).trim();
  return body && emojis ? `${body} ${emojis}` : value;
}

function removeDearTerms(text: string) {
  return String(text || "")
    .replace(/\bعزيزي\s*\/\s*عزيزتي\b/g, "")
    .replace(/\bعزيزتي\s*\/\s*عزيزي\b/g, "")
    .replace(/\bعزيزي\b/g, "")
    .replace(/\bعزيزتي\b/g, "")
    .replace(/\s+([،,.!?؛:])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function limitEmojiCount(text: string, max = 2) {
  let count = 0;
  return String(text || "")
    .replace(EMOJI_RE, (emoji) => {
      count += 1;
      return count <= max ? emoji : "";
    })
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function officialUrl(type: "join" | "app" | "terms", country: Country, language: Lang) {
  if (type === "join") {
    const countryCode = country === "KSA" ? "SA" : "AE";
    const lang = language === "AR" ? "arabic" : "english";
    return `https://puregym-arabia.exerp.site/join/center?country=${countryCode}&lang=${lang}`;
  }

  if (type === "app") {
    if (country === "KSA") {
      return language === "AR"
        ? "https://ksa.puregymarabia.com/puregym-app"
        : "https://ksa.puregymarabia.com/en-gb/puregym-app";
    }
    return language === "AR"
      ? "https://uae.puregymarabia.com/ar-ae/apply-pure-gym"
      : "https://uae.puregymarabia.com/puregym-app";
  }

  if (country === "KSA") {
    return language === "AR"
      ? "https://ksa.puregymarabia.com/terms-conditions"
      : "https://ksa.puregymarabia.com/en-gb/terms-conditions";
  }

  return language === "AR"
    ? "https://uae.puregymarabia.com/ar-ae/terms-conditions"
    : "https://uae.puregymarabia.com/terms-conditions";
}

function refreshKnownOfficialLinks(text: string) {
  return String(text || "")
    .replaceAll("https://uae.puregymarabia.com/ar-ae/puregym-app", "https://uae.puregymarabia.com/ar-ae/apply-pure-gym")
    .replaceAll("https://ksa.puregymarabia.com/fitness-classes", "https://ksa.puregymarabia.com/training-classes")
    .replaceAll("https://ksa.puregymarabia.com/en-gb/training-classes", "https://ksa.puregymarabia.com/en-gb/fitness-classes")
    .replaceAll("https://uae.puregymarabia.com/ar-ae/workout-guide", "https://uae.puregymarabia.com/ar-ae/workout-builder");
}

function appendMissingContextLink(script: Script, text: string, country: Country) {
  if (URL_RE.test(text)) return text;

  const language = script.language === "EN" ? "EN" : "AR";
  const haystack = `${script.title} ${script.category} ${text}`.toLowerCase();
  const label = language === "AR" ? "الرابط الرسمي:" : "Official link:";
  let url = "";
  const explicitlyAsksForLink =
    /من خلال الرابط|عبر الرابط|عن طريق الرابط|الرابط التالي|اضغط الرابط|افتح الرابط|استخدم الرابط|رابط التسجيل|صفحة التسجيل|اللينك|link below|through the link|via the link|using the link|open the link|click the link|registration page/i.test(
      haystack,
    );

  if (!explicitlyAsksForLink) return text;

  if (
    /join|register|signup|membership|انضم|التسجيل|الاشتراك|العضوية|registration page|رابط التسجيل|صفحة التسجيل/i.test(
      haystack,
    )
  ) {
    url = officialUrl("join", country, language);
  } else if (/app|application|تطبيق/i.test(haystack)) {
    url = officialUrl("app", country, language);
  } else if (/terms|conditions|الشروط|الأحكام|الاحكام/i.test(haystack)) {
    url = officialUrl("terms", country, language);
  }

  return url ? `${text.trim()}\n\n${label}\n${url}` : text;
}

function formatScriptForUser(
  script: Script,
  user: User | null,
  country: Country,
  gender: "M" | "F" = "M",
) {
  const language = script.language === "EN" ? "EN" : "AR";
  let body = applyCountryHeart(
    applyGender(applyUserName(script.body, language, user), gender),
    country,
  );

  body = refreshKnownOfficialLinks(body);

  if (script.category === "Quick Scripts") {
    return limitEmojiCount(body, 2);
  }

  body = removeDearTerms(body);
  body = moveLeadingEmojiToEnd(body);
  return appendMissingContextLink(script, body, country);
}

function variableLabel(token: string) {
  const clean = token.replace(/^[\[(]+|[\])]+$/g, "").trim();
  if (/membership type|type|plan|package|نوع|عضوية|الباقة/i.test(clean)) return "Membership type / نوع العضوية";
  if (/duration|period|مدة|الفترة/i.test(clean)) return "Duration / المدة";
  if (/amount|price|fee|مبلغ|السعر|رسوم/i.test(clean)) return "Amount / المبلغ";
  if (/date|تاريخ/i.test(clean)) return "Date / التاريخ";
  if (/member name|customer|client|اسم|العميل|العضو/i.test(clean)) return "Member name / اسم العضو";
  return clean || token;
}

function prepareVarFill(text: string) {
  const fields: VarField[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(/\[([^\[\]\n]{1,40})\]/g)) {
    const token = match[0];
    if (seen.has(token)) continue;
    seen.add(token);
    fields.push({
      key: token,
      token,
      label: variableLabel(token),
      inputMode: /amount|price|fee|مبلغ|السعر|رسوم/i.test(token) ? "decimal" : "text",
      placeholder: token,
    });
  }

  for (const token of ["(اسم العميل)", "(اسم العضو)", "(Member Name)", "(Customer Name)"]) {
    if (!text.includes(token) || seen.has(token)) continue;
    seen.add(token);
    fields.push({
      key: token,
      token,
      label: variableLabel(token),
      placeholder: token,
    });
  }

  let preparedText = text;
  let dateIndex = 0;
  preparedText = preparedText.replace(
    /\b(?:00[-/]00[-/](?:0000|2020)|__[-/]__[-/]____)\b/g,
    (token) => {
      const marker = `__PG_VAR_DATE_${dateIndex}__`;
      fields.push({
        key: marker,
        marker,
        label: `Date ${dateIndex + 1} / التاريخ ${dateIndex + 1}`,
        placeholder: token.includes("/") ? "dd/mm/yyyy" : "dd-mm-yyyy",
      });
      dateIndex += 1;
      return marker;
    },
  );

  return { text: preparedText, fields };
}

// Tiny localStorage cache so the dashboard paints instantly with the last
// known data, then refreshes from the API in the background.
function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — caching is best-effort only
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

function preview(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 120 ? clean.slice(0, 120) + "..." : clean;
}

function money(value: number, country: Country) {
  const currency = country === "KSA" ? "SAR" : "AED";
  if (!Number.isFinite(value)) return `0 ${currency}`;
  return `${value.toFixed(2)} ${currency}`;
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const a = new Date(start);
  const b = new Date(end);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function normalizeDigits(value: string) {
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabic.indexOf(digit);
    if (arabicIndex >= 0) return String(arabicIndex);
    const persianIndex = persian.indexOf(digit);
    return persianIndex >= 0 ? String(persianIndex) : digit;
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(/\//g, "-");
}

function gregorianToHijri(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const parts = formatter.formatToParts(date);
  const day = Number(
    normalizeDigits(parts.find((part) => part.type === "day")?.value || "0"),
  );
  const month = Number(
    normalizeDigits(parts.find((part) => part.type === "month")?.value || "0"),
  );
  const year = Number(
    normalizeDigits(parts.find((part) => part.type === "year")?.value || "0"),
  );

  return { day, month, year };
}

function hijriToGregorian(
  hijriDay: number,
  hijriMonth: number,
  hijriYear: number,
) {
  if (!hijriDay || !hijriMonth || !hijriYear) return null;

  const estimatedGregorianYear = Math.floor(hijriYear * 0.970224 + 621.5774);
  const start = Date.UTC(estimatedGregorianYear - 1, 0, 1, 12);
  const end = Date.UTC(estimatedGregorianYear + 1, 11, 31, 12);

  for (let time = start; time <= end; time += 86400000) {
    const date = new Date(time);
    const hijri = gregorianToHijri(date);
    if (
      hijri.day === hijriDay &&
      hijri.month === hijriMonth &&
      hijri.year === hijriYear
    ) {
      return date;
    }
  }

  return null;
}

function hijriMonthName(month: number) {
  const found = HIJRI_MONTHS.find(([num]) => num === month);
  return found ? `${found[1]} / ${found[2]}` : "";
}

function linkifyParts(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={index} href={part} target="_blank" rel="noreferrer">
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function branchGender(name: string): BranchDirectoryItem["gender"] {
  if (/women|ladies|female|نسائ|سيدات/i.test(name)) return "WOMEN";
  if (/\bmen\b|\bmale\b|رجال/i.test(name)) return "MEN";
  return "ALL";
}

function branchGenderLabel(gender: BranchDirectoryItem["gender"], language: Lang) {
  if (gender === "WOMEN") return language === "AR" ? "نساء" : "Women";
  if (gender === "MEN") return language === "AR" ? "رجال" : "Men";
  return language === "AR" ? "عام" : "All";
}

function parseBranchDirectory(scripts: Script[], country: Country, language: Lang) {
  const locationScripts = scripts.filter(
    (script) =>
      script.active &&
      script.category === "Links" &&
      script.country === country &&
      (script.language === language || (script.language as string) === "BOTH") &&
      /location|map|موقع|خرائط/i.test(`${script.key} ${script.title} ${script.body}`),
  );

  const sources = locationScripts.length
    ? locationScripts
    : scripts.filter(
        (script) =>
          script.active &&
          script.category === "Links" &&
          script.country === country &&
          /location|map|موقع|خرائط/i.test(`${script.key} ${script.title} ${script.body}`),
      );

  const branches: BranchDirectoryItem[] = [];
  const seen = new Set<string>();

  for (const script of sources) {
    let city = country === "KSA" ? "Saudi Arabia" : "UAE";
    for (const rawLine of script.body.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;

      const cityMatch = line.match(/^(.+?)\s+Branches\s*:?\s*$/i);
      if (cityMatch) {
        city = cityMatch[1].trim();
        continue;
      }

      const urlMatch = line.match(/https?:\/\/\S+/);
      if (!urlMatch) continue;

      const url = urlMatch[0].replace(/[),.;]+$/, "");
      const name = line
        .slice(0, urlMatch.index)
        .replace(/[:\-–—]+$/g, "")
        .trim();
      if (!name || /location links|virtual tour/i.test(name)) continue;

      const detectedCity =
        country === "UAE" && /^Dubai\b/i.test(name) ? "Dubai" : city;
      const id = `${country}:${name.toLowerCase()}:${url.toLowerCase()}`;
      if (seen.has(id)) continue;
      seen.add(id);

      branches.push({
        id,
        name,
        city: detectedCity,
        gender: branchGender(name),
        url,
      });
    }
  }

  return branches.sort(
    (a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
  );
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ/g, "")
    .trim();
}

const ChatbotPanel = dynamic(
  () => import("./DashboardPanels").then((mod) => mod.ChatbotPanel),
  { ssr: false, loading: () => <PanelLoader label="AI Chatbot" /> },
);

const CalculatorPanel = dynamic(
  () => import("./DashboardPanels").then((mod) => mod.CalculatorPanel),
  { ssr: false, loading: () => <PanelLoader label="Calculation Tool" /> },
);

const ProfilePanel = dynamic(
  () => import("./DashboardPanels").then((mod) => mod.ProfilePanel),
  { ssr: false, loading: () => <PanelLoader label="Profile" /> },
);

const AdminPanel = dynamic(
  () => import("./DashboardPanels").then((mod) => mod.AdminPanel),
  { ssr: false, loading: () => <PanelLoader label="Admin Editor" /> },
);

function PanelLoader({ label }: { label: string }) {
  return (
    <div className="card panel-loader">
      <b>{label}</b>
      <span>Loading tools...</span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [editingQuickId, setEditingQuickId] = useState<string | null>(null);
  const [country, setCountry] = useState<Country>("KSA");
  const [language, setLanguage] = useState<Lang>("AR");
  const [section, setSection] = useState<Section>("quick");
  const [category, setCategory] = useState("Cancellation & Retention");
  const [selectedId, setSelectedId] = useState("");
  const [editorText, setEditorText] = useState("");
  const [quickNoteText, setQuickNoteText] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [scriptSearch, setScriptSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [offerFilter, setOfferFilter] = useState<"active" | "inactive" | "all">("active");
  const [quickGender, setQuickGender] = useState<Record<string, "M" | "F">>({});
  const [draggedQuickId, setDraggedQuickId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  // Ctrl+K palette + per-agent usage tracking + fill-before-copy variables.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [varFill, setVarFill] = useState<{
    title: string;
    text: string;
    rawText: string;
    fields: VarField[];
    values: Record<string, string>;
  } | null>(null);

  async function loadScripts() {
    const data = await fetch("/api/scripts").then((res) => res.json());
    setScripts(data.scripts || []);
    writeCache("pg_cache_scripts", data.scripts || []);
  }

  async function loadFavorites() {
    const data = await fetch("/api/favorites")
      .then((res) => res.json())
      .catch(() => ({ scriptIds: [] }));
    setFavoriteIds(data.scriptIds || []);
    writeCache("pg_cache_favorites", data.scriptIds || []);
  }

  // Quick scripts are shared (Script "Quick Scripts" category), so admin edits,
  // reordering and deletes apply to every agent.
  async function saveSharedQuickScript(item: Script) {
    const res = await fetch(`/api/scripts/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, language: item.language, body: item.body }),
    });
    if (!res.ok) return alert("Quick script save failed.");
    setEditingQuickId(null);
    await loadScripts();
  }

  async function addSharedQuickScript() {
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: language === "AR" ? "سكربت سريع جديد" : "New Quick Script",
        category: "Quick Scripts",
        country: "ALL",
        language,
        body: language === "AR" ? "اكتب السكربت هنا" : "Write the script here",
      }),
    });
    if (!res.ok) return alert("Quick script create failed.");
    await loadScripts();
  }

  // Drag-and-drop reorder of the shared quick scripts (applies to everyone).
  async function reorderQuickByDrag(targetId: string) {
    if (!draggedQuickId || draggedQuickId === targetId) {
      setDraggedQuickId(null);
      return;
    }
    const ids = quickScripts.map((s) => s.id);
    const from = ids.indexOf(draggedQuickId);
    const to = ids.indexOf(targetId);
    setDraggedQuickId(null);
    if (from < 0 || to < 0) return;

    ids.splice(to, 0, ids.splice(from, 1)[0]);
    await fetch("/api/scripts/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    await loadScripts();
  }

  async function deleteSharedQuickScript(id: string) {
    if (!confirm("Delete this quick script for everyone?")) return;
    const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Quick script delete failed.");
    await loadScripts();
  }

  function updateSharedQuickScript(id: string, patch: Partial<Script>) {
    setScripts((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  useEffect(() => {
    // Paint instantly from the local cache, then refresh from the API.
    const cachedScripts = readCache<Script[]>("pg_cache_scripts");
    if (cachedScripts?.length) setScripts(cachedScripts);
    const cachedFavorites = readCache<string[]>("pg_cache_favorites");
    if (cachedFavorites?.length) setFavoriteIds(cachedFavorites);
    setUsageCounts(readCache<Record<string, number>>("pg_usage_counts") || {});

    async function load() {
      const me = await fetch("/api/auth/me").then((res) => res.json());
      if (!me.user) {
        router.push("/login");
        return;
      }
      setUser(me.user);
      // Fetch fresh data in parallel (cache already painted above).
      await Promise.all([loadScripts(), loadFavorites()]);
    }
    load();
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("pg_theme");
    setDarkMode(saved === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("pg_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dataset.country = country;
  }, [country]);

  useEffect(() => {
    function onScroll() {
      setShowTopButton(window.scrollY > 320);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleScripts = useMemo(() => {
    return scripts
      .filter(
        (script) =>
          script.active &&
          (script.country === country || script.country === "ALL") &&
          (script.language === language || (script.language as string) === "BOTH"),
      )
      .sort(
        (a, b) =>
          categoryRank(a.category) - categoryRank(b.category) ||
          (a.sortOrder || 0) - (b.sortOrder || 0) ||
          a.title.localeCompare(b.title),
      );
  }, [scripts, country, language]);

  const categories = useMemo(() => {
    const set = new Set(
      visibleScripts
        .filter((script) => script.category !== "Quick Scripts")
        .map((script) => script.category),
    );
    return Array.from(set).sort(
      (a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b),
    );
  }, [visibleScripts]);

  // Shared quick scripts (Script "Quick Scripts" category) — same for all agents.
  const quickScripts = useMemo(
    () =>
      scripts
        .filter(
          (script) =>
            script.category === "Quick Scripts" &&
            script.active &&
            (script.country === country || script.country === "ALL") &&
            (script.language === language || (script.language as string) === "BOTH"),
        )
        .sort(
          (a, b) =>
            (a.sortOrder || 0) - (b.sortOrder || 0) ||
            a.title.localeCompare(b.title),
        ),
    [scripts, country, language],
  );

  const favoriteQuickScripts = useMemo(
    () => quickScripts.filter((script) => favoriteIds.includes(script.id)),
    [quickScripts, favoriteIds],
  );

  const quickStickyText = useMemo(() => {
    return quickScripts
      .map(
        (script) =>
          `${script.title}\n${formatScriptForUser(script, user, country, "M")}`,
      )
      .join("\n\n━━━━━━━━━━━━━━━━━━━━\n\n");
  }, [quickScripts, user, country]);

  const filteredScripts = useMemo(
    () => visibleScripts.filter((script) => script.category === category),
    [visibleScripts, category],
  );

  // Inactive (expired) scripts in the current category, for the Active/Inactive filter.
  const inactiveForCategory = useMemo(
    () =>
      scripts
        .filter(
          (script) =>
            !script.active &&
            script.category === category &&
            (script.country === country || script.country === "ALL") &&
            (script.language === language || (script.language as string) === "BOTH"),
        )
        .sort(
          (a, b) =>
            (a.sortOrder || 0) - (b.sortOrder || 0) ||
            a.title.localeCompare(b.title),
        ),
    [scripts, category, country, language],
  );

  const categoryHasInactive = inactiveForCategory.length > 0;

  const scriptSearchValue = scriptSearch.trim();

  // Precompute the normalized haystack once per data change (not per keystroke)
  // so typing in search stays instant even with hundreds of scripts.
  const searchIndex = useMemo(() => {
    const index = new Map<string, string>();
    for (const script of visibleScripts) {
      const body = formatScriptForUser(script, user, country, quickGender[script.id] || "M");
      index.set(
        script.id,
        normalizeSearchText(
          [script.title, script.category, script.country, script.language, script.key, body].join(" "),
        ),
      );
    }
    return index;
  }, [visibleScripts, user, country, quickGender]);

  const searchedScripts = useMemo(() => {
    const query = normalizeSearchText(scriptSearchValue);
    if (!query) return [];

    const words = query.split(/\s+/).filter(Boolean);

    return visibleScripts.filter((script) => {
      const haystack = searchIndex.get(script.id) || "";
      return words.every((word) => haystack.includes(word));
    });
  }, [visibleScripts, searchIndex, scriptSearchValue]);

  const displayedScripts = scriptSearchValue
    ? searchedScripts
    : offerFilter === "inactive"
      ? inactiveForCategory
      : offerFilter === "all"
        ? [...filteredScripts, ...inactiveForCategory]
        : filteredScripts;

  const mostUsedScripts = useMemo(
    () =>
      visibleScripts
        .filter(
          (script) =>
            script.category !== "Quick Scripts" &&
            (usageCounts[script.id] || 0) > 0,
        )
        .sort((a, b) => (usageCounts[b.id] || 0) - (usageCounts[a.id] || 0))
        .slice(0, 10),
    [visibleScripts, usageCounts],
  );

  const branchDirectory = useMemo(
    () => parseBranchDirectory(scripts, country, language),
    [scripts, country, language],
  );

  const branchSearchValue = branchSearch.trim();

  const filteredBranches = useMemo(() => {
    const query = normalizeSearchText(branchSearchValue);
    if (!query) return branchDirectory;
    const words = query.split(/\s+/).filter(Boolean);
    return branchDirectory.filter((branch) => {
      const haystack = normalizeSearchText(
        [
          branch.name,
          branch.city,
          branchGenderLabel(branch.gender, "EN"),
          branchGenderLabel(branch.gender, "AR"),
          branch.url,
        ].join(" "),
      );
      return words.every((word) => haystack.includes(word));
    });
  }, [branchDirectory, branchSearchValue]);

  const branchHoursScript = useMemo(() => {
    const matches = scripts.filter(
      (script) =>
        script.active &&
        script.category === "Branches & Hours" &&
        script.country === country &&
        (script.language === language || (script.language as string) === "BOTH"),
    );
    return (
      matches.find((script) =>
        /working-hours|working hours|ساعات|أوقات|اوقات/i.test(
          `${script.key} ${script.title}`,
        ),
      ) ||
      matches.find((script) => !/eid|عيد/i.test(`${script.key} ${script.title}`)) ||
      matches[0] ||
      null
    );
  }, [scripts, country, language]);

  const branchHoursText = branchHoursScript
    ? formatScriptForUser(branchHoursScript, user, country)
    : "";

  const branchJoinUrl =
    country === "KSA"
      ? "https://puregym-arabia.exerp.site/join/center?country=SA&lang=english"
      : "https://puregym-arabia.exerp.site/join/center?country=AE&lang=english";

  const selected = useMemo(() => {
    const byId =
      filteredScripts.find((script) => script.id === selectedId) ||
      inactiveForCategory.find((script) => script.id === selectedId);
    if (byId) return byId;

    // When only the language changed, keep the user on the same script by
    // matching its counterpart in the other language (same key base or title)
    // instead of jumping back to the first script.
    const prev = scripts.find((script) => script.id === selectedId);
    if (prev) {
      const base = prev.key.replace(/[-_](ar|en)$/i, "");
      const sibling =
        filteredScripts.find(
          (script) => script.key.replace(/[-_](ar|en)$/i, "") === base,
        ) ||
        filteredScripts.find(
          (script) => script.title.trim() === prev.title.trim(),
        );
      if (sibling) return sibling;
    }

    return filteredScripts[0] || null;
  }, [filteredScripts, inactiveForCategory, selectedId, scripts]);

  useEffect(() => {
    if (!categories.includes(category) && categories[0])
      setCategory(categories[0]);
  }, [categories, category]);

  // Reset the Active/Inactive filter back to Active whenever the category changes.
  useEffect(() => {
    setOfferFilter("active");
  }, [category]);

  useEffect(() => {
    setQuickNoteText(quickStickyText);
  }, [quickStickyText]);

  useEffect(() => {
    if (selected) {
      setSelectedId(selected.id);
      setEditorText(formatScriptForUser(selected, user, country, quickGender[selected.id] || "M"));
    } else {
      setSelectedId("");
      setEditorText("");
    }
  }, [selected, user, country, quickGender]);

  const flash = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 1400);
  }, []);

  function selectScript(script: Script) {
    setSelectedId(script.id);
    setEditorText(formatScriptForUser(script, user, country, quickGender[script.id] || "M"));
  }

  async function toggleFavorite(scriptId: string) {
    const isFavorite = favoriteIds.includes(scriptId);
    setFavoriteIds((current) =>
      isFavorite
        ? current.filter((id) => id !== scriptId)
        : [scriptId, ...current],
    );

    const res = await fetch("/api/favorites", {
      method: isFavorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scriptId }),
    });

    if (!res.ok) {
      await loadFavorites();
      flash("Favorite update failed");
    }
  }

  const copyText = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    flash("Copied");
  }, [flash]);

  const trackUsage = useCallback((id: string) => {
    setUsageCounts((cur) => {
      const next = { ...cur, [id]: (cur[id] || 0) + 1 };
      writeCache("pg_usage_counts", next);
      return next;
    });
  }, []);

  const resetPaletteList = useCallback(() => {
    writeCache("pg_usage_counts", {});
    setUsageCounts({});
    setPaletteQuery("");
    setPaletteIndex(0);
    flash(language === "AR" ? "تم تصفير قائمة البحث السريع" : "Quick search list reset");
  }, [flash, language]);

  const resolveScriptBody = useCallback((script: Script) => {
    return formatScriptForUser(script, user, country, quickGender[script.id] || "M");
  }, [country, quickGender, user]);

  // One copy pipeline everywhere: applies name/gender/heart and tracks usage.
  const smartCopy = useCallback(async (script: Script) => {
    const body = resolveScriptBody(script);
    trackUsage(script.id);
    await copyText(body);
  }, [copyText, resolveScriptBody, trackUsage]);

  const confirmVarFill = useCallback(async () => {
    if (!varFill) return;
    let out = varFill.text;
    for (const field of varFill.fields) {
      const value = (varFill.values[field.key] || "").trim();
      if (!value) continue;
      if (field.marker) out = out.split(field.marker).join(value);
      if (field.token) out = out.split(field.token).join(value);
    }
    setVarFill(null);
    await copyText(out);
  }, [copyText, varFill]);

  // Ctrl+K opens the palette from anywhere; Shift+1..7 moves between sections.
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const key = event.key.toLowerCase();
      const isPaletteShortcut = (event.ctrlKey || event.metaKey) && (key === "k" || event.code === "KeyK");

      if (isPaletteShortcut) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        setPaletteOpen((open) => !open);
        setPaletteQuery("");
        setPaletteIndex(0);
        return;
      }

      if (event.key === "Escape") {
        setPaletteOpen(false);
        setVarFill(null);
        return;
      }

      if (paletteOpen || varFill || isEditableTarget(event.target)) return;

      if (event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
        const isAdmin = isAdminRole(user?.role);
        const shortcuts: Record<string, Section> = {
          Digit1: "quick",
          Digit2: "scripts",
          Digit3: "chatbot",
          Digit4: "branches",
          Digit5: "calculator",
          Digit6: isAdmin ? "admin" : "profile",
          Digit7: "profile",
        };
        const next = shortcuts[event.code];
        if (next && (next !== "admin" || isAdmin)) {
          event.preventDefault();
          setSection(next);
        }
        return;
      }

      if (event.key === "Enter" && section === "scripts" && selected) {
        event.preventDefault();
        smartCopy(selected);
      }
    }
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [paletteOpen, section, selected, smartCopy, user?.role, varFill]);

  // Palette results: most-used first when empty, instant search otherwise.
  const paletteResults = useMemo(() => {
    const query = normalizeSearchText(paletteQuery.trim());
    if (!query) {
      return [...visibleScripts]
        .filter((script) => (usageCounts[script.id] || 0) > 0)
        .sort((a, b) => (usageCounts[b.id] || 0) - (usageCounts[a.id] || 0))
        .slice(0, 10);
    }
    const words = query.split(/\s+/).filter(Boolean);
    return visibleScripts
      .filter((script) => {
        const haystack = searchIndex.get(script.id) || "";
        return words.every((word) => haystack.includes(word));
      })
      .slice(0, 20);
  }, [paletteQuery, visibleScripts, usageCounts, searchIndex]);

  async function spellcheck() {
    try {
      const res = await fetch("/api/ai/spellcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editorText, language }),
      });
      const data = await res
        .json()
        .catch(() => ({ error: "AI route returned a non-JSON response." }));
      if (res.ok) {
        setEditorText(data.text);
        flash("تم التعديل");
      } else {
        flash(data.error || "Spellcheck failed");
      }
    } catch (error) {
      flash(error instanceof Error ? error.message : "Spellcheck failed");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const title =
    section === "quick"
      ? "Quick Scripts"
      : section === "scripts"
        ? "Script Library"
        : section === "chatbot"
          ? "AI Chatbot"
          : section === "branches"
            ? "Branch Directory"
            : section === "calculator"
              ? "Calculation Tool"
              : section === "profile"
                ? "Profile"
                : "Admin Editor";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <img src="/pg-hub-mark.svg" alt="PureGym Hub" />
          </div>
          <div>
            <div className="brand">PureGym Hub</div>
            <div className="subbrand">Scripts • AI • Tools</div>
          </div>
        </div>

        <button
          className={`nav-button ${section === "quick" ? "active" : ""}`}
          onClick={() => setSection("quick")}
        >
          <span>Quick Scripts</span>
          <kbd>Shift+1</kbd>
        </button>
        <button
          className={`nav-button ${section === "scripts" ? "active" : ""}`}
          onClick={() => setSection("scripts")}
        >
          <span>Script Library</span>
          <kbd>Shift+2</kbd>
        </button>
        <button
          className={`nav-button ${section === "chatbot" ? "active" : ""}`}
          onClick={() => setSection("chatbot")}
        >
          <span>AI Chatbot</span>
          <kbd>Shift+3</kbd>
        </button>
        <button
          className={`nav-button ${section === "branches" ? "active" : ""}`}
          onClick={() => setSection("branches")}
        >
          <span>Branch Directory</span>
          <kbd>Shift+4</kbd>
        </button>
        <button
          className={`nav-button ${section === "calculator" ? "active" : ""}`}
          onClick={() => setSection("calculator")}
        >
          <span>Calculation Tool</span>
          <kbd>Shift+5</kbd>
        </button>
        {isAdminRole(user?.role) && (
          <button
            className={`nav-button ${section === "admin" ? "active" : ""}`}
            onClick={() => setSection("admin")}
          >
            <span>Admin Editor</span>
            <kbd>Shift+6</kbd>
          </button>
        )}

        <div className="sidebar-user">
          <div className="profile-chip" aria-label="User account summary">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" />
            ) : (
              <span>
                {(language === "AR" ? user?.nameAr : user?.nameEn)?.slice(
                  0,
                  1,
                ) || "P"}
              </span>
            )}
            <b>{language === "AR" ? user?.nameAr : user?.nameEn}</b>
          </div>
          <span>{user?.email}</span>
          <button
            className="btn secondary small full"
            onClick={() => setSection("profile")}
          >
            Profile {isAdminRole(user?.role) ? "(Shift+7)" : "(Shift+6)"}
          </button>
          <button
            className="btn secondary small full"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light mode" : "Dark mode"}
          </button>
          <button className="btn secondary small full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>{title}</h1>
            <p>
              {section === "chatbot"
                ? "General AI • auto language and country detection"
                : `${country} • ${language === "AR" ? "Arabic" : "English"}`}
            </p>
          </div>
          <button
            className="palette-launch"
            onClick={() => {
              setPaletteOpen(true);
              setPaletteQuery("");
              setPaletteIndex(0);
            }}
          >
            🔍 {language === "AR" ? "بحث سريع" : "Quick search"} <kbd>Ctrl+K</kbd>
          </button>
          {section !== "chatbot" && section !== "calculator" && section !== "admin" && (
            <div className="toolbar context-switcher">
              <button
                className={`toggle ksa ${country === "KSA" ? "active" : ""}`}
                onClick={() => setCountry("KSA")}
              >
                💚 KSA
              </button>
              <button
                className={`toggle uae ${country === "UAE" ? "active" : ""}`}
                onClick={() => setCountry("UAE")}
              >
                💙 UAE
              </button>
              <button
                className={`toggle ${language === "AR" ? "active" : ""}`}
                onClick={() => setLanguage("AR")}
              >
                Arabic
              </button>
              <button
                className={`toggle ${language === "EN" ? "active" : ""}`}
                onClick={() => setLanguage("EN")}
              >
                English
              </button>
            </div>
          )}
        </div>

        {section === "quick" && (
          <button
            type="button"
            className={`scroll-top-button ${showTopButton ? "visible" : ""}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={language === "AR" ? "الرجوع لأعلى الصفحة" : "Back to top"}
            title={language === "AR" ? "الرجوع لأعلى الصفحة" : "Back to top"}
          >
            ↑
          </button>
        )}

        {message && <div className="toast">{message}</div>}

        {paletteOpen && (
          <div className="palette-overlay" onClick={() => setPaletteOpen(false)}>
            <div className="palette-box" onClick={(event) => event.stopPropagation()}>
              <div className="palette-search-row">
              <input
                autoFocus
                className="palette-input"
                dir="auto"
                placeholder={
                  language === "AR"
                    ? "اكتب أي كلمة… Enter للنسخ الفوري"
                    : "Type anything… Enter copies instantly"
                }
                value={paletteQuery}
                onChange={(event) => {
                  setPaletteQuery(event.target.value);
                  setPaletteIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setPaletteIndex((i) => Math.min(i + 1, paletteResults.length - 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setPaletteIndex((i) => Math.max(i - 1, 0));
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    const hit = paletteResults[paletteIndex];
                    if (hit) {
                      setPaletteOpen(false);
                      smartCopy(hit);
                    }
                  }
                }}
              />
                <button
                  type="button"
                  className="palette-reset"
                  onClick={resetPaletteList}
                  title={language === "AR" ? "تصفير قائمة البحث السريع" : "Reset quick search list"}
                >
                  Reset
                </button>
              </div>
              {!paletteQuery && paletteResults.length > 0 && (
                <div className="palette-hint">
                  ⭐ {language === "AR" ? "الأكثر استخداماً عندك" : "Your most used"}
                </div>
              )}
              <div className="palette-list">
                {paletteResults.map((script, i) => (
                  <button
                    key={script.id}
                    className={`palette-item ${i === paletteIndex ? "active" : ""}`}
                    onMouseEnter={() => setPaletteIndex(i)}
                    onClick={() => {
                      setPaletteOpen(false);
                      smartCopy(script);
                    }}
                  >
                    <b>{script.title}</b>
                    <span>
                      {script.category} • {script.country} • {script.language}
                    </span>
                  </button>
                ))}
                {!paletteResults.length && (
                  <p className="muted-text palette-empty">
                    {paletteQuery
                      ? language === "AR"
                        ? "لا نتائج — جرّب كلمة ثانية"
                        : "No results — try another word"
                      : language === "AR"
                        ? "انسخ سكربتات وبتظهر هون الأكثر استخداماً"
                        : "Copy scripts and your most used will appear here"}
                  </p>
                )}
              </div>
              <div className="palette-footer">
                ↑↓ &nbsp;•&nbsp; Enter = {language === "AR" ? "نسخ" : "Copy"} &nbsp;•&nbsp; Esc
              </div>
            </div>
          </div>
        )}

        {varFill && (
          <div className="palette-overlay" onClick={() => setVarFill(null)}>
            <div className="palette-box varfill-box" onClick={(event) => event.stopPropagation()}>
              <h3 className="varfill-title">{varFill.title}</h3>
              <p className="varfill-sub">
                {language === "AR"
                  ? "عبّي الحقول وبننسخلك السكربت جاهز:"
                  : "Fill the fields and we'll copy the final script:"}
              </p>
              {varFill.fields.map((field, idx) => (
                <div className="field" key={`${field.key}-${idx}`}>
                  <label>{field.label}</label>
                  <input
                    autoFocus={idx === 0}
                    className="input"
                    dir="auto"
                    inputMode={field.inputMode || "text"}
                    placeholder={field.placeholder || field.label}
                    value={varFill.values[field.key] || ""}
                    onChange={(event) =>
                      setVarFill((cur) =>
                        cur ? { ...cur, values: { ...cur.values, [field.key]: event.target.value } } : cur,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        confirmVarFill();
                      }
                    }}
                  />
                </div>
              ))}
              <div className="inline-actions">
                <button
                  className="btn ghost small"
                  onClick={async () => {
                    const raw = varFill.rawText;
                    setVarFill(null);
                    await copyText(raw);
                  }}
                >
                  {language === "AR" ? "نسخ بدون تعبئة" : "Copy as-is"}
                </button>
                <button className="btn small" onClick={confirmVarFill}>
                  {language === "AR" ? "نسخ جاهز ✅" : "Copy filled ✅"}
                </button>
              </div>
            </div>
          </div>
        )}

        {section === "quick" && (
          <>
            {favoriteQuickScripts.length > 0 && (
              <div className="favorites-strip card">
                <div className="section-head compact">
                  <div>
                    <h2>⭐ {language === "AR" ? "المفضّلة" : "Favorites"}</h2>
                  </div>
                </div>
                <div className="favorite-card-grid">
                  {favoriteQuickScripts.map((script) => {
                    const g = quickGender[script.id] || "M";
                    const favShowGender = hasGenderMarkers(script.body);
                    return (
                      <div
                        key={script.id}
                        className="mini-script-card clickable"
                        role="button"
                        tabIndex={0}
                        onClick={() => smartCopy(script)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            smartCopy(script);
                          }
                        }}
                      >
                        <b>{script.title}</b>
                        {favShowGender && (
                          <div
                            className="gender-toggle"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className={g === "M" ? "active" : ""}
                              onClick={(event) => {
                                event.stopPropagation();
                                setQuickGender((x) => ({ ...x, [script.id]: "M" }));
                              }}
                            >
                              {language === "AR" ? "👨 ذكر" : "👨 Male"}
                            </button>
                            <button
                              type="button"
                              className={g === "F" ? "active" : ""}
                              onClick={(event) => {
                                event.stopPropagation();
                                setQuickGender((x) => ({ ...x, [script.id]: "F" }));
                              }}
                            >
                              {language === "AR" ? "👩 أنثى" : "👩 Female"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="quick-layout">
            <div className="quick-note card">
              <div className="section-head compact">
                <div>
                  <h2>{language === "AR" ? "السكربتات السريعة" : "Quick Scripts"}</h2>
                  <p>
                    {language === "AR"
                      ? "سكربتات جاهزة للكل. اكبس أي بطاقة لنسخها، والنجمة تحفظها بمفضّلتك."
                      : "Shared quick scripts. Click a card to copy; the star saves it to your favorites."}
                  </p>
                </div>
                {isAdminRole(user?.role) && (
                  <button className="btn small" onClick={addSharedQuickScript}>
                    {language === "AR" ? "➕ إضافة سكربت سريع" : "➕ Add Quick Script"}
                  </button>
                )}
              </div>
              <textarea
                className="textarea quick-note-textarea"
                value={quickNoteText}
                onChange={(event) => setQuickNoteText(event.target.value)}
                placeholder="Quick note..."
              />
              <div className="inline-actions">
                <button
                  className="btn ghost small"
                  onClick={() => setQuickNoteText(quickStickyText)}
                >
                  Reset to current quick scripts
                </button>
                <button
                  className="btn small"
                  onClick={() => copyText(quickNoteText)}
                >
                  Copy note
                </button>
              </div>
            </div>
            <div className="quick-cards">
              {quickScripts.map((script) => {
                const gender = quickGender[script.id] || "M";
                const body = formatScriptForUser(script, user, country, gender);
                const showGender = hasGenderMarkers(script.body);
                const isEditing = editingQuickId === script.id;
                const canReorder = isAdminRole(user?.role) && !isEditing;
                return (
                  <div
                    className={`mini-script-card quick-script-card ${isEditing ? "editing" : "clickable"} ${canReorder ? "draggable" : ""} ${draggedQuickId === script.id ? "dragging" : ""}`}
                    key={script.id}
                    role={isEditing ? undefined : "button"}
                    tabIndex={isEditing ? undefined : 0}
                    draggable={canReorder}
                    onDragStart={canReorder ? () => setDraggedQuickId(script.id) : undefined}
                    onDragOver={canReorder ? (event) => event.preventDefault() : undefined}
                    onDrop={canReorder ? () => reorderQuickByDrag(script.id) : undefined}
                    onClick={() => !isEditing && smartCopy(script)}
                    onKeyDown={(event) => {
                      if (!isEditing && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        smartCopy(script);
                      }
                    }}
                  >
                    {isEditing ? (
                      <>
                        <div className="quick-edit-grid">
                          <input
                            className="input"
                            value={script.title}
                            onChange={(event) => updateSharedQuickScript(script.id, { title: event.target.value })}
                          />
                          <select
                            className="select"
                            value={script.language === "EN" ? "EN" : "AR"}
                            onChange={(event) => updateSharedQuickScript(script.id, { language: event.target.value as Script["language"] })}
                          >
                            <option value="AR">AR</option>
                            <option value="EN">EN</option>
                          </select>
                        </div>
                        <textarea
                          className="textarea"
                          value={script.body}
                          onChange={(event) => updateSharedQuickScript(script.id, { body: event.target.value })}
                        />
                        <div className="inline-actions quick-card-actions">
                          <button className="btn small" onClick={() => saveSharedQuickScript(script)}>Save</button>
                          <button className="btn ghost small" onClick={() => setEditingQuickId(null)}>Cancel</button>
                          <button className="btn ghost small danger-text" onClick={() => deleteSharedQuickScript(script.id)}>Delete</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="quick-script-topline">
                          <div className="quick-script-emoji">{emojiFor(country)}</div>
                          <b>{script.title}</b>
                          <button
                            className={`star-button ${favoriteIds.includes(script.id) ? "active" : ""}`}
                            title="Favorite"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleFavorite(script.id);
                            }}
                          >
                            {favoriteIds.includes(script.id) ? "★" : "☆"}
                          </button>
                        </div>
                        {showGender && (
                          <div
                            className="gender-toggle"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className={gender === "M" ? "active" : ""}
                              onClick={(event) => {
                                event.stopPropagation();
                                setQuickGender((g) => ({ ...g, [script.id]: "M" }));
                              }}
                            >
                              {language === "AR" ? "👨 ذكر" : "👨 Male"}
                            </button>
                            <button
                              type="button"
                              className={gender === "F" ? "active" : ""}
                              onClick={(event) => {
                                event.stopPropagation();
                                setQuickGender((g) => ({ ...g, [script.id]: "F" }));
                              }}
                            >
                              {language === "AR" ? "👩 أنثى" : "👩 Female"}
                            </button>
                          </div>
                        )}
                        <p>{preview(body)}</p>
                        {isAdminRole(user?.role) && (
                          <div
                            className="quick-admin-controls"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <span className="drag-hint" title="Drag to reorder">
                              ⠿ {language === "AR" ? "اسحب للترتيب" : "Drag to reorder"}
                            </span>
                            <button
                              type="button"
                              className="quick-edit-chip"
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditingQuickId(script.id);
                              }}
                            >
                              {language === "AR" ? "تعديل" : "Edit"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              {!quickScripts.length && (
                <div className="empty-state-card">
                  <h3>No quick scripts</h3>
                  <p>Add a quick script for this country and language.</p>
                </div>
              )}
            </div>
            </div>
          </>
        )}

        {section === "scripts" && (
          <>
            <div className="script-search-card card">
              <div className="script-search-copy">
                <h2>{language === "AR" ? "بحث السكربتات" : "Script Search"}</h2>
                <p>
                  {language === "AR"
                    ? "اكتب أي كلمة من العنوان أو محتوى السكربت مثل: سبب إلغاء، دفع، تجميد، صديق."
                    : "Search by title, category, country, or script content. Example: cancel reason, payment, freeze, friend."}
                </p>
              </div>
              <div className="script-search-box">
                <input
                  className="input"
                  value={scriptSearch}
                  onChange={(event) => setScriptSearch(event.target.value)}
                  placeholder={
                    language === "AR"
                      ? "ابحث عن أي سكربت..."
                      : "Search any script..."
                  }
                  dir={language === "AR" ? "rtl" : "ltr"}
                />
                {scriptSearchValue && (
                  <button
                    className="btn ghost small"
                    onClick={() => setScriptSearch("")}
                  >
                    {language === "AR" ? "مسح" : "Clear"}
                  </button>
                )}
              </div>
            </div>

            {mostUsedScripts.length > 0 && (
              <div className="most-used-strip card">
                <div className="most-used-head">
                  <div>
                    <h2>{language === "AR" ? "الأكثر استخداماً" : "Most Used"}</h2>
                    <p>
                      {language === "AR"
                        ? "أسرع سكربتاتك حسب نسخك أنت فقط."
                        : "Your fastest scripts, based only on your own copies."}
                    </p>
                  </div>
                  <kbd>Enter</kbd>
                </div>
                <div className="most-used-grid">
                  {mostUsedScripts.map((script) => (
                    <button
                      key={script.id}
                      className="most-used-chip"
                      onClick={() => {
                        setCategory(script.category);
                        selectScript(script);
                        smartCopy(script);
                      }}
                      title={script.title}
                    >
                      <b>{script.title}</b>
                      <span>
                        {script.category} • {usageCounts[script.id] || 0}x
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="category-bar card">
              <div className="category-bar-head">
                <b>{language === "AR" ? "اختر نوع السكربت" : "Choose a script category"}</b>
                <span>{language === "AR" ? "اضغط على التصنيف لعرض سكربتاته" : "Click a category to filter scripts"}</span>
              </div>
              <div className="category-row">
                {categories.map((item) => {
                  const count = visibleScripts.filter(
                    (script) => script.category === item,
                  ).length;
                  return (
                    <button
                      key={item}
                      className={`category-card ${category === item ? "active" : ""}`}
                      onClick={() => setCategory(item)}
                    >
                      <b>{item}</b>
                      <span>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="library-layout">
              <div className="script-results">
                <div className="section-head">
                  <div>
                    <h2>
                      {scriptSearchValue
                        ? language === "AR"
                          ? "نتائج البحث"
                          : "Search Results"
                        : category}
                    </h2>
                    <p>
                      {scriptSearchValue
                        ? `${displayedScripts.length} ${language === "AR" ? "نتيجة مطابقة" : "matching results"}`
                        : `${displayedScripts.length} ${language === "AR" ? "سكربت متاح" : "scripts available"}`}
                    </p>
                  </div>
                  {!scriptSearchValue && categoryHasInactive && (
                    <div className="offer-filter">
                      <button
                        className={`toggle ${offerFilter === "active" ? "active" : ""}`}
                        onClick={() => setOfferFilter("active")}
                      >
                        {language === "AR" ? "الفعّالة" : "Active"}
                      </button>
                      <button
                        className={`toggle ${offerFilter === "inactive" ? "active" : ""}`}
                        onClick={() => setOfferFilter("inactive")}
                      >
                        {language === "AR" ? "المنتهية" : "Inactive"}
                      </button>
                      <button
                        className={`toggle ${offerFilter === "all" ? "active" : ""}`}
                        onClick={() => setOfferFilter("all")}
                      >
                        {language === "AR" ? "الكل" : "All"}
                      </button>
                    </div>
                  )}
                </div>
                {scriptSearchValue && displayedScripts.length === 0 ? (
                  <div className="empty-search-state">
                    <b>
                      {language === "AR" ? "لا توجد نتائج" : "No results found"}
                    </b>
                    <span>
                      {language === "AR"
                        ? "جرّب كلمة ثانية أو ابحث بجزء من نص السكربت."
                        : "Try another keyword or search by part of the script text."}
                    </span>
                  </div>
                ) : (
                  <div className="script-card-grid">
                    {displayedScripts.map((script) => {
                      const body = formatScriptForUser(script, user, country, quickGender[script.id] || "M");
                      return (
                        <div
                          key={script.id}
                          className={`script-card ${selectedId === script.id ? "active" : ""}`}
                          onClick={() => {
                            selectScript(script);
                            smartCopy(script);
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="script-card-top">
                            <b>{script.title}</b>
                            <div className="script-card-actions">
                              {scriptSearchValue && (
                                <span>{script.category}</span>
                              )}
                              <span>{script.country}</span>
                            </div>
                          </div>
                          <p>{preview(body)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="script-box card">
                <div className="section-head compact">
                  <div>
                    <h2>Script Box</h2>
                    <p>{selected?.title || "Select a script"}</p>
                  </div>
                  <div className="toolbar">
                    <button
                      className="btn ghost small"
                      onClick={() =>
                        selected &&
                        setEditorText(
                          formatScriptForUser(selected, user, country, quickGender[selected.id] || "M"),
                        )
                      }
                      disabled={!selected}
                    >
                      {language === "AR" ? "إرجاع" : "Reset"}
                    </button>
                    <button
                      className="btn ghost small"
                      onClick={spellcheck}
                      disabled={!editorText}
                    >
                      {language === "AR" ? "تدقيق" : "Proofread"}
                    </button>
                    <button
                      className="btn small"
                      onClick={() => copyText(editorText)}
                      disabled={!editorText}
                    >
                      {language === "AR" ? "نسخ" : "Copy"}
                    </button>
                  </div>
                </div>
                <textarea
                  className="textarea script-editor"
                  dir={language === "AR" ? "rtl" : "ltr"}
                  value={editorText}
                  onChange={(event) => setEditorText(event.target.value)}
                />
                {category === "Links" && (
                  <div className="link-preview">{linkifyParts(editorText)}</div>
                )}
              </div>
            </div>
          </>
        )}

        {section === "branches" && (
          <>
            <div className="script-search-card card branch-search-card">
              <div className="script-search-copy">
                <h2>{language === "AR" ? "دليل الفروع" : "Branch Directory"}</h2>
                <p>
                  {language === "AR"
                    ? "ابحث باسم الفرع أو المدينة أو نوع الفرع، وافتح رابط الخرائط مباشرة."
                    : "Search by branch, city, or branch type, then open maps instantly."}
                </p>
              </div>
              <div className="script-search-box">
                <input
                  className="input"
                  value={branchSearch}
                  onChange={(event) => setBranchSearch(event.target.value)}
                  placeholder={
                    language === "AR"
                      ? "مثال: Riyadh, Hamra, Women..."
                      : "Example: Riyadh, Hamra, Women..."
                  }
                  dir="auto"
                />
                {branchSearchValue && (
                  <button
                    className="btn ghost small"
                    onClick={() => setBranchSearch("")}
                  >
                    {language === "AR" ? "مسح" : "Clear"}
                  </button>
                )}
              </div>
            </div>

            <div className="branch-summary-row">
              <div className="branch-hours-card card">
                <div className="section-head compact">
                  <div>
                    <h2>{language === "AR" ? "ساعات العمل" : "Working Hours"}</h2>
                    <p>
                      {branchHoursScript?.title ||
                        (language === "AR" ? "لا يوجد سكربت ساعات عمل" : "No working-hours script found")}
                    </p>
                  </div>
                  <button
                    className="btn small"
                    onClick={() => branchHoursText && copyText(branchHoursText)}
                    disabled={!branchHoursText}
                  >
                    {language === "AR" ? "نسخ" : "Copy"}
                  </button>
                </div>
                {branchHoursText ? (
                  <div className="branch-hours-text">
                    {linkifyParts(preview(branchHoursText))}
                  </div>
                ) : (
                  <p className="muted-text">
                    {language === "AR"
                      ? "أضف سكربت Working hours داخل Branches & Hours ليظهر هنا."
                      : "Add a Working hours script under Branches & Hours to show it here."}
                  </p>
                )}
              </div>

              <div className="branch-stats-card card">
                <span>{language === "AR" ? "النتائج" : "Results"}</span>
                <b>{filteredBranches.length}</b>
                <p>
                  {language === "AR"
                    ? `من أصل ${branchDirectory.length} فرع في ${country}`
                    : `of ${branchDirectory.length} branches in ${country}`}
                </p>
                <a className="btn ghost small" href={branchJoinUrl} target="_blank" rel="noreferrer">
                  {language === "AR" ? "صفحة التسجيل" : "Join page"}
                </a>
              </div>
            </div>

            {filteredBranches.length ? (
              <div className="branch-directory-grid">
                {filteredBranches.map((branch) => (
                  <div className="branch-card card" key={branch.id}>
                    <div className="branch-card-main">
                      <span className="branch-city">{branch.city}</span>
                      <h3>{branch.name}</h3>
                      <span className={`branch-gender ${branch.gender.toLowerCase()}`}>
                        {branchGenderLabel(branch.gender, language)}
                      </span>
                    </div>
                    <div className="branch-card-actions">
                      <a className="btn small" href={branch.url} target="_blank" rel="noreferrer">
                        {language === "AR" ? "خرائط" : "Maps"}
                      </a>
                      <button
                        className="btn ghost small"
                        onClick={() => copyText(`${branch.name}\n${branch.url}`)}
                      >
                        {language === "AR" ? "نسخ" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-search-state">
                <b>{language === "AR" ? "لا توجد فروع مطابقة" : "No matching branches"}</b>
                <span>
                  {language === "AR"
                    ? "جرّب كلمة ثانية أو تأكد من وجود سكربت Location links داخل قسم Links."
                    : "Try another keyword or make sure Location links exists under Links."}
                </span>
              </div>
            )}
          </>
        )}

        {section === "chatbot" && <ChatbotPanel />}
        {section === "calculator" && <CalculatorPanel country={country} />}
        {section === "profile" && user && (
          <ProfilePanel user={user} setUser={setUser} />
        )}
        {section === "admin" && isAdminRole(user?.role) && (
          <AdminPanel
            scripts={scripts}
            setScripts={setScripts}
            currentUser={user}
            onScriptsChanged={loadScripts}
          />
        )}
      </main>
    </div>
  );
}
