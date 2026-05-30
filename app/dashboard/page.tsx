"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  profileImage: string | null;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
};

type AdminUser = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  profileImage: string | null;
  role: "USER" | "ADMIN";
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
type Section = "quick" | "scripts" | "chatbot" | "calculator" | "profile" | "admin";
type ChatMessage = { role: "user" | "assistant"; content: string };

const CATEGORY_ORDER = [
  "Quick Scripts",
  "Cancellation & Retention",
  "Freeze Policy",
  "Payment & Billing",
  "Tickets",
  "App / Login / Password",
  "Friend / Bring a Friend",
  "Offers, Prices & PT",
  "Membership & Packages",
  "Branches & Hours",
  "Links"
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
  [12, "ذو الحجة", "Dhu Al-Hijjah"]
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
  const name = language === "AR" ? user?.nameAr || "الفريق" : user?.nameEn || "Team";

  return String(text || "")
    .replaceAll("{{employeeName}}", name)
    .replaceAll("example@email.com", "")
    .replaceAll("example@gmail.com", "")
    .replaceAll("0000000000", "")
    .replaceAll("00/00/0000", "00-00-2020")
    .replaceAll("__/__/____", "00-00-2020");
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
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date).replace(/\//g, "-");
}

function gregorianToHijri(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });

  const parts = formatter.formatToParts(date);
  const day = Number(normalizeDigits(parts.find((part) => part.type === "day")?.value || "0"));
  const month = Number(normalizeDigits(parts.find((part) => part.type === "month")?.value || "0"));
  const year = Number(normalizeDigits(parts.find((part) => part.type === "year")?.value || "0"));

  return { day, month, year };
}

