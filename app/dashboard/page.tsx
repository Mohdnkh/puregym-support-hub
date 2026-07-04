"use client";

import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type TrainerItem = {
  id: string;
  title: string;
  content: string;
  country: "ALL" | "KSA" | "UAE";
  language: "BOTH" | "AR" | "EN";
  kind: string;
  sourceUrl?: string | null;
  active: boolean;
  updatedAt?: string;
};


type UserQuickScript = {
  id: string;
  title: string;
  country: "ALL" | "KSA" | "UAE";
  language: "AR" | "EN" | string;
  body: string;
  active: boolean;
  sortOrder?: number;
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
  | "calculator"
  | "profile"
  | "admin";
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  imageData?: string | null;
  imageName?: string | null;
};
type ChatSessionSummary = {
  id: string;
  title: string;
  country: Country;
  language: Lang;
  updatedAt: string;
  _count?: { messages: number };
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

// Variables an agent fills right before copying (TextBlaze-style):
// [Anything in square brackets] plus the common customer-name tokens.
function extractVarTokens(text: string) {
  const tokens = new Set<string>();
  for (const match of text.matchAll(/\[([^\[\]\n]{1,40})\]/g)) tokens.add(match[0]);
  if (text.includes("(اسم العميل)")) tokens.add("(اسم العميل)");
  if (text.includes("(Member Name)")) tokens.add("(Member Name)");
  return Array.from(tokens);
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [personalQuickScripts, setPersonalQuickScripts] = useState<UserQuickScript[]>([]);
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
  const [scriptSearch, setScriptSearch] = useState("");
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
    tokens: string[];
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

  async function loadPersonalQuickScripts() {
    const data = await fetch("/api/quick-scripts")
      .then((res) => res.json())
      .catch(() => ({ quickScripts: [] }));
    setPersonalQuickScripts(data.quickScripts || []);
  }

  // Quick scripts are shared (Script "Quick Scripts" category), so admin edits,
  // reordering and deletes apply to every agent.
  async function savePersonalQuickScript(item: Script) {
    const res = await fetch(`/api/scripts/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, language: item.language, body: item.body }),
    });
    if (!res.ok) return alert("Quick script save failed.");
    setEditingQuickId(null);
    await loadScripts();
  }

  async function addPersonalQuickScript() {
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

  async function deletePersonalQuickScript(id: string) {
    if (!confirm("Delete this quick script for everyone?")) return;
    const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Quick script delete failed.");
    await loadScripts();
  }

  function updatePersonalQuickScript(id: string, patch: Partial<Script>) {
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
      await Promise.all([loadScripts(), loadFavorites(), loadPersonalQuickScripts()]);
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
          `${script.title}\n${applyCountryHeart(applyGender(applyUserName(script.body, script.language === "EN" ? "EN" : "AR", user), "M"), country)}`,
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
      const body = applyUserName(script.body, script.language === "EN" ? "EN" : "AR", user);
      index.set(
        script.id,
        normalizeSearchText(
          [script.title, script.category, script.country, script.language, script.key, body].join(" "),
        ),
      );
    }
    return index;
  }, [visibleScripts, user]);

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

  const favoriteScripts = useMemo(
    () =>
      visibleScripts.filter(
        (script) =>
          favoriteIds.includes(script.id) &&
          script.category !== "Quick Scripts",
      ),
    [visibleScripts, favoriteIds],
  );

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
      setEditorText(applyUserName(selected.body, selected.language, user));
    } else {
      setSelectedId("");
      setEditorText("");
    }
  }, [selected, user]);

  const flash = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 1400);
  }, []);

  function selectScript(script: Script) {
    setSelectedId(script.id);
    setEditorText(applyUserName(script.body, script.language, user));
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

  const resolveScriptBody = useCallback((script: Script) => {
    return applyCountryHeart(
      applyGender(
        applyUserName(script.body, script.language === "EN" ? "EN" : "AR", user),
        quickGender[script.id] || "M",
      ),
      country,
    );
  }, [country, quickGender, user]);

  // One copy pipeline everywhere: applies name/gender/heart, tracks usage,
  // and opens the fill dialog when the script has [variables] to complete.
  const smartCopy = useCallback(async (script: Script) => {
    const body = resolveScriptBody(script);
    trackUsage(script.id);
    const tokens = extractVarTokens(body);
    if (tokens.length) {
      setVarFill({ title: script.title, text: body, tokens, values: {} });
      return;
    }
    await copyText(body);
  }, [copyText, resolveScriptBody, trackUsage]);

  const confirmVarFill = useCallback(async () => {
    if (!varFill) return;
    let out = varFill.text;
    for (const token of varFill.tokens) {
      const value = (varFill.values[token] || "").trim();
      if (value) out = out.split(token).join(value);
    }
    setVarFill(null);
    await copyText(out);
  }, [copyText, varFill]);

  // Ctrl+K opens the palette from anywhere; Alt+1..6 moves between sections.
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
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

      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const isAdmin = isAdminRole(user?.role);
        const shortcuts: Record<string, Section> = {
          "1": "quick",
          "2": "scripts",
          "3": "chatbot",
          "4": "calculator",
          "5": isAdmin ? "admin" : "profile",
          "6": "profile",
        };
        const next = shortcuts[event.key];
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
          <kbd>Alt+1</kbd>
        </button>
        <button
          className={`nav-button ${section === "scripts" ? "active" : ""}`}
          onClick={() => setSection("scripts")}
        >
          <span>Script Library</span>
          <kbd>Alt+2</kbd>
        </button>
        <button
          className={`nav-button ${section === "chatbot" ? "active" : ""}`}
          onClick={() => setSection("chatbot")}
        >
          <span>AI Chatbot</span>
          <kbd>Alt+3</kbd>
        </button>
        <button
          className={`nav-button ${section === "calculator" ? "active" : ""}`}
          onClick={() => setSection("calculator")}
        >
          <span>Calculation Tool</span>
          <kbd>Alt+4</kbd>
        </button>
        {isAdminRole(user?.role) && (
          <button
            className={`nav-button ${section === "admin" ? "active" : ""}`}
            onClick={() => setSection("admin")}
          >
            <span>Admin Editor</span>
            <kbd>Alt+5</kbd>
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
            Profile {isAdminRole(user?.role) ? "(Alt+6)" : "(Alt+5)"}
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
            <div className="toolbar">
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

        {message && <div className="toast">{message}</div>}

        {paletteOpen && (
          <div className="palette-overlay" onClick={() => setPaletteOpen(false)}>
            <div className="palette-box" onClick={(event) => event.stopPropagation()}>
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
              {varFill.tokens.map((token, idx) => (
                <div className="field" key={token}>
                  <label>{token.replace(/^[\[(]/, "").replace(/[\])]$/, "")}</label>
                  <input
                    autoFocus={idx === 0}
                    className="input"
                    dir="auto"
                    value={varFill.values[token] || ""}
                    onChange={(event) =>
                      setVarFill((cur) =>
                        cur ? { ...cur, values: { ...cur.values, [token]: event.target.value } } : cur,
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
                    const raw = varFill.text;
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
                    const favBody = applyCountryHeart(
                      applyGender(
                        applyUserName(script.body, script.language === "EN" ? "EN" : "AR", user),
                        g,
                      ),
                      country,
                    );
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
                  <button className="btn small" onClick={addPersonalQuickScript}>
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
                const body = applyCountryHeart(
                  applyGender(
                    applyUserName(script.body, script.language === "EN" ? "EN" : "AR", user),
                    gender,
                  ),
                  country,
                );
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
                            onChange={(event) => updatePersonalQuickScript(script.id, { title: event.target.value })}
                          />
                          <select
                            className="select"
                            value={script.language === "EN" ? "EN" : "AR"}
                            onChange={(event) => updatePersonalQuickScript(script.id, { language: event.target.value as Script["language"] })}
                          >
                            <option value="AR">AR</option>
                            <option value="EN">EN</option>
                          </select>
                        </div>
                        <textarea
                          className="textarea"
                          value={script.body}
                          onChange={(event) => updatePersonalQuickScript(script.id, { body: event.target.value })}
                        />
                        <div className="inline-actions quick-card-actions">
                          <button className="btn small" onClick={() => savePersonalQuickScript(script)}>Save</button>
                          <button className="btn ghost small" onClick={() => setEditingQuickId(null)}>Cancel</button>
                          <button className="btn ghost small danger-text" onClick={() => deletePersonalQuickScript(script.id)}>Delete</button>
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

            <div className="favorites-strip card">
              <div className="section-head compact">
                <div>
                  <h2>⭐ Favorite Scripts</h2>
                  <p>
                    Your personal favorites only. They do not affect other
                    users.
                  </p>
                </div>
              </div>
              {favoriteScripts.length ? (
                <div className="favorite-card-grid">
                  {favoriteScripts.map((script) => {
                    const body = applyUserName(
                      script.body,
                      script.language,
                      user,
                    );
                    return (
                      <button
                        key={script.id}
                        className="mini-script-card"
                        onClick={() => {
                          setCategory(script.category);
                          selectScript(script);
                        }}
                      >
                        <b>{script.title}</b>
                        <span>
                          {script.category} • {script.country}
                        </span>
                        <span>{preview(body)}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="muted-text">
                  Click the star on any script to keep it here.
                </p>
              )}
            </div>
            <div className="category-bar card">
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
                      const body = applyUserName(
                        script.body,
                        script.language,
                        user,
                      );
                      const isFavorite = favoriteIds.includes(script.id);
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
                              <button
                                className={`star-button ${isFavorite ? "active" : ""}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleFavorite(script.id);
                                }}
                                title="Favorite"
                              >
                                {isFavorite ? "★" : "☆"}
                              </button>
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
                          applyUserName(selected.body, selected.language, user),
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

        {section === "chatbot" && <Chatbot />}
        {section === "calculator" && <Calculator country={country} />}
        {section === "profile" && user && (
          <Profile user={user} setUser={setUser} />
        )}
        {section === "admin" && isAdminRole(user?.role) && (
          <Admin
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


function detectUiLanguage(value: string): Lang {
  return /[\u0600-\u06FF]/.test(value) ? "AR" : "EN";
}

function Chatbot() {
  const [uiLanguage, setUiLanguage] = useState<Lang>("AR");
  const welcome =
    uiLanguage === "AR"
      ? "أهلاً! اسألني أي شيء عن PureGym، السياسات، السكربتات، الروابط، أو ارفق صورة واطلب مني تحليلها."
      : "Hi! Ask me anything about PureGym policies, scripts, links, or attach an image and ask me to analyze it.";

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: welcome },
  ]);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{
    dataUrl: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const data = await fetch("/api/ai/history")
      .then((res) => res.json())
      .catch(() => ({ sessions: [] }));
    setSessions(data.sessions || []);
  }

  async function openSession(id: string) {
    setHistoryLoading(true);
    try {
      const data = await fetch(
        `/api/ai/history?sessionId=${encodeURIComponent(id)}`,
      ).then((res) => res.json());
      if (data.session) {
        setActiveSessionId(data.session.id);
        const loaded = (data.session.messages || []).map(
          (msg: ChatMessage) => ({
            role: msg.role,
            content: msg.content,
            imageData: msg.imageData,
            imageName: msg.imageName,
          }),
        );
        setMessages(
          loaded.length ? loaded : [{ role: "assistant", content: welcome }],
        );
        const lastUser = loaded
          .filter((msg: ChatMessage) => msg.role === "user")
          .slice(-1)[0];
        if (lastUser?.content)
          setUiLanguage(detectUiLanguage(lastUser.content));
      }
    } finally {
      setHistoryLoading(false);
    }
  }

  function newChat() {
    setActiveSessionId(null);
    setAttachedImage(null);
    setInput("");
    setMessages([{ role: "assistant", content: welcome }]);
  }

  async function deleteSession(id: string) {
    if (
      !confirm(uiLanguage === "AR" ? "حذف هذه المحادثة؟" : "Delete this chat?")
    )
      return;
    await fetch(`/api/ai/history?sessionId=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (activeSessionId === id) newChat();
    await loadSessions();
  }

  async function onFileSelected(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(
        uiLanguage === "AR"
          ? "يرجى اختيار صورة فقط."
          : "Please choose an image file only.",
      );
      return;
    }
    if (file.size > 3_200_000) {
      alert(
        uiLanguage === "AR"
          ? "الصورة كبيرة جدًا. اختر صورة أقل من 3MB."
          : "Image is too large. Please use an image under 3MB.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setAttachedImage({
        dataUrl: String(reader.result || ""),
        name: file.name,
      });
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function ask() {
    const trimmed = input.trim();
    if ((!trimmed && !attachedImage) || loading) return;

    const nextLang = trimmed ? detectUiLanguage(trimmed) : uiLanguage;
    setUiLanguage(nextLang);
    const userText =
      trimmed ||
      (nextLang === "AR"
        ? "حلّل الصورة المرفقة"
        : "Analyze the attached image");
    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: userText,
        imageData: attachedImage?.dataUrl || null,
        imageName: attachedImage?.name || null,
      },
    ];
    const imagePayload = attachedImage
      ? { dataUrl: attachedImage.dataUrl, name: attachedImage.name }
      : null;

    setMessages(nextMessages);
    setInput("");
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          sessionId: activeSessionId,
          image: imagePayload,
          messages,
        }),
      });
      const data = await res
        .json()
        .catch(() => ({ error: "AI route returned a non-JSON response." }));
      if (data.sessionId) setActiveSessionId(data.sessionId);
      if (data.inferred?.language) setUiLanguage(data.inferred.language);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: res.ok ? data.answer : data.error || "AI failed",
        },
      ]);
      await loadSessions();
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "AI failed",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask();
    }
  }

  return (
    <div className="ai-chat-layout">
      <aside className="chat-history-panel card">
        <div className="section-head compact">
          <div>
            <h2>{uiLanguage === "AR" ? "المحادثات" : "Chat history"}</h2>
            <p>
              {uiLanguage === "AR"
                ? "محادثاتك الخاصة فقط. الذاكرة العامة لا تكشف بيانات المستخدمين."
                : "Your private chats only. Global memory never exposes user data."}
            </p>
          </div>
          <button className="btn small" onClick={newChat}>
            {uiLanguage === "AR" ? "جديد" : "New"}
          </button>
        </div>
        <div className="chat-session-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`chat-session-card ${activeSessionId === session.id ? "active" : ""}`}
            >
              <button
                onClick={() => openSession(session.id)}
                disabled={historyLoading}
              >
                <b>{session.title || "New chat"}</b>
                <span>
                  {session.country} • {session.language} •{" "}
                  {session._count?.messages || 0} messages
                </span>
              </button>
              <button
                className="chat-delete-button"
                onClick={() => deleteSession(session.id)}
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
          {!sessions.length && (
            <p className="muted-text">
              {uiLanguage === "AR"
                ? "لا توجد محادثات محفوظة بعد."
                : "No saved chats yet."}
            </p>
          )}
        </div>
      </aside>

      <div className="chatgpt-shell card">
        <div className="section-head">
          <div>
            <h2>AI Support Chatbot</h2>
            <p>
              {uiLanguage === "AR"
                ? "عام • يكتشف اللغة والدولة من السؤال • يدعم النص والصور"
                : "General • detects language and country from the question • text and image support"}
            </p>
          </div>
          <div className="toolbar">
            <button className="btn ghost small" onClick={newChat}>
              {uiLanguage === "AR" ? "محادثة جديدة" : "New chat"}
            </button>
          </div>
        </div>
        <div
          className="messages-panel"
          dir={uiLanguage === "AR" ? "rtl" : "ltr"}
        >
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                {msg.imageData && (
                  <img
                    className="chat-image"
                    src={msg.imageData}
                    alt={msg.imageName || "Attachment"}
                  />
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble typing">
                {uiLanguage === "AR" ? "جاري التفكير..." : "Thinking..."}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {attachedImage && (
          <div className="attachment-preview">
            <img src={attachedImage.dataUrl} alt={attachedImage.name} />
            <div>
              <b>{attachedImage.name}</b>
              <span>
                {uiLanguage === "AR"
                  ? "جاهزة للإرسال مع الرسالة"
                  : "Ready to send with your message"}
              </span>
            </div>
            <button
              className="btn ghost small"
              onClick={() => setAttachedImage(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="chat-input-bar enhanced">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) =>
              onFileSelected(event.target.files?.[0] || null)
            }
          />
          <button
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            title={uiLanguage === "AR" ? "إرفاق صورة" : "Attach image"}
          >
            📎
          </button>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              uiLanguage === "AR"
                ? "اكتب سؤالك عن PureGym أو ارفق صورة..."
                : "Ask about PureGym or attach an image..."
            }
            rows={2}
            dir={uiLanguage === "AR" ? "rtl" : "ltr"}
          />
          <button
            className="send-button"
            onClick={ask}
            disabled={loading || (!input.trim() && !attachedImage)}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

function Calculator({ country }: { country: Country }) {
  const [tool, setTool] = useState("monthly-to-pif");
  const [values, setValues] = useState<Record<string, string>>({});
  function set(name: string, value: string) {
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }
  function num(name: string) {
    return Number(values[name] || 0);
  }

  const current = num("current");
  const next = num("next");
  const membershipPrice = num("membershipPrice");
  const currentDate = values.currentDate || "";
  const newDate = values.newDate || "";
  const nextDate = values.nextDate || "";
  const months = num("months") || 1;
  const days = daysBetween(
    values.transferDate || currentDate,
    nextDate || newDate,
  );
  const priceDiff = ((next - current) / 31) * Math.max(days, 0);
  const nextPayment = next + priceDiff;
  const pifDays = next > current ? (next - current) / (next / months / 31) : 0;
  const deductionDiff = daysBetween(currentDate, newDate);
  const changedPayment =
    membershipPrice + (membershipPrice / 31) * deductionDiff;

  return (
    <div className="card">
      <div className="section-head">
        <div>
          <h2>Calculation Tool</h2>
          <p>Billing tools + Hijri date converter.</p>
        </div>
      </div>
      <div className="tool-tabs">
        <button
          className={`toggle ${tool === "monthly-to-pif" ? "active" : ""}`}
          onClick={() => setTool("monthly-to-pif")}
        >
          Monthly to PIF
        </button>
        <button
          className={`toggle ${tool === "home-monthly" ? "active" : ""}`}
          onClick={() => setTool("home-monthly")}
        >
          Home Gym Monthly
        </button>
        <button
          className={`toggle ${tool === "home-pif" ? "active" : ""}`}
          onClick={() => setTool("home-pif")}
        >
          Home Gym PIF
        </button>
        <button
          className={`toggle ${tool === "upgrade" ? "active" : ""}`}
          onClick={() => setTool("upgrade")}
        >
          Upgrade
        </button>
        <button
          className={`toggle ${tool === "deduction" ? "active" : ""}`}
          onClick={() => setTool("deduction")}
        >
          Deduction Date
        </button>
        <button
          className={`toggle ${tool === "discount" ? "active" : ""}`}
          onClick={() => setTool("discount")}
        >
          Discount
        </button>
        <button
          className={`toggle ${tool === "hijri" ? "active" : ""}`}
          onClick={() => setTool("hijri")}
        >
          Hijri Months
        </button>
        <button
          className={`toggle ${tool === "policies" ? "active" : ""}`}
          onClick={() => setTool("policies")}
        >
          📋 Policies KSA/UAE
        </button>
      </div>
      {tool === "monthly-to-pif" && (
        <MonthlyToPif values={values} set={set} country={country} />
      )}
      {(tool === "home-monthly" || tool === "upgrade") && (
        <MonthlyTransfer
          values={values}
          set={set}
          country={country}
          label={tool === "upgrade" ? "Upgrade" : "Home Gym Transfer Monthly"}
          priceDiff={priceDiff}
          nextPayment={nextPayment}
          days={days}
        />
      )}
      {tool === "home-pif" && (
        <PifTransfer
          values={values}
          set={set}
          country={country}
          pifDays={pifDays}
        />
      )}
      {tool === "deduction" && (
        <DeductionDate
          values={values}
          set={set}
          country={country}
          days={deductionDiff}
          result={changedPayment}
        />
      )}
      {tool === "discount" && (
        <Discount values={values} set={set} country={country} />
      )}
      {tool === "hijri" && <HijriMonths />}
      {tool === "policies" && <PolicyCompare />}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="input"
        type="number"
        step="0.01"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="input"
        type="date"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
function MonthlyToPif({
  values,
  set,
  country,
}: {
  values: Record<string, string>;
  set: (name: string, value: string) => void;
  country: Country;
}) {
  const monthlyPrice = Number(values.monthlyPrice || 0);
  const start = values.startDate || "";
  const end = values.endDate || "";
  const totalPif = Number(values.totalPif || 0);
  const perDay = monthlyPrice / 31;
  const usedDays = Math.max(daysBetween(start, end) + 1, 0);
  const usedAmount = perDay * usedDays;
  const remaining = totalPif - usedAmount;
  return (
    <div className="calculator-grid">
      <div>
        <NumberField
          label="Monthly price"
          value={values.monthlyPrice}
          onChange={(value) => set("monthlyPrice", value)}
        />
        <NumberField
          label="PIF total price"
          value={values.totalPif}
          onChange={(value) => set("totalPif", value)}
        />
        <DateField
          label="Date of transfer"
          value={start}
          onChange={(value) => set("startDate", value)}
        />
        <DateField
          label="One day before next deduction date"
          value={end}
          onChange={(value) => set("endDate", value)}
        />
      </div>
      <ResultBox
        items={[
          ["Price per day", money(perDay, country)],
          ["Days used", String(usedDays)],
          ["Used amount", money(usedAmount, country)],
          ["Remaining PIF amount", money(remaining, country)],
        ]}
      />
    </div>
  );
}
function MonthlyTransfer({
  values,
  set,
  country,
  label,
  priceDiff,
  nextPayment,
  days,
}: {
  values: Record<string, string>;
  set: (name: string, value: string) => void;
  country: Country;
  label: string;
  priceDiff: number;
  nextPayment: number;
  days: number;
}) {
  return (
    <div className="calculator-grid">
      <div>
        <h3>{label}</h3>
        <NumberField
          label="Current price"
          value={values.current}
          onChange={(value) => set("current", value)}
        />
        <NumberField
          label="New price"
          value={values.next}
          onChange={(value) => set("next", value)}
        />
        <DateField
          label="Date of transfer"
          value={values.transferDate}
          onChange={(value) => set("transferDate", value)}
        />
        <DateField
          label="One day before next deduction date"
          value={values.nextDate}
          onChange={(value) => set("nextDate", value)}
        />
      </div>
      <ResultBox
        items={[
          ["Days", String(Math.max(days, 0))],
          ["Price difference", money(priceDiff, country)],
          ["Next payment amount", money(nextPayment, country)],
        ]}
      />
    </div>
  );
}
function PifTransfer({
  values,
  set,
  country,
  pifDays,
}: {
  values: Record<string, string>;
  set: (name: string, value: string) => void;
  country: Country;
  pifDays: number;
}) {
  return (
    <div className="calculator-grid">
      <div>
        <NumberField
          label="Current price"
          value={values.current}
          onChange={(value) => set("current", value)}
        />
        <NumberField
          label="New price"
          value={values.next}
          onChange={(value) => set("next", value)}
        />
        <NumberField
          label="Number of months"
          value={values.months}
          onChange={(value) => set("months", value)}
        />
      </div>
      <ResultBox
        items={[
          [
            "Price difference",
            money(
              Number(values.next || 0) - Number(values.current || 0),
              country,
            ),
          ],
          ["Days to be deducted", Math.max(pifDays, 0).toFixed(1)],
        ]}
        note="If member transfers from higher price gym to lower price gym, no days are added."
      />
    </div>
  );
}
function DeductionDate({
  values,
  set,
  country,
  days,
  result,
}: {
  values: Record<string, string>;
  set: (name: string, value: string) => void;
  country: Country;
  days: number;
  result: number;
}) {
  return (
    <div className="calculator-grid">
      <div>
        <DateField
          label="Current deduction date"
          value={values.currentDate}
          onChange={(value) => set("currentDate", value)}
        />
        <DateField
          label="New deduction date"
          value={values.newDate}
          onChange={(value) => set("newDate", value)}
        />
        <NumberField
          label="Membership price"
          value={values.membershipPrice}
          onChange={(value) => set("membershipPrice", value)}
        />
      </div>
      <ResultBox
        items={[
          ["Days difference", String(days)],
          ["Next payment amount", money(result, country)],
        ]}
      />
    </div>
  );
}
function Discount({
  values,
  set,
  country,
}: {
  values: Record<string, string>;
  set: (name: string, value: string) => void;
  country: Country;
}) {
  const price = Math.max(0, Number(values.current || 0));
  const percent = Math.min(100, Math.max(0, Number(values.discountPercent || 0)));
  const discountAmount = price * (percent / 100);
  const finalPrice = price - discountAmount;

  return (
    <div className="calculator-grid">
      <div className="calc-input-stack">
        <NumberField
          label="Original price"
          value={values.current}
          onChange={(value) => set("current", value)}
        />
        <NumberField
          label="Discount percentage"
          value={values.discountPercent}
          onChange={(value) => set("discountPercent", value)}
        />
      </div>
      <ResultBox
        items={[
          ["Discount percentage", `${percent.toFixed(2)}%`],
          ["Discount amount", money(discountAmount, country)],
          ["Final price", money(finalPrice, country)],
        ]}
        note="Only monthly members who did not join on discounted price are eligible."
      />
    </div>
  );
}
function ResultBox({
  items,
  note,
}: {
  items: [string, string][];
  note?: string;
}) {
  return (
    <div className="calc-result">
      <h3>Result</h3>
      {items.map(([label, value]) => (
        <p key={label}>
          {label}: <b>{value}</b>
        </p>
      ))}
      {note && <p>{note}</p>}
    </div>
  );
}
// Side-by-side KSA vs UAE policy summary (from the official T&C notes in the
// repo) so agents answer policy questions at a glance without asking the AI.
function PolicyCompare() {
  const rows: Array<[string, string, string]> = [
    [
      "Monthly cancellation",
      "Contact Member Services at least 2 days before the next deduction date. Membership stays active until the day before the next payment date.",
      "Contact Member Services at least 2 days before the next deduction date. Membership stays active until the day before the next payment date.",
    ],
    [
      "Fixed-term / PIF",
      "Cannot be cancelled or refunded — can only be frozen according to freeze rules.",
      "Not refundable and cannot be cancelled.",
    ],
    [
      "Failed monthly payment",
      "Membership temporarily suspended → retry after 10 days → if the 2nd attempt fails, membership is cancelled automatically.",
      "Membership temporarily suspended → retry after 10 days → if the 2nd attempt fails, membership is cancelled automatically.",
    ],
    [
      "Freeze",
      "Allowed per freeze rules (fixed-term memberships can be frozen instead of cancelled).",
      "39 AED fee. Non-PLUS: max 3 months, then auto-unfreezes back to the monthly rate. Must be actioned ≥ 2 working days before the payment date; starts from the payment date.",
    ],
    [
      "Payment links",
      "Hyper Bill links for one-off services, upgrades/freezes, failed payments and ad-hoc requests (email from hyperbill@hyperpay.com).",
      "Member Services shares the official payment link when needed.",
    ],
  ];

  return (
    <div className="policy-compare">
      <div className="policy-grid policy-head">
        <div className="policy-topic">Topic</div>
        <div className="policy-col ksa">💚 KSA</div>
        <div className="policy-col uae">💙 UAE</div>
      </div>
      {rows.map(([topic, ksa, uae]) => (
        <div className="policy-grid card" key={topic}>
          <div className="policy-topic">{topic}</div>
          <div className="policy-cell">{ksa}</div>
          <div className="policy-cell">{uae}</div>
        </div>
      ))}
      <p className="small-note">
        Summary of the official Terms &amp; Conditions — for exact wording always rely on the
        official pages / internal system.
      </p>
    </div>
  );
}

function HijriMonths() {
  const [today, setToday] = useState(new Date());
  const todayUtc = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12),
  );
  const todayHijri = gregorianToHijri(todayUtc);
  const [day, setDay] = useState(String(todayHijri.day || 1));
  const [month, setMonth] = useState(String(todayHijri.month || 1));
  const [year, setYear] = useState(String(todayHijri.year || 1447));

  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const converted = useMemo(() => {
    return hijriToGregorian(Number(day), Number(month), Number(year));
  }, [day, month, year]);

  // Gregorian -> Hijri direction.
  const [gregInput, setGregInput] = useState(() => todayUtc.toISOString().slice(0, 10));
  const gregToHijri = useMemo(() => {
    const d = new Date(gregInput + "T12:00:00Z");
    if (isNaN(d.getTime())) return null;
    return gregorianToHijri(d);
  }, [gregInput]);

  return (
    <div className="hijri-card">
      <div className="section-head compact">
        <div>
          <h3>Hijri Date Helper</h3>
          <p>
            Convert a Hijri date to Gregorian, and check today’s date in both
            calendars.
          </p>
        </div>
      </div>

      <div className="today-date-grid">
        <div className="date-card">
          <span>Today Gregorian</span>
          <b>{formatDate(today)}</b>
        </div>
        <div className="date-card">
          <span>Today Hijri</span>
          <b>
            {todayHijri.day} {hijriMonthName(todayHijri.month)}{" "}
            {todayHijri.year}
          </b>
        </div>
      </div>

      <div className="hijri-converter-grid">
        <div className="field">
          <label>Hijri day</label>
          <input
            className="input"
            inputMode="numeric"
            value={day}
            onChange={(e) =>
              setDay(e.target.value.replace(/\D/g, "").slice(0, 2))
            }
          />
        </div>
        <div className="field">
          <label>Hijri month</label>
          <select
            className="select"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {HIJRI_MONTHS.map(([num, ar, en]) => (
              <option key={num} value={num}>
                {num} - {ar} / {en}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Hijri year</label>
          <input
            className="input"
            inputMode="numeric"
            value={year}
            onChange={(e) =>
              setYear(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
          />
        </div>
      </div>

      <div className="calc-result">
        <h3>Gregorian result</h3>
        {converted ? (
          <p>
            <b>{formatDate(converted)}</b>
          </p>
        ) : (
          <p>Enter a valid Hijri date.</p>
        )}
        <p className="small-note">
          The result uses the Umm Al-Qura / Islamic calendar available in the
          browser and may differ by one day depending on the official calendar.
        </p>
      </div>

      <div className="section-head compact" style={{ marginTop: 18 }}>
        <div>
          <h3>Gregorian → Hijri</h3>
          <p>Pick a Gregorian date to get its Hijri date.</p>
        </div>
      </div>
      <div className="hijri-converter-grid">
        <div className="field">
          <label>Gregorian date</label>
          <input
            type="date"
            className="input"
            value={gregInput}
            onChange={(e) => setGregInput(e.target.value)}
          />
        </div>
      </div>
      <div className="calc-result">
        <h3>Hijri result</h3>
        {gregToHijri ? (
          <p>
            <b>
              {gregToHijri.day} {hijriMonthName(gregToHijri.month)} {gregToHijri.year} هـ
            </b>
          </p>
        ) : (
          <p>Pick a valid date.</p>
        )}
      </div>

      <div className="hijri-grid">
        {HIJRI_MONTHS.map(([num, ar, en]) => (
          <div className="hijri-item" key={num}>
            <b>{num}</b>
            <span>{ar}</span>
            <small>{en}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({
  user,
  setUser,
}: {
  user: User;
  setUser: (user: User) => void;
}) {
  const [form, setForm] = useState({
    nameAr: user.nameAr,
    nameEn: user.nameEn,
    profileImage: user.profileImage || "",
    currentPassword: "",
    newPassword: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onImageChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image file.");
      return;
    }
    if (file.size > 900_000) {
      setStatus("Image is too large. Please use an image under 900 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setForm((current) => ({
        ...current,
        profileImage: String(reader.result || ""),
      }));
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    setStatus("");
    setLoading(true);

    const payload: Record<string, string | null> = {
      nameAr: form.nameAr,
      nameEn: form.nameEn,
      profileImage: form.profileImage || null,
    };

    if (form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setStatus(data.error || "Profile update failed");
      return;
    }

    setUser({
      id: data.user.id,
      email: data.user.email,
      nameAr: data.user.nameAr,
      nameEn: data.user.nameEn,
      profileImage: data.user.profileImage,
      role: data.user.role,
      emailVerified: Boolean(data.user.emailVerifiedAt),
    });

    setForm((current) => ({
      ...current,
      currentPassword: "",
      newPassword: "",
    }));
    setStatus("Profile updated successfully.");
  }

  return (
    <div className="profile-layout">
      <div className="card profile-card">
        <div className="profile-avatar-large">
          {form.profileImage ? (
            <img src={form.profileImage} alt="Profile" />
          ) : (
            <span>{form.nameEn.slice(0, 1) || "P"}</span>
          )}
        </div>
        <h2>{form.nameEn}</h2>
        <p>{user.email}</p>
        <span className="role-badge">{user.role}</span>
      </div>

      <div className="card profile-form-card">
        <div className="section-head">
          <div>
            <h2>Profile Settings</h2>
            <p>
              Update your display names, optional profile image, and password.
            </p>
          </div>
          <button className="btn" onClick={saveProfile} disabled={loading}>
            {loading ? "Saving..." : "Save profile"}
          </button>
        </div>

        {status && (
          <p className={status.includes("success") ? "success" : "error"}>
            {status}
          </p>
        )}

        <div className="profile-form-grid">
          <div className="field">
            <label>Arabic name</label>
            <input
              className="input"
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
            />
          </div>
          <div className="field">
            <label>English name</label>
            <input
              className="input"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label>Profile image optional</label>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] || null)}
          />
        </div>

        {form.profileImage && (
          <button
            className="btn ghost small"
            type="button"
            onClick={() => setForm({ ...form, profileImage: "" })}
          >
            Remove image
          </button>
        )}

        <div className="password-panel">
          <h3>Reset password</h3>
          <p>
            Leave these fields empty if you do not want to change your password.
          </p>
          <div className="profile-form-grid">
            <div className="field">
              <label>Current password</label>
              <input
                className="input"
                type="password"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input
                className="input"
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Admin({
  scripts,
  setScripts,
  currentUser,
  onScriptsChanged,
}: {
  scripts: Script[];
  setScripts: (scripts: Script[]) => void;
  currentUser: User;
  onScriptsChanged: () => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("");
  const [adminCategory, setAdminCategory] = useState(
    "Cancellation & Retention",
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trainerItems, setTrainerItems] = useState<TrainerItem[]>([]);
  const [trainerForm, setTrainerForm] = useState({
    id: "",
    title: "",
    content: "",
    country: "ALL" as TrainerItem["country"],
    language: "BOTH" as TrainerItem["language"],
    kind: "Internal Note",
    sourceUrl: "",
    active: true,
  });
  const [newScript, setNewScript] = useState({
    title: "",
    category: "Cancellation & Retention",
    country: "KSA" as Script["country"],
    language: "AR" as Script["language"],
    body: "",
  });
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [renameCategoryText, setRenameCategoryText] = useState(
    "Cancellation & Retention",
  );
  const [adminTab, setAdminTab] = useState<
    "add" | "categories" | "order" | "edit" | "users" | "ai"
  >("add");

  const adminCategories = useMemo(
    () =>
      Array.from(new Set(scripts.map((script) => script.category))).sort(
        (a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b),
      ),
    [scripts],
  );
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set([...CATEGORY_ORDER, ...adminCategories, ...customCategories]),
      )
        .filter(Boolean)
        .sort(
          (a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b),
        ),
    [adminCategories, customCategories],
  );
  const adminScripts = useMemo(
    () =>
      scripts
        .filter((script) => script.category === adminCategory)
        .sort(
          (a, b) =>
            (a.sortOrder || 0) - (b.sortOrder || 0) ||
            a.title.localeCompare(b.title),
        ),
    [scripts, adminCategory],
  );
  const selected = useMemo(
    () =>
      scripts.find((script) => script.id === selectedId) ||
      adminScripts[0] ||
      null,
    [scripts, adminScripts, selectedId],
  );

  useEffect(() => {
    if (!categoryOptions.includes(adminCategory) && categoryOptions[0])
      setAdminCategory(categoryOptions[0]);
  }, [categoryOptions, adminCategory]);
  useEffect(() => {
    setRenameCategoryText(adminCategory);
  }, [adminCategory]);
  useEffect(() => {
    if (selected && !selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);
  useEffect(() => {
    loadUsers();
    loadTrainerItems();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => ({ users: [] }));
    if (res.ok) setUsers(data.users || []);
  }

  async function loadTrainerItems() {
    const res = await fetch("/api/ai/trainer");
    const data = await res.json().catch(() => ({ items: [] }));
    if (res.ok) setTrainerItems(data.items || []);
  }

  function updateSelected(patch: Partial<Script>) {
    if (selected)
      setScripts(
        scripts.map((script) =>
          script.id === selected.id ? { ...script, ...patch } : script,
        ),
      );
  }

  function addCategory() {
    const name = categoryDraft.trim();
    if (!name) return setStatus("Write a category name first.");
    if (categoryOptions.includes(name)) {
      setAdminCategory(name);
      setNewScript((current) => ({ ...current, category: name }));
      setCategoryDraft("");
      return setStatus("Category already exists. Selected it for you.");
    }

    setCustomCategories((current) => [...current, name]);
    setAdminCategory(name);
    setNewScript((current) => ({ ...current, category: name }));
    setRenameCategoryText(name);
    setCategoryDraft("");
    setStatus(
      "Category added. Add a script inside it to publish it for users.",
    );
  }

  async function renameCategory() {
    const oldName = adminCategory;
    const newName = renameCategoryText.trim();

    if (!oldName) return setStatus("Select a category first.");
    if (!newName) return setStatus("Write the new category name.");
    if (oldName === newName)
      return setStatus("Category name is already the same.");
    if (
      categoryOptions.includes(newName) &&
      !confirm(
        "A category with this name already exists. Move scripts into it?",
      )
    )
      return;

    const res = await fetch("/api/scripts/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Category rename failed");

    setScripts(
      scripts.map((script) =>
        script.category === oldName ? { ...script, category: newName } : script,
      ),
    );
    setCustomCategories((current) =>
      Array.from(
        new Set([...current.filter((cat) => cat !== oldName), newName]),
      ),
    );
    setAdminCategory(newName);
    setNewScript((current) => ({
      ...current,
      category: current.category === oldName ? newName : current.category,
    }));
    setStatus(
      `Category renamed for everyone. Updated ${data.count || 0} scripts.`,
    );
    await onScriptsChanged();
  }

  async function deleteCategory() {
    const name = adminCategory;
    if (!name) return setStatus("Select a category first.");

    const count = scripts.filter((script) => script.category === name).length;
    if (
      !confirm(
        `Delete the category "${name}" and its ${count} script(s) permanently for everyone? This cannot be undone.`,
      )
    )
      return;

    const res = await fetch("/api/scripts/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Category delete failed");

    setScripts(scripts.filter((script) => script.category !== name));
    setCustomCategories((current) => current.filter((cat) => cat !== name));
    setStatus(`Category deleted. Removed ${data.count || 0} scripts.`);
    await onScriptsChanged();
  }

  async function saveSelected() {
    if (!selected) return;
    const res = await fetch(`/api/scripts/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selected.title,
        category: selected.category,
        country: selected.country,
        language: selected.language,
        body: selected.body,
        active: selected.active,
        sortOrder: selected.sortOrder || 0,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Save failed");
    setStatus("Saved for everyone.");
    await onScriptsChanged();
  }

  async function createScript() {
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newScript),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Create failed");
    setStatus("Script added.");
    setNewScript({
      title: "",
      category: newScript.category,
      country: newScript.country,
      language: newScript.language,
      body: "",
    });
    await onScriptsChanged();
    setSelectedId(data.script.id);
  }

  async function deleteScript(id: string) {
    if (!confirm("Delete this script for all users?")) return;
    const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    if (!res.ok) return setStatus("Delete failed");
    setStatus("Script deleted.");
    await onScriptsChanged();
    setSelectedId("");
  }

  // Activate / deactivate a single script for everyone.
  async function toggleScriptActive() {
    if (!selected) return;
    const nextActive = !selected.active;
    const res = await fetch(`/api/scripts/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: nextActive }),
    });
    if (!res.ok) return setStatus("Update failed");
    setStatus(nextActive ? "Script activated for everyone." : "Script deactivated (hidden for everyone).");
    await onScriptsChanged();
  }

  // Activate / deactivate a whole category for everyone.
  async function setCategoryActive(active: boolean) {
    const name = adminCategory;
    if (!name) return setStatus("Select a category first.");
    const count = scripts.filter((script) => script.category === name).length;
    if (
      !confirm(
        `${active ? "Activate" : "Deactivate"} the category "${name}" and its ${count} script(s) for everyone?`,
      )
    )
      return;

    const res = await fetch("/api/scripts/categories/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, active }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Category update failed");
    setStatus(`Category ${active ? "activated" : "deactivated"}. Updated ${data.count || 0} scripts.`);
    await onScriptsChanged();
  }

  function reorderLocal(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const list = adminScripts.map((script) => script.id);
    const from = list.indexOf(draggedId);
    const to = list.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const moved = [...adminScripts];
    const [item] = moved.splice(from, 1);
    moved.splice(to, 0, item);
    const movedIds = moved.map((script) => script.id);
    const remapped = scripts.map((script) => {
      const index = movedIds.indexOf(script.id);
      return index >= 0 ? { ...script, sortOrder: (index + 1) * 10 } : script;
    });
    setScripts(remapped);
  }

  async function saveOrder() {
    const ids = adminScripts.map((script) => script.id);
    const res = await fetch("/api/scripts/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) return setStatus("Saving order failed");
    setStatus("Order saved for everyone.");
    await onScriptsChanged();
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "User delete failed");
    setStatus("User deleted.");
    await loadUsers();
  }

  // Approve a pending request and/or generate a password to share with the user.
  async function generateUserPassword(id: string, isPending: boolean) {
    if (!confirm(isPending ? "Approve this account and generate a password?" : "Generate a new password for this user?")) return;
    const res = await fetch(`/api/admin/users/${id}/password`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Failed to generate password");
    await loadUsers();
    window.prompt(
      `Login details for ${data.email} — copy and send to the user:`,
      `Email: ${data.email}\nPassword: ${data.password}`,
    );
    setStatus(`Password generated for ${data.email}.`);
  }

  async function changeUserRole(id: string, role: "USER" | "ADMIN" | "SUPER_ADMIN") {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Role update failed");
    setStatus(
      role === "SUPER_ADMIN"
        ? "User promoted to super admin."
        : role === "ADMIN"
          ? "User promoted to admin."
          : "Admin changed to user.",
    );
    await loadUsers();
  }

  function editTrainerItem(item: TrainerItem) {
    setTrainerForm({
      id: item.id,
      title: item.title,
      content: item.content,
      country: item.country,
      language: item.language,
      kind: item.kind,
      sourceUrl: item.sourceUrl || "",
      active: item.active,
    });
  }

  function resetTrainerForm() {
    setTrainerForm({
      id: "",
      title: "",
      content: "",
      country: "ALL",
      language: "BOTH",
      kind: "Internal Note",
      sourceUrl: "",
      active: true,
    });
  }

  async function saveTrainerItem() {
    const method = trainerForm.id ? "PUT" : "POST";
    const res = await fetch("/api/ai/trainer", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trainerForm),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "AI trainer save failed");
    setStatus("AI trainer knowledge saved.");
    resetTrainerForm();
    await loadTrainerItems();
  }

  async function deleteTrainerItem(id: string) {
    if (!confirm("Delete this AI knowledge item?")) return;
    const res = await fetch(`/api/ai/trainer?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "AI trainer delete failed");
    setStatus("AI trainer knowledge deleted.");
    if (trainerForm.id === id) resetTrainerForm();
    await loadTrainerItems();
  }

  const adminTabItems = [
    { id: "add" as const, label: "Add Script", hint: "Create" },
    { id: "edit" as const, label: "Edit Script", hint: "Update" },
    { id: "order" as const, label: "Script Order", hint: "Drag" },
    { id: "categories" as const, label: "Categories", hint: "Add / Rename" },
    // Admins see requests + can generate passwords; role changes stay Super Admin only.
    { id: "users" as const, label: "Users", hint: "Requests" },
    { id: "ai" as const, label: "AI Trainer", hint: "Knowledge" },
  ];

  return (
    <div className="admin-workspace">
      <div className="card admin-tabs-card">
        <div className="section-head compact">
          <div>
            <h2>Admin Editor</h2>
            <p>
              Choose one management area. Changes apply globally, while
              favorites remain personal for each user.
            </p>
          </div>
        </div>
        <div
          className="admin-tab-buttons"
          role="tablist"
          aria-label="Admin tools"
        >
          {adminTabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab-button ${adminTab === tab.id ? "active" : ""}`}
              onClick={() => setAdminTab(tab.id)}
            >
              <b>{tab.label}</b>
              <span>{tab.hint}</span>
            </button>
          ))}
        </div>
        {status && (
          <p
            className={
              status.toLowerCase().includes("failed") ||
              status.toLowerCase().includes("error")
                ? "error"
                : "success"
            }
          >
            {status}
          </p>
        )}
      </div>

      {adminTab === "add" && (
        <div className="card admin-editor add-script-card admin-wide-card">
          <div className="section-head">
            <div>
              <h2>Add script</h2>
              <p>Create a new script and publish it for all users.</p>
            </div>
            <button className="btn" onClick={createScript}>
              Add script for everyone
            </button>
          </div>

          <div className="add-script-form admin-add-grid">
            <div className="field add-title">
              <label>Title</label>
              <input
                className="input"
                value={newScript.title}
                placeholder="Example: Payment Link Approval"
                onChange={(e) =>
                  setNewScript({ ...newScript, title: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label>Category</label>
              <select
                className="select"
                value={newScript.category}
                onChange={(e) =>
                  setNewScript({ ...newScript, category: e.target.value })
                }
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Country</label>
              <select
                className="select"
                value={newScript.country}
                onChange={(e) =>
                  setNewScript({
                    ...newScript,
                    country: e.target.value as Script["country"],
                  })
                }
              >
                <option value="KSA">KSA</option>
                <option value="UAE">UAE</option>
                <option value="ALL">ALL</option>
              </select>
            </div>

            <div className="field">
              <label>Language</label>
              <select
                className="select"
                value={newScript.language}
                onChange={(e) =>
                  setNewScript({
                    ...newScript,
                    language: e.target.value as Script["language"],
                  })
                }
              >
                <option value="AR">AR</option>
                <option value="EN">EN</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Body</label>
            <textarea
              className="textarea admin-body add-script-body"
              value={newScript.body}
              placeholder="Write the script here..."
              onChange={(e) =>
                setNewScript({ ...newScript, body: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {adminTab === "categories" && (
        <div className="card admin-panel category-manager-card admin-wide-card">
          <div className="section-head compact">
            <div>
              <h2>Category manager</h2>
              <p>
                Add categories and rename existing categories. Renaming moves
                all scripts in that category for every user. Favorites stay
                personal and are not affected.
              </p>
            </div>
          </div>

          <div className="category-manager-grid">
            <div className="category-tool-box">
              <h3>Add category</h3>
              <p>Create a category option, then add scripts inside it.</p>
              <div className="inline-action-row">
                <input
                  className="input"
                  value={categoryDraft}
                  placeholder="Example: Refunds"
                  onChange={(e) => setCategoryDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCategory();
                  }}
                />
                <button
                  className="btn small"
                  type="button"
                  onClick={addCategory}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="category-tool-box">
              <h3>Rename category</h3>
              <p>
                Choose a category, write the new name, then apply it globally.
              </p>
              <div className="inline-action-row rename-row">
                <select
                  className="select"
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  value={renameCategoryText}
                  onChange={(e) => setRenameCategoryText(e.target.value)}
                />
                <button
                  className="btn small"
                  type="button"
                  onClick={renameCategory}
                >
                  Rename
                </button>
              </div>
            </div>

            <div className="category-tool-box">
              <h3>Delete category</h3>
              <p>
                Permanently removes the selected category and all of its
                scripts for everyone.
              </p>
              <div className="inline-action-row rename-row">
                <select
                  className="select"
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  className="btn small danger"
                  type="button"
                  onClick={deleteCategory}
                >
                  Delete category
                </button>
              </div>
            </div>

            <div className="category-tool-box">
              <h3>Activate / Deactivate category</h3>
              <p>
                Hide or show the selected category and all its scripts for
                everyone — without deleting anything.
              </p>
              <div className="inline-action-row rename-row">
                <select
                  className="select"
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  className="btn ghost small"
                  type="button"
                  onClick={() => setCategoryActive(false)}
                >
                  🚫 Deactivate
                </button>
                <button
                  className="btn small"
                  type="button"
                  onClick={() => setCategoryActive(true)}
                >
                  ✅ Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminTab === "order" && (
        <div className="card admin-panel admin-order-tab">
          <div className="section-head">
            <div>
              <h2>Script order</h2>
              <p>Drag scripts inside one category, then save order.</p>
            </div>
            <button className="btn small" onClick={saveOrder}>
              Save order
            </button>
          </div>

          <select
            className="select"
            value={adminCategory}
            onChange={(e) => setAdminCategory(e.target.value)}
          >
            {categoryOptions.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <div className="admin-list draggable-list order-list-modern">
            {adminScripts.map((script) => (
              <button
                key={script.id}
                draggable
                onDragStart={() => setDraggedId(script.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => reorderLocal(script.id)}
                className={`script-card ${selected?.id === script.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedId(script.id);
                  setAdminTab("edit");
                }}
              >
                <b>☰ {script.title}</b>
                <p>
                  {script.country} • {script.language} • #
                  {script.sortOrder || 0}
                </p>
              </button>
            ))}
            {!adminScripts.length && (
              <p className="muted-text">
                No scripts in this category yet. Add the first script in Add
                Script.
              </p>
            )}
          </div>
        </div>
      )}

      {adminTab === "edit" && (
        <div className="admin-edit-layout">
          <div className="card admin-panel">
            <div className="section-head compact">
              <div>
                <h2>Choose script</h2>
                <p>Pick a category and select the script to edit.</p>
              </div>
            </div>
            <select
              className="select"
              value={adminCategory}
              onChange={(e) => setAdminCategory(e.target.value)}
            >
              {categoryOptions.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <div className="admin-list compact-select-list">
              {adminScripts.map((script) => (
                <button
                  key={script.id}
                  className={`script-card ${selected?.id === script.id ? "active" : ""} ${!script.active ? "is-inactive" : ""}`}
                  onClick={() => setSelectedId(script.id)}
                >
                  <b>{script.title}</b>
                  <p>
                    {script.country} • {script.language}
                    {!script.active && " • ⚠️ Inactive"}
                  </p>
                </button>
              ))}
              {!adminScripts.length && (
                <p className="muted-text">No scripts in this category.</p>
              )}
            </div>
          </div>

          <div className="card admin-editor">
            <div className="section-head">
              <div>
                <h2>Edit script</h2>
                <p>Changes apply to all users.</p>
              </div>
              <div className="toolbar">
                <button
                  className="btn ghost small"
                  onClick={toggleScriptActive}
                  disabled={!selected}
                >
                  {selected?.active ? "🚫 Deactivate" : "✅ Activate"}
                </button>
                <button
                  className="btn ghost small danger-btn"
                  onClick={() => selected && deleteScript(selected.id)}
                  disabled={!selected}
                >
                  Delete script
                </button>
                <button
                  className="btn small"
                  onClick={saveSelected}
                  disabled={!selected}
                >
                  Save changes
                </button>
              </div>
            </div>

            {selected ? (
              <>
                <div className="field">
                  <label>Title</label>
                  <input
                    className="input"
                    value={selected.title}
                    onChange={(event) =>
                      updateSelected({ title: event.target.value })
                    }
                  />
                </div>

                <div className="admin-fields">
                  <div className="field">
                    <label>Category</label>
                    <select
                      className="select"
                      value={selected.category}
                      onChange={(event) =>
                        updateSelected({ category: event.target.value })
                      }
                    >
                      {!categoryOptions.includes(selected.category) && (
                        <option value={selected.category}>
                          {selected.category}
                        </option>
                      )}
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Country</label>
                    <select
                      className="select"
                      value={selected.country}
                      onChange={(event) =>
                        updateSelected({
                          country: event.target.value as Script["country"],
                        })
                      }
                    >
                      <option value="KSA">KSA</option>
                      <option value="UAE">UAE</option>
                      <option value="ALL">ALL</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Language</label>
                    <select
                      className="select"
                      value={selected.language}
                      onChange={(event) =>
                        updateSelected({
                          language: event.target.value as Script["language"],
                        })
                      }
                    >
                      <option value="AR">AR</option>
                      <option value="EN">EN</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Body</label>
                  <textarea
                    className="textarea admin-body"
                    value={selected.body}
                    onChange={(event) =>
                      updateSelected({ body: event.target.value })
                    }
                  />
                </div>
              </>
            ) : (
              <div className="empty-state-card">
                <h3>No script selected</h3>
                <p>
                  Choose a category with scripts, or add a new script first.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {adminTab === "users" && isAdminRole(currentUser?.role) && (
        <div className="card admin-panel users-panel">
          <div className="section-head compact">
            <div>
              <h2>Users</h2>
              <p>
                Manage users without affecting scripts or personal favorites.
              </p>
            </div>
          </div>
          <div className="admin-list">
            {users.map((member) => (
              <div className="user-row" key={member.id}>
                <div>
                  <b>
                    {member.nameEn} / {member.nameAr}
                  </b>
                  <span>
                    {member.email} • {member.role} •{" "}
                    {member.emailVerifiedAt ? "Active" : "⏳ Pending approval"}
                  </span>
                </div>
                <div className="user-actions">
                  {member.role === "USER" && isSuperAdmin(currentUser.role) && (
                    <button
                      className="btn ghost small"
                      onClick={() => changeUserRole(member.id, "ADMIN")}
                      disabled={member.id === currentUser.id}
                    >
                      Promote to admin
                    </button>
                  )}
                  {member.role === "ADMIN" && isSuperAdmin(currentUser.role) && (
                    <>
                      <button
                        className="btn ghost small"
                        onClick={() => changeUserRole(member.id, "SUPER_ADMIN")}
                        disabled={member.id === currentUser.id}
                      >
                        Make super admin
                      </button>
                      <button
                        className="btn ghost small"
                        onClick={() => changeUserRole(member.id, "USER")}
                        disabled={member.id === currentUser.id}
                      >
                        Make user
                      </button>
                    </>
                  )}
                  {member.role === "SUPER_ADMIN" && isSuperAdmin(currentUser.role) && (
                    <button
                      className="btn ghost small"
                      onClick={() => changeUserRole(member.id, "ADMIN")}
                      disabled={member.id === currentUser.id}
                    >
                      Make admin
                    </button>
                  )}
                  {!isSuperAdmin(currentUser.role) && (
                    <span className="muted-text">Role changes require Super Admin.</span>
                  )}
                  <button
                    className={member.emailVerifiedAt ? "btn ghost small" : "btn small"}
                    onClick={() => generateUserPassword(member.id, !member.emailVerifiedAt)}
                  >
                    {member.emailVerifiedAt ? "🔑 New password" : "✅ Approve & set password"}
                  </button>
                  {isSuperAdmin(currentUser.role) && (
                    <button
                      className="btn ghost small danger-btn"
                      onClick={() => deleteUser(member.id)}
                      disabled={member.id === currentUser.id}
                    >
                      Delete user
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === "ai" && (
        <div className="card admin-panel users-panel ai-trainer-card">
          <div className="section-head">
            <div>
              <h2>AI Chatbot Trainer</h2>
              <p>
                Add official policies, internal notes, FAQs, links, and approved
                answers. The AI uses this knowledge without exposing private
                user chats.
              </p>
            </div>
            <div className="toolbar">
              <button className="btn ghost small" onClick={resetTrainerForm}>
                New item
              </button>
              <button className="btn small" onClick={saveTrainerItem}>
                {trainerForm.id ? "Update knowledge" : "Add knowledge"}
              </button>
            </div>
          </div>

          <div className="trainer-grid">
            <div className="trainer-form">
              <div className="field">
                <label>Title</label>
                <input
                  className="input"
                  value={trainerForm.title}
                  onChange={(e) =>
                    setTrainerForm({ ...trainerForm, title: e.target.value })
                  }
                />
              </div>
              <p className="trainer-scope-note">
                📌 أي معرفة تضيفها تُحفظ تلقائياً للسعودية والإمارات وباللغتين — ما
                تحتاج تحدد دولة أو لغة. (Auto-applied to KSA &amp; UAE, both languages.)
              </p>
              <div className="field">
                <label>Kind (optional)</label>
                <input
                  className="input"
                  value={trainerForm.kind}
                  onChange={(e) =>
                    setTrainerForm({ ...trainerForm, kind: e.target.value })
                  }
                  placeholder="Policy / FAQ / Internal Note / Link"
                />
              </div>
              <div className="field">
                <label>Source URL or file name</label>
                <input
                  className="input"
                  value={trainerForm.sourceUrl}
                  onChange={(e) =>
                    setTrainerForm({
                      ...trainerForm,
                      sourceUrl: e.target.value,
                    })
                  }
                  placeholder="https://... or internal file"
                />
              </div>
              <label className="remember-row">
                <input
                  type="checkbox"
                  checked={trainerForm.active}
                  onChange={(e) =>
                    setTrainerForm({ ...trainerForm, active: e.target.checked })
                  }
                />{" "}
                <span>Active for AI</span>
              </label>
              <div className="field">
                <label>Knowledge content</label>
                <textarea
                  className="textarea trainer-body"
                  value={trainerForm.content}
                  onChange={(e) =>
                    setTrainerForm({ ...trainerForm, content: e.target.value })
                  }
                  placeholder="Write the exact policy, approved answer, FAQ, or internal rule here..."
                />
              </div>
            </div>

            <div className="trainer-list">
              {trainerItems.map((item) => (
                <div
                  className={`trainer-item ${trainerForm.id === item.id ? "active" : ""}`}
                  key={item.id}
                >
                  <button onClick={() => editTrainerItem(item)}>
                    <b>{item.title}</b>
                    <span>
                      {item.kind} • {item.country} • {item.language} •{" "}
                      {item.active ? "Active" : "Inactive"}
                    </span>
                    <p>{preview(item.content)}</p>
                  </button>
                  <button
                    className="chat-delete-button"
                    onClick={() => deleteTrainerItem(item.id)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
              {!trainerItems.length && (
                <p className="muted-text">No AI knowledge items yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