function hijriToGregorian(hijriDay: number, hijriMonth: number, hijriYear: number) {
  if (!hijriDay || !hijriMonth || !hijriYear) return null;

  const estimatedGregorianYear = Math.floor(hijriYear * 0.970224 + 621.5774);
  const start = Date.UTC(estimatedGregorianYear - 1, 0, 1, 12);
  const end = Date.UTC(estimatedGregorianYear + 1, 11, 31, 12);

  for (let time = start; time <= end; time += 86400000) {
    const date = new Date(time);
    const hijri = gregorianToHijri(date);
    if (hijri.day === hijriDay && hijri.month === hijriMonth && hijri.year === hijriYear) {
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [country, setCountry] = useState<Country>("KSA");
  const [language, setLanguage] = useState<Lang>("AR");
  const [section, setSection] = useState<Section>("quick");
  const [category, setCategory] = useState("Cancellation & Retention");
  const [selectedId, setSelectedId] = useState("");
  const [editorText, setEditorText] = useState("");
  const [quickNoteText, setQuickNoteText] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  async function loadScripts() {
    const data = await fetch("/api/scripts").then((res) => res.json());
    setScripts(data.scripts || []);
  }

  async function loadFavorites() {
    const data = await fetch("/api/favorites").then((res) => res.json()).catch(() => ({ scriptIds: [] }));
    setFavoriteIds(data.scriptIds || []);
  }

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((res) => res.json());
      if (!me.user) {
        router.push("/login");
        return;
      }
      setUser(me.user);
      await loadScripts();
      await loadFavorites();
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
      .filter((script) => script.active && (script.country === country || script.country === "ALL") && script.language === language)
      .sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || (a.sortOrder || 0) - (b.sortOrder || 0) || a.title.localeCompare(b.title));
  }, [scripts, country, language]);

  const categories = useMemo(() => {
    const set = new Set(visibleScripts.filter((script) => script.category !== "Quick Scripts").map((script) => script.category));
    return Array.from(set).sort((a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b));
  }, [visibleScripts]);

  const quickScripts = useMemo(() => visibleScripts.filter((script) => script.category === "Quick Scripts"), [visibleScripts]);

  const quickStickyText = useMemo(() => {
    return quickScripts.map((script) => `${script.title}\n${applyUserName(script.body, script.language, user)}`).join("\n\n━━━━━━━━━━━━━━━━━━━━\n\n");
  }, [quickScripts, user]);

  const filteredScripts = useMemo(() => visibleScripts.filter((script) => script.category === category), [visibleScripts, category]);

  const favoriteScripts = useMemo(() => visibleScripts.filter((script) => favoriteIds.includes(script.id) && script.category !== "Quick Scripts"), [visibleScripts, favoriteIds]);

  const selected = useMemo(() => filteredScripts.find((script) => script.id === selectedId) || filteredScripts[0] || null, [filteredScripts, selectedId]);

  useEffect(() => {
    if (!categories.includes(category) && categories[0]) setCategory(categories[0]);
  }, [categories, category]);

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
  }, [selected?.id, user]);

  function flash(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 1400);
  }

  function selectScript(script: Script) {
    setSelectedId(script.id);
    setEditorText(applyUserName(script.body, script.language, user));
  }

  async function toggleFavorite(scriptId: string) {
    const isFavorite = favoriteIds.includes(scriptId);
    setFavoriteIds((current) => (isFavorite ? current.filter((id) => id !== scriptId) : [scriptId, ...current]));

    const res = await fetch("/api/favorites", {
      method: isFavorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scriptId })
    });

    if (!res.ok) {
      await loadFavorites();
      flash("Favorite update failed");
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    flash("Copied");
  }

  async function spellcheck() {
    try {
      const res = await fetch("/api/ai/spellcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editorText, language })
      });
      const data = await res.json().catch(() => ({ error: "AI route returned a non-JSON response." }));
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

  const title = section === "quick" ? "Quick Scripts" : section === "scripts" ? "Script Library" : section === "chatbot" ? "AI Chatbot" : section === "calculator" ? "Calculation Tool" : section === "profile" ? "Profile" : "Admin Editor";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">PG</div>
          <div>
            <div className="brand">PureGym Hub</div>
            <div className="subbrand">Scripts • AI • Tools</div>
          </div>
        </div>

        <button className={`nav-button ${section === "quick" ? "active" : ""}`} onClick={() => setSection("quick")}>Quick Scripts</button>
        <button className={`nav-button ${section === "scripts" ? "active" : ""}`} onClick={() => setSection("scripts")}>Script Library</button>
        <button className={`nav-button ${section === "chatbot" ? "active" : ""}`} onClick={() => setSection("chatbot")}>AI Chatbot</button>
        <button className={`nav-button ${section === "calculator" ? "active" : ""}`} onClick={() => setSection("calculator")}>Calculation Tool</button>
        {user?.role === "ADMIN" && <button className={`nav-button ${section === "admin" ? "active" : ""}`} onClick={() => setSection("admin")}>Admin Editor</button>}

        <div className="sidebar-user">
          <div className="profile-chip" aria-label="User account summary">
            {user?.profileImage ? <img src={user.profileImage} alt="Profile" /> : <span>{(language === "AR" ? user?.nameAr : user?.nameEn)?.slice(0, 1) || "P"}</span>}
            <b>{language === "AR" ? user?.nameAr : user?.nameEn}</b>
          </div>
          <span>{user?.email}</span>
          <button className="btn secondary small full" onClick={() => setSection("profile")}>Profile</button>
          <button className="btn secondary small full" onClick={() => setDarkMode(!darkMode)}>{darkMode ? "Light mode" : "Dark mode"}</button>
          <button className="btn secondary small full" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{country} • {language === "AR" ? "Arabic" : "English"}</p>
          </div>
          <div className="toolbar">
            <button className={`toggle ksa ${country === "KSA" ? "active" : ""}`} onClick={() => setCountry("KSA")}>💚 KSA</button>
            <button className={`toggle uae ${country === "UAE" ? "active" : ""}`} onClick={() => setCountry("UAE")}>💙 UAE</button>
            <button className={`toggle ${language === "AR" ? "active" : ""}`} onClick={() => setLanguage("AR")}>Arabic</button>
            <button className={`toggle ${language === "EN" ? "active" : ""}`} onClick={() => setLanguage("EN")}>English</button>
          </div>
        </div>

        {message && <div className="toast">{message}</div>}

        {section === "quick" && (
          <div className="quick-layout">
            <div className="card">
              <div className="section-head">
                <div>
                  <h2>Sticky Note</h2>
                  <p>كل السكربتات السريعة حسب الدولة واللغة المختارة.</p>
                </div>
                <div className="toolbar">
                  <button className="btn ghost small" onClick={() => setQuickNoteText(quickStickyText)}>Reset</button>
                  <button className="btn small" onClick={() => copyText(quickNoteText)}>Copy All</button>
                </div>
              </div>
              <textarea className="textarea sticky-note" dir={language === "AR" ? "rtl" : "ltr"} value={quickNoteText} onChange={(event) => setQuickNoteText(event.target.value)} />
            </div>
            <div className="quick-cards">
              {quickScripts.map((script) => {
                const body = applyUserName(script.body, script.language, user);
                return <button className="mini-script-card" key={script.id} onClick={() => copyText(body)}><b>{script.title}</b><span>{preview(body)}</span></button>;
              })}
            </div>
          </div>
        )}

        {section === "scripts" && (
          <>
            <div className="favorites-strip card">
              <div className="section-head compact">
                <div><h2>⭐ Favorite Scripts</h2><p>Your personal favorites only. They do not affect other users.</p></div>
              </div>
              {favoriteScripts.length ? (
                <div className="favorite-card-grid">
                  {favoriteScripts.map((script) => {
                    const body = applyUserName(script.body, script.language, user);
                    return (
                      <button key={script.id} className="mini-script-card" onClick={() => { setCategory(script.category); selectScript(script); }}>
                        <b>{script.title}</b>
                        <span>{script.category} • {script.country}</span>
                        <span>{preview(body)}</span>
                      </button>
                    );
                  })}
                </div>
              ) : <p className="muted-text">Click the star on any script to keep it here.</p>}
            </div>
            <div className="library-layout">
            <div className="category-panel">
              <div className="category-grid">
                {categories.map((item) => {
                  const count = visibleScripts.filter((script) => script.category === item).length;
                  return <button key={item} className={`category-card ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}><b>{item}</b><span>{count} scripts</span></button>;
                })}
              </div>
            </div>

            <div className="script-results">
              <div className="section-head"><div><h2>{category}</h2><p>{filteredScripts.length} scripts available</p></div></div>
              <div className="script-card-grid">
                {filteredScripts.map((script) => {
                  const body = applyUserName(script.body, script.language, user);
                  const isFavorite = favoriteIds.includes(script.id);
                  return (
                    <div key={script.id} className={`script-card ${selectedId === script.id ? "active" : ""}`} onClick={() => selectScript(script)} role="button" tabIndex={0}>
                      <div className="script-card-top">
                        <b>{script.title}</b>
                        <div className="script-card-actions">
                          <span>{script.country}</span>
                          <button className={`star-button ${isFavorite ? "active" : ""}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(script.id); }} title="Favorite">{isFavorite ? "★" : "☆"}</button>
                        </div>
                      </div>
                      <p>{preview(body)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="script-box card">
              <div className="section-head compact">
                <div><h2>Script Box</h2><p>{selected?.title || "Select a script"}</p></div>
                <div className="toolbar">
                  <button className="btn ghost small" onClick={() => selected && setEditorText(applyUserName(selected.body, selected.language, user))} disabled={!selected}>Reset</button>
                  <button className="btn ghost small" onClick={spellcheck} disabled={!editorText}>تدقيق</button>
                  <button className="btn small" onClick={() => copyText(editorText)} disabled={!editorText}>Copy</button>
                </div>
              </div>
              <textarea className="textarea script-editor" dir={language === "AR" ? "rtl" : "ltr"} value={editorText} onChange={(event) => setEditorText(event.target.value)} />
              {category === "Links" && <div className="link-preview">{linkifyParts(editorText)}</div>}
            </div>
          </div>
          </>
        )}

        {section === "chatbot" && <Chatbot country={country} language={language} />}
        {section === "calculator" && <Calculator country={country} />}
        {section === "profile" && user && <Profile user={user} setUser={setUser} />}
        {section === "admin" && user?.role === "ADMIN" && <Admin scripts={scripts} setScripts={setScripts} currentUser={user} onScriptsChanged={loadScripts} />}
      </main>
    </div>
  );
}

function Chatbot({ country, language }: { country: Country; language: Lang }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "أهلاً! اسألني عن السكربتات، السياسات، الروابط، أو اطلب إعادة صياغة/ترجمة." }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function ask() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, country, language, messages })
      });
      const data = await res.json().catch(() => ({ error: "AI route returned a non-JSON response." }));
      setMessages([...nextMessages, { role: "assistant", content: res.ok ? data.answer : data.error || "AI failed" }]);
    } catch (error) {
      setMessages([...nextMessages, { role: "assistant", content: error instanceof Error ? error.message : "AI failed" }]);
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
    <div className="chatgpt-shell card">
      <div className="section-head">
        <div><h2>AI Support Chatbot</h2><p>{country} • {language === "AR" ? "Arabic" : "English"}</p></div>
        <div className="toolbar"><button className="btn ghost small" onClick={() => setMessages([{ role: "assistant", content: "أهلاً! اسألني عن السكربتات، السياسات، الروابط، أو اطلب إعادة صياغة/ترجمة." }])}>Reset</button></div>
      </div>
      <div className="messages-panel" dir={language === "AR" ? "rtl" : "ltr"}>
        {messages.map((msg, index) => <div key={index} className={`message-row ${msg.role}`}><div className="message-bubble">{msg.content}</div></div>)}
        {loading && <div className="message-row assistant"><div className="message-bubble typing">Thinking...</div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-bar">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKeyDown} placeholder="اكتب رسالتك هنا..." rows={2} dir={language === "AR" ? "rtl" : "ltr"} />
        <button className="send-button" onClick={ask} disabled={loading || !input.trim()}>➤</button>
      </div>
    </div>
  );
}

function Calculator({ country }: { country: Country }) {
  const [tool, setTool] = useState("monthly-to-pif");
  const [values, setValues] = useState<Record<string, string>>({});
  function set(name: string, value: string) { setValues((currentValues) => ({ ...currentValues, [name]: value })); }
  function num(name: string) { return Number(values[name] || 0); }

  const current = num("current");
  const next = num("next");
  const membershipPrice = num("membershipPrice");
  const currentDate = values.currentDate || "";
  const newDate = values.newDate || "";
  const nextDate = values.nextDate || "";
  const months = num("months") || 1;
  const days = daysBetween(values.transferDate || currentDate, nextDate || newDate);
  const priceDiff = ((next - current) / 31) * Math.max(days, 0);
  const nextPayment = next + priceDiff;
  const pifDays = next > current ? (next - current) / ((next / months) / 31) : 0;
  const deductionDiff = daysBetween(currentDate, newDate);
  const changedPayment = membershipPrice + (membershipPrice / 31) * deductionDiff;

  return (
    <div className="card">
      <div className="section-head"><div><h2>Calculation Tool</h2><p>Billing tools + Hijri date converter.</p></div></div>
      <div className="tool-tabs">
        <button className={`toggle ${tool === "monthly-to-pif" ? "active" : ""}`} onClick={() => setTool("monthly-to-pif")}>Monthly to PIF</button>
        <button className={`toggle ${tool === "home-monthly" ? "active" : ""}`} onClick={() => setTool("home-monthly")}>Home Gym Monthly</button>
        <button className={`toggle ${tool === "home-pif" ? "active" : ""}`} onClick={() => setTool("home-pif")}>Home Gym PIF</button>
        <button className={`toggle ${tool === "upgrade" ? "active" : ""}`} onClick={() => setTool("upgrade")}>Upgrade</button>
        <button className={`toggle ${tool === "deduction" ? "active" : ""}`} onClick={() => setTool("deduction")}>Deduction Date</button>
        <button className={`toggle ${tool === "discount" ? "active" : ""}`} onClick={() => setTool("discount")}>Discount</button>
        <button className={`toggle ${tool === "hijri" ? "active" : ""}`} onClick={() => setTool("hijri")}>Hijri Months</button>
      </div>
      {tool === "monthly-to-pif" && <MonthlyToPif values={values} set={set} country={country} />}
      {(tool === "home-monthly" || tool === "upgrade") && <MonthlyTransfer values={values} set={set} country={country} label={tool === "upgrade" ? "Upgrade" : "Home Gym Transfer Monthly"} priceDiff={priceDiff} nextPayment={nextPayment} days={days} />}
      {tool === "home-pif" && <PifTransfer values={values} set={set} country={country} pifDays={pifDays} />}
      {tool === "deduction" && <DeductionDate values={values} set={set} country={country} days={deductionDiff} result={changedPayment} />}
      {tool === "discount" && <Discount values={values} set={set} country={country} />}
      {tool === "hijri" && <HijriMonths />}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <div className="field"><label>{label}</label><input className="input" type="number" step="0.01" value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
function DateField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <div className="field"><label>{label}</label><input className="input" type="date" value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
function MonthlyToPif({ values, set, country }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country }) {
  const monthlyPrice = Number(values.monthlyPrice || 0); const start = values.startDate || ""; const end = values.endDate || ""; const totalPif = Number(values.totalPif || 0); const perDay = monthlyPrice / 31; const usedDays = Math.max(daysBetween(start, end) + 1, 0); const usedAmount = perDay * usedDays; const remaining = totalPif - usedAmount;
  return <div className="calculator-grid"><div><NumberField label="Monthly price" value={values.monthlyPrice} onChange={(value) => set("monthlyPrice", value)} /><NumberField label="PIF total price" value={values.totalPif} onChange={(value) => set("totalPif", value)} /><DateField label="Date of transfer" value={start} onChange={(value) => set("startDate", value)} /><DateField label="One day before next deduction date" value={end} onChange={(value) => set("endDate", value)} /></div><ResultBox items={[["Price per day", money(perDay, country)], ["Days used", String(usedDays)], ["Used amount", money(usedAmount, country)], ["Remaining PIF amount", money(remaining, country)]]} /></div>;
}
function MonthlyTransfer({ values, set, country, label, priceDiff, nextPayment, days }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; label: string; priceDiff: number; nextPayment: number; days: number }) {
  return <div className="calculator-grid"><div><h3>{label}</h3><NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} /><NumberField label="New price" value={values.next} onChange={(value) => set("next", value)} /><DateField label="Date of transfer" value={values.transferDate} onChange={(value) => set("transferDate", value)} /><DateField label="One day before next deduction date" value={values.nextDate} onChange={(value) => set("nextDate", value)} /></div><ResultBox items={[["Days", String(Math.max(days, 0))], ["Price difference", money(priceDiff, country)], ["Next payment amount", money(nextPayment, country)]]} /></div>;
}
function PifTransfer({ values, set, country, pifDays }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; pifDays: number }) {
  return <div className="calculator-grid"><div><NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} /><NumberField label="New price" value={values.next} onChange={(value) => set("next", value)} /><NumberField label="Number of months" value={values.months} onChange={(value) => set("months", value)} /></div><ResultBox items={[["Price difference", money(Number(values.next || 0) - Number(values.current || 0), country)], ["Days to be deducted", Math.max(pifDays, 0).toFixed(1)]]} note="If member transfers from higher price gym to lower price gym, no days are added." /></div>;
}
function DeductionDate({ values, set, country, days, result }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; days: number; result: number }) {
  return <div className="calculator-grid"><div><DateField label="Current deduction date" value={values.currentDate} onChange={(value) => set("currentDate", value)} /><DateField label="New deduction date" value={values.newDate} onChange={(value) => set("newDate", value)} /><NumberField label="Membership price" value={values.membershipPrice} onChange={(value) => set("membershipPrice", value)} /></div><ResultBox items={[["Days difference", String(days)], ["Next payment amount", money(result, country)]]} /></div>;
}
function Discount({ values, set, country }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country }) {
  const price = Number(values.current || 0); return <div className="calculator-grid"><div><NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} /></div><ResultBox items={[["After 25% discount", money(price * 0.75, country)], ["After 20% discount", money(price * 0.8, country)]]} note="Only monthly members who did not join on discounted price are eligible." /></div>;
}
function ResultBox({ items, note }: { items: [string, string][]; note?: string }) {
  return <div className="calc-result"><h3>Result</h3>{items.map(([label, value]) => <p key={label}>{label}: <b>{value}</b></p>)}{note && <p>{note}</p>}</div>;
}
function HijriMonths() {
  const [today, setToday] = useState(new Date());
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12));
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

  return (
    <div className="hijri-card">
      <div className="section-head compact">
        <div>
          <h3>Hijri Date Helper</h3>
          <p>Convert a Hijri date to Gregorian, and check today’s date in both calendars.</p>
        </div>
      </div>

      <div className="today-date-grid">
        <div className="date-card">
          <span>Today Gregorian</span>
          <b>{formatDate(today)}</b>
        </div>
        <div className="date-card">
          <span>Today Hijri</span>
          <b>{todayHijri.day} {hijriMonthName(todayHijri.month)} {todayHijri.year}</b>
        </div>
      </div>

      <div className="hijri-converter-grid">
        <div className="field"><label>Hijri day</label><input className="input" inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))} /></div>
        <div className="field"><label>Hijri month</label><select className="select" value={month} onChange={(e) => setMonth(e.target.value)}>{HIJRI_MONTHS.map(([num, ar, en]) => <option key={num} value={num}>{num} - {ar} / {en}</option>)}</select></div>
        <div className="field"><label>Hijri year</label><input className="input" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} /></div>
      </div>

      <div className="calc-result">
        <h3>Gregorian result</h3>
        {converted ? <p><b>{formatDate(converted)}</b></p> : <p>Enter a valid Hijri date.</p>}
        <p className="small-note">The result uses the Umm Al-Qura / Islamic calendar available in the browser and may differ by one day depending on the official calendar.</p>
      </div>

      <div className="hijri-grid">
        {HIJRI_MONTHS.map(([num, ar, en]) => <div className="hijri-item" key={num}><b>{num}</b><span>{ar}</span><small>{en}</small></div>)}
      </div>
    </div>
  );
}

function Profile({ user, setUser }: { user: User; setUser: (user: User) => void }) {
  const [form, setForm] = useState({ nameAr: user.nameAr, nameEn: user.nameEn, profileImage: user.profileImage || "", currentPassword: "", newPassword: "" });
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
    reader.onload = () => setForm((current) => ({ ...current, profileImage: String(reader.result || "") }));
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    setStatus("");
    setLoading(true);

    const payload: Record<string, string | null> = {
      nameAr: form.nameAr,
      nameEn: form.nameEn,
      profileImage: form.profileImage || null
    };

    if (form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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
      emailVerified: Boolean(data.user.emailVerifiedAt)
    });

    setForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
    setStatus("Profile updated successfully.");
  }

  return (
    <div className="profile-layout">
      <div className="card profile-card">
        <div className="profile-avatar-large">
          {form.profileImage ? <img src={form.profileImage} alt="Profile" /> : <span>{form.nameEn.slice(0, 1) || "P"}</span>}
        </div>
        <h2>{form.nameEn}</h2>
        <p>{user.email}</p>
        <span className="role-badge">{user.role}</span>
      </div>

      <div className="card profile-form-card">
        <div className="section-head">
          <div>
            <h2>Profile Settings</h2>
            <p>Update your display names, optional profile image, and password.</p>
          </div>
          <button className="btn" onClick={saveProfile} disabled={loading}>{loading ? "Saving..." : "Save profile"}</button>
        </div>

        {status && <p className={status.includes("success") ? "success" : "error"}>{status}</p>}

        <div className="profile-form-grid">
          <div className="field"><label>Arabic name</label><input className="input" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
          <div className="field"><label>English name</label><input className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></div>
        </div>

        <div className="field">
          <label>Profile image optional</label>
          <input className="input" type="file" accept="image/*" onChange={(e) => onImageChange(e.target.files?.[0] || null)} />
        </div>

        {form.profileImage && <button className="btn ghost small" type="button" onClick={() => setForm({ ...form, profileImage: "" })}>Remove image</button>}

        <div className="password-panel">
          <h3>Reset password</h3>
          <p>Leave these fields empty if you do not want to change your password.</p>
          <div className="profile-form-grid">
            <div className="field"><label>Current password</label><input className="input" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} autoComplete="current-password" /></div>
            <div className="field"><label>New password</label><input className="input" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} autoComplete="new-password" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Admin({ scripts, setScripts, currentUser, onScriptsChanged }: { scripts: Script[]; setScripts: (scripts: Script[]) => void; currentUser: User; onScriptsChanged: () => Promise<void> }) {
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("");
  const [adminCategory, setAdminCategory] = useState("Cancellation & Retention");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [newScript, setNewScript] = useState({ title: "", category: "Cancellation & Retention", country: "KSA" as Script["country"], language: "AR" as Script["language"], body: "" });

  const adminCategories = useMemo(() => Array.from(new Set(scripts.map((script) => script.category))).sort((a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b)), [scripts]);
  const adminScripts = useMemo(() => scripts.filter((script) => script.category === adminCategory).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.title.localeCompare(b.title)), [scripts, adminCategory]);
  const selected = useMemo(() => scripts.find((script) => script.id === selectedId) || adminScripts[0] || scripts[0] || null, [scripts, adminScripts, selectedId]);

  useEffect(() => { if (!adminCategories.includes(adminCategory) && adminCategories[0]) setAdminCategory(adminCategories[0]); }, [adminCategories, adminCategory]);
  useEffect(() => { if (selected && !selectedId) setSelectedId(selected.id); }, [selected, selectedId]);
  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => ({ users: [] }));
    if (res.ok) setUsers(data.users || []);
  }

  function updateSelected(patch: Partial<Script>) { if (selected) setScripts(scripts.map((script) => (script.id === selected.id ? { ...script, ...patch } : script))); }

  async function saveSelected() {
    if (!selected) return;
    const res = await fetch(`/api/scripts/${selected.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: selected.title, category: selected.category, country: selected.country, language: selected.language, body: selected.body, active: selected.active, sortOrder: selected.sortOrder || 0 }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Save failed");
    setStatus("Saved for everyone.");
    await onScriptsChanged();
  }

  async function createScript() {
    const res = await fetch("/api/scripts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newScript) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || "Create failed");
    setStatus("Script added.");
    setNewScript({ title: "", category: newScript.category, country: newScript.country, language: newScript.language, body: "" });
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
    const res = await fetch("/api/scripts/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
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

  return (
    <div className="admin-layout-v2">
      <div className="card admin-editor add-script-card admin-wide-card">
        <div className="section-head">
          <div>
            <h2>Add script</h2>
            <p>Create a new script and publish it for all users.</p>
          </div>
          <button className="btn" onClick={createScript}>Add script for everyone</button>
        </div>

        {status && <p className={status.toLowerCase().includes("failed") || status.toLowerCase().includes("error") ? "error" : "success"}>{status}</p>}

        <div className="add-script-form admin-add-grid">
          <div className="field add-title">
            <label>Title</label>
            <input
              className="input"
              value={newScript.title}
              placeholder="Example: Payment Link Approval"
              onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Category</label>
            <select
              className="select"
              value={newScript.category}
              onChange={(e) => setNewScript({ ...newScript, category: e.target.value })}
            >
              {adminCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              <option value="Links">Links</option>
              <option value="Branches & Hours">Branches & Hours</option>
              <option value="Tickets">Tickets</option>
            </select>
          </div>

          <div className="field">
            <label>Country</label>
            <select
              className="select"
              value={newScript.country}
              onChange={(e) => setNewScript({ ...newScript, country: e.target.value as Script["country"] })}
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
              onChange={(e) => setNewScript({ ...newScript, language: e.target.value as Script["language"] })}
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
            onChange={(e) => setNewScript({ ...newScript, body: e.target.value })}
          />
        </div>
      </div>

      <div className="card admin-panel">
        <div className="section-head">
          <div>
            <h2>Script order</h2>
            <p>Drag scripts inside one category, then save order.</p>
          </div>
          <button className="btn small" onClick={saveOrder}>Save order</button>
        </div>

        <select className="select" value={adminCategory} onChange={(e) => setAdminCategory(e.target.value)}>
          {adminCategories.map((cat) => <option key={cat}>{cat}</option>)}
        </select>

        <div className="admin-list draggable-list">
          {adminScripts.map((script) => (
            <button
              key={script.id}
              draggable
              onDragStart={() => setDraggedId(script.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => reorderLocal(script.id)}
              className={`script-card ${selected?.id === script.id ? "active" : ""}`}
              onClick={() => setSelectedId(script.id)}
            >
              <b>☰ {script.title}</b>
              <p>{script.country} • {script.language} • #{script.sortOrder || 0}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card admin-editor">
        <div className="section-head">
          <div>
            <h2>Edit script</h2>
            <p>Changes apply to all users.</p>
          </div>
          <div className="toolbar">
            <button className="btn ghost small danger-btn" onClick={() => selected && deleteScript(selected.id)} disabled={!selected}>Delete script</button>
            <button className="btn small" onClick={saveSelected} disabled={!selected}>Save changes</button>
          </div>
        </div>

        {status && <p className={status.toLowerCase().includes("failed") || status.toLowerCase().includes("error") ? "error" : "success"}>{status}</p>}

        {selected && (
          <>
            <div className="field">
              <label>Title</label>
              <input className="input" value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} />
            </div>

            <div className="admin-fields">
              <div className="field">
                <label>Category</label>
                <input className="input" value={selected.category} onChange={(event) => updateSelected({ category: event.target.value })} />
              </div>

              <div className="field">
                <label>Country</label>
                <select className="select" value={selected.country} onChange={(event) => updateSelected({ country: event.target.value as Script["country"] })}>
                  <option value="KSA">KSA</option>
                  <option value="UAE">UAE</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>

              <div className="field">
                <label>Language</label>
                <select className="select" value={selected.language} onChange={(event) => updateSelected({ language: event.target.value as Script["language"] })}>
                  <option value="AR">AR</option>
                  <option value="EN">EN</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Body</label>
              <textarea className="textarea admin-body" value={selected.body} onChange={(event) => updateSelected({ body: event.target.value })} />
            </div>
          </>
        )}
      </div>

      <div className="card admin-panel users-panel">
        <h2>Users</h2>
        <div className="admin-list">
          {users.map((member) => (
            <div className="user-row" key={member.id}>
              <div>
                <b>{member.nameEn} / {member.nameAr}</b>
                <span>{member.email} • {member.role} • {member.emailVerifiedAt ? "Verified" : "Not verified"}</span>
              </div>
              <button className="btn ghost small danger-btn" onClick={() => deleteUser(member.id)} disabled={member.id === currentUser.id}>Delete user</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
