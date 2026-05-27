"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
};

type AdminUser = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
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
type Section = "quick" | "scripts" | "chatbot" | "calculator" | "admin";
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

function ui(language: Lang, ar: string, en: string) {
  return language === "AR" ? ar : en;
}

function displayCategory(category: string, language: Lang) {
  const arNames: Record<string, string> = {
    "Quick Scripts": "السكربتات السريعة",
    "Cancellation & Retention": "الإلغاء والاحتفاظ",
    "Freeze Policy": "سياسة التجميد",
    "Payment & Billing": "الدفع والفواتير",
    "Tickets": "التذاكر",
    "App / Login / Password": "التطبيق / الدخول / كلمة السر",
    "Friend / Bring a Friend": "الصديق / Bring a Friend",
    "Offers, Prices & PT": "العروض والأسعار والتدريب الشخصي",
    "Membership & Packages": "العضويات والباقات",
    "Branches & Hours": "الفروع وأوقات العمل",
    "Links": "الروابط"
  };

  return language === "AR" ? arNames[category] || category : category;
}

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

  async function loadScripts() {
    const data = await fetch("/api/scripts").then((res) => res.json());
    setScripts(data.scripts || []);
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

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    flash(ui(language, "تم النسخ", "Copied"));
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
        flash(ui(language, "تم التدقيق", "Checked"));
      } else {
        flash(data.error || ui(language, "فشل التدقيق", "Spellcheck failed"));
      }
    } catch (error) {
      flash(error instanceof Error ? error.message : ui(language, "فشل التدقيق", "Spellcheck failed"));
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const title = section === "quick"
    ? ui(language, "السكربتات السريعة", "Quick Scripts")
    : section === "scripts"
      ? ui(language, "مكتبة السكربتات", "Script Library")
      : section === "chatbot"
        ? ui(language, "المساعد الذكي", "AI Chatbot")
        : section === "calculator"
          ? ui(language, "أدوات الحساب", "Calculation Tool")
          : ui(language, "لوحة الأدمن", "Admin Editor");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">PG</div>
          <div>
            <div className="brand">PureGym Hub</div>
            <div className="subbrand">{ui(language, "سكربتات • AI • أدوات", "Scripts • AI • Tools")}</div>
          </div>
        </div>

        <button className={`nav-button ${section === "quick" ? "active" : ""}`} onClick={() => setSection("quick")}>{ui(language, "السكربتات السريعة", "Quick Scripts")}</button>
        <button className={`nav-button ${section === "scripts" ? "active" : ""}`} onClick={() => setSection("scripts")}>{ui(language, "مكتبة السكربتات", "Script Library")}</button>
        <button className={`nav-button ${section === "chatbot" ? "active" : ""}`} onClick={() => setSection("chatbot")}>{ui(language, "المساعد الذكي", "AI Chatbot")}</button>
        <button className={`nav-button ${section === "calculator" ? "active" : ""}`} onClick={() => setSection("calculator")}>{ui(language, "أدوات الحساب", "Calculation Tool")}</button>
        {user?.role === "ADMIN" && <button className={`nav-button ${section === "admin" ? "active" : ""}`} onClick={() => setSection("admin")}>{ui(language, "لوحة الأدمن", "Admin Editor")}</button>}

        <div className="sidebar-user">
          <b>{language === "AR" ? user?.nameAr : user?.nameEn}</b>
          <span>{user?.email}</span>
          <button className="btn secondary small full" onClick={() => setDarkMode(!darkMode)}>{darkMode ? ui(language, "الوضع الفاتح", "Light mode") : ui(language, "الوضع الداكن", "Dark mode")}</button>
          <button className="btn secondary small full" onClick={logout}>{ui(language, "تسجيل الخروج", "Logout")}</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{country} • {ui(language, "العربية", "English")}</p>
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
                  <h2>{ui(language, "الملاحظة السريعة", "Sticky Note")}</h2>
                  <p>{ui(language, "كل السكربتات السريعة حسب الدولة واللغة المختارة.", "All quick scripts based on the selected country and language.")}</p>
                </div>
                <div className="toolbar">
                  <button className="btn ghost small" onClick={() => setQuickNoteText(quickStickyText)}>{ui(language, "إعادة ضبط", "Reset")}</button>
                  <button className="btn small" onClick={() => copyText(quickNoteText)}>{ui(language, "نسخ الكل", "Copy All")}</button>
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
          <div className="library-layout">
            <div className="category-panel">
              <div className="category-grid">
                {categories.map((item) => {
                  const count = visibleScripts.filter((script) => script.category === item).length;
                  return <button key={item} className={`category-card ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}><b>{displayCategory(item, language)}</b><span>{count} {ui(language, "سكربت", "scripts")}</span></button>;
                })}
              </div>
            </div>

            <div className="script-results">
              <div className="section-head"><div><h2>{displayCategory(category, language)}</h2><p>{filteredScripts.length} {ui(language, "سكربت متاح", "scripts available")}</p></div></div>
              <div className="script-card-grid">
                {filteredScripts.map((script) => {
                  const body = applyUserName(script.body, script.language, user);
                  return (
                    <button key={script.id} className={`script-card ${selectedId === script.id ? "active" : ""}`} onClick={() => selectScript(script)}>
                      <div className="script-card-top"><b>{script.title}</b><span>{script.country}</span></div>
                      <p>{preview(body)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="script-box card">
              <div className="section-head compact">
                <div><h2>{ui(language, "صندوق السكربت", "Script Box")}</h2><p>{selected?.title || ui(language, "اختر سكربت", "Select a script")}</p></div>
                <div className="toolbar">
                  <button className="btn ghost small" onClick={() => selected && setEditorText(applyUserName(selected.body, selected.language, user))} disabled={!selected}>{ui(language, "إعادة ضبط", "Reset")}</button>
                  <button className="btn ghost small" onClick={spellcheck} disabled={!editorText}>{ui(language, "تدقيق", "Check")}</button>
                  <button className="btn small" onClick={() => copyText(editorText)} disabled={!editorText}>{ui(language, "نسخ", "Copy")}</button>
                </div>
              </div>
              <textarea className="textarea script-editor" dir={language === "AR" ? "rtl" : "ltr"} value={editorText} onChange={(event) => setEditorText(event.target.value)} />
              {category === "Links" && <div className="link-preview">{linkifyParts(editorText)}</div>}
            </div>
          </div>
        )}

        {section === "chatbot" && <Chatbot country={country} language={language} />}
        {section === "calculator" && <Calculator country={country} language={language} />}
        {section === "admin" && user?.role === "ADMIN" && <Admin scripts={scripts} setScripts={setScripts} currentUser={user} onScriptsChanged={loadScripts} language={language} />}
      </main>
    </div>
  );
}

function Chatbot({ country, language }: { country: Country; language: Lang }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: ui(language, "أهلاً! اسألني عن السكربتات، السياسات، الروابط، أو اطلب إعادة صياغة/ترجمة.", "Hi! Ask me about scripts, policies, links, or request rewriting/translation.") }
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
        <div><h2>{ui(language, "المساعد الذكي", "AI Support Chatbot")}</h2><p>{country} • {ui(language, "العربية", "English")}</p></div>
        <div className="toolbar"><button className="btn ghost small" onClick={() => setMessages([{ role: "assistant", content: ui(language, "أهلاً! اسألني عن السكربتات، السياسات، الروابط، أو اطلب إعادة صياغة/ترجمة.", "Hi! Ask me about scripts, policies, links, or request rewriting/translation.") }])}>{ui(language, "إعادة ضبط", "Reset")}</button></div>
      </div>
      <div className="messages-panel" dir={language === "AR" ? "rtl" : "ltr"}>
        {messages.map((msg, index) => <div key={index} className={`message-row ${msg.role}`}><div className="message-bubble">{msg.content}</div></div>)}
        {loading && <div className="message-row assistant"><div className="message-bubble typing">{ui(language, "جاري التفكير...", "Thinking...")}</div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-bar">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKeyDown} placeholder={ui(language, "اكتب رسالتك هنا...", "Type your message here...")} rows={2} dir={language === "AR" ? "rtl" : "ltr"} />
        <button className="send-button" onClick={ask} disabled={loading || !input.trim()}>➤</button>
      </div>
    </div>
  );
}

function Calculator({ country, language }: { country: Country; language: Lang }) {
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
      <div className="section-head"><div><h2>{ui(language, "أدوات الحساب", "Calculation Tool")}</h2><p>{ui(language, "أدوات الفواتير + مساعد الشهور الهجرية.", "Billing tools + Hijri month helper.")}</p></div></div>
      <div className="tool-tabs">
        <button className={`toggle ${tool === "monthly-to-pif" ? "active" : ""}`} onClick={() => setTool("monthly-to-pif")}>{ui(language, "تحويل شهري إلى محدد المدة", "Monthly to PIF")}</button>
        <button className={`toggle ${tool === "home-monthly" ? "active" : ""}`} onClick={() => setTool("home-monthly")}>{ui(language, "نقل فرع شهري", "Home Gym Monthly")}</button>
        <button className={`toggle ${tool === "home-pif" ? "active" : ""}`} onClick={() => setTool("home-pif")}>{ui(language, "نقل فرع محدد المدة", "Home Gym PIF")}</button>
        <button className={`toggle ${tool === "upgrade" ? "active" : ""}`} onClick={() => setTool("upgrade")}>{ui(language, "ترقية", "Upgrade")}</button>
        <button className={`toggle ${tool === "deduction" ? "active" : ""}`} onClick={() => setTool("deduction")}>{ui(language, "تاريخ الخصم", "Deduction Date")}</button>
        <button className={`toggle ${tool === "discount" ? "active" : ""}`} onClick={() => setTool("discount")}>{ui(language, "الخصم", "Discount")}</button>
        <button className={`toggle ${tool === "hijri" ? "active" : ""}`} onClick={() => setTool("hijri")}>{ui(language, "الشهور الهجرية", "Hijri Months")}</button>
      </div>
      {tool === "monthly-to-pif" && <MonthlyToPif values={values} set={set} country={country} language={language} />}
      {(tool === "home-monthly" || tool === "upgrade") && <MonthlyTransfer values={values} set={set} country={country} language={language} label={tool === "upgrade" ? ui(language, "ترقية", "Upgrade") : ui(language, "نقل فرع شهري", "Home Gym Transfer Monthly")} priceDiff={priceDiff} nextPayment={nextPayment} days={days} />}
      {tool === "home-pif" && <PifTransfer values={values} set={set} country={country} language={language} pifDays={pifDays} />}
      {tool === "deduction" && <DeductionDate values={values} set={set} country={country} language={language} days={deductionDiff} result={changedPayment} />}
      {tool === "discount" && <Discount values={values} set={set} country={country} language={language} />}
      {tool === "hijri" && <HijriMonths language={language} />}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <div className="field"><label>{label}</label><input className="input" type="number" step="0.01" value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
function DateField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <div className="field"><label>{label}</label><input className="input" type="date" value={value || ""} onChange={(event) => onChange(event.target.value)} /></div>;
}
function MonthlyToPif({ values, set, country, language }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; language: Lang }) {
  const monthlyPrice = Number(values.monthlyPrice || 0); const start = values.startDate || ""; const end = values.endDate || ""; const totalPif = Number(values.totalPif || 0); const perDay = monthlyPrice / 31; const usedDays = Math.max(daysBetween(start, end) + 1, 0); const usedAmount = perDay * usedDays; const remaining = totalPif - usedAmount;
  return <div className="calculator-grid"><div><NumberField label={ui(language, "السعر الشهري", "Monthly price")} value={values.monthlyPrice} onChange={(value) => set("monthlyPrice", value)} /><NumberField label={ui(language, "إجمالي سعر العضوية محددة المدة", "PIF total price")} value={values.totalPif} onChange={(value) => set("totalPif", value)} /><DateField label={ui(language, "تاريخ التحويل", "Date of transfer")} value={start} onChange={(value) => set("startDate", value)} /><DateField label={ui(language, "اليوم السابق لتاريخ الخصم القادم", "One day before next deduction date")} value={end} onChange={(value) => set("endDate", value)} /></div><ResultBox language={language} items={[[ui(language, "السعر لكل يوم", "Price per day"), money(perDay, country)], [ui(language, "الأيام المستخدمة", "Days used"), String(usedDays)], [ui(language, "المبلغ المستخدم", "Used amount"), money(usedAmount, country)], [ui(language, "المبلغ المتبقي للعضوية", "Remaining PIF amount"), money(remaining, country)]]} /></div>;
}
function MonthlyTransfer({ values, set, country, language, label, priceDiff, nextPayment, days }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; language: Lang; label: string; priceDiff: number; nextPayment: number; days: number }) {
  return <div className="calculator-grid"><div><h3>{label}</h3><NumberField label={ui(language, "السعر الحالي", "Current price")} value={values.current} onChange={(value) => set("current", value)} /><NumberField label={ui(language, "السعر الجديد", "New price")} value={values.next} onChange={(value) => set("next", value)} /><DateField label={ui(language, "تاريخ التحويل", "Date of transfer")} value={values.transferDate} onChange={(value) => set("transferDate", value)} /><DateField label={ui(language, "اليوم السابق لتاريخ الخصم القادم", "One day before next deduction date")} value={values.nextDate} onChange={(value) => set("nextDate", value)} /></div><ResultBox language={language} items={[[ui(language, "الأيام", "Days"), String(Math.max(days, 0))], [ui(language, "فرق السعر", "Price difference"), money(priceDiff, country)], [ui(language, "مبلغ الدفعة القادمة", "Next payment amount"), money(nextPayment, country)]]} /></div>;
}
function PifTransfer({ values, set, country, language, pifDays }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; language: Lang; pifDays: number }) {
  return <div className="calculator-grid"><div><NumberField label={ui(language, "السعر الحالي", "Current price")} value={values.current} onChange={(value) => set("current", value)} /><NumberField label={ui(language, "السعر الجديد", "New price")} value={values.next} onChange={(value) => set("next", value)} /><NumberField label={ui(language, "عدد الشهور", "Number of months")} value={values.months} onChange={(value) => set("months", value)} /></div><ResultBox language={language} items={[[ui(language, "فرق السعر", "Price difference"), money(Number(values.next || 0) - Number(values.current || 0), country)], [ui(language, "الأيام التي سيتم خصمها", "Days to be deducted"), Math.max(pifDays, 0).toFixed(1)]]} note={ui(language, "إذا تم النقل من فرع سعره أعلى إلى فرع سعره أقل، لا يتم إضافة أيام.", "If member transfers from higher price gym to lower price gym, no days are added.")} /></div>;
}
function DeductionDate({ values, set, country, language, days, result }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; language: Lang; days: number; result: number }) {
  return <div className="calculator-grid"><div><DateField label={ui(language, "تاريخ الخصم الحالي", "Current deduction date")} value={values.currentDate} onChange={(value) => set("currentDate", value)} /><DateField label={ui(language, "تاريخ الخصم الجديد", "New deduction date")} value={values.newDate} onChange={(value) => set("newDate", value)} /><NumberField label={ui(language, "سعر العضوية", "Membership price")} value={values.membershipPrice} onChange={(value) => set("membershipPrice", value)} /></div><ResultBox language={language} items={[[ui(language, "فرق الأيام", "Days difference"), String(days)], [ui(language, "مبلغ الدفعة القادمة", "Next payment amount"), money(result, country)]]} /></div>;
}
function Discount({ values, set, country, language }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; language: Lang }) {
  const price = Number(values.current || 0); return <div className="calculator-grid"><div><NumberField label={ui(language, "السعر الحالي", "Current price")} value={values.current} onChange={(value) => set("current", value)} /></div><ResultBox language={language} items={[[ui(language, "بعد خصم 25%", "After 25% discount"), money(price * 0.75, country)], [ui(language, "بعد خصم 20%", "After 20% discount"), money(price * 0.8, country)]]} note={ui(language, "ينطبق فقط على أعضاء الشهري الذين لم يشتركوا بسعر مخفض.", "Only monthly members who did not join on discounted price are eligible.")} /></div>;
}
function ResultBox({ items, note, language }: { items: [string, string][]; note?: string; language: Lang }) {
  return <div className="calc-result"><h3>{ui(language, "النتيجة", "Result")}</h3>{items.map(([label, value]) => <p key={label}>{label}: <b>{value}</b></p>)}{note && <p>{note}</p>}</div>;
}
function HijriMonths({ language }: { language: Lang }) {
  return <div className="hijri-card"><h3>{ui(language, "مساعد الشهور الهجرية", "Hijri Month Helper")}</h3><p>{ui(language, "جدول سريع لأسماء الشهور الهجرية وأرقامها. المقابل الميلادي يتغير سنويًا، لذلك استخدمه كمرجع للأسماء والترتيب.", "A quick reference for Hijri month names and numbers. The Gregorian equivalent changes every year, so use it as a names/order guide.")}</p><div className="hijri-grid">{HIJRI_MONTHS.map(([num, ar, en]) => <div className="hijri-item" key={num}><b>{num}</b><span>{ar}</span><small>{en}</small></div>)}</div></div>;
}

function Admin({ scripts, setScripts, currentUser, onScriptsChanged, language }: { scripts: Script[]; setScripts: (scripts: Script[]) => void; currentUser: User; onScriptsChanged: () => Promise<void>; language: Lang }) {
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
    if (!res.ok) return setStatus(data.error || ui(language, "فشل الحفظ", "Save failed"));
    setStatus(ui(language, "تم الحفظ للجميع.", "Saved for everyone."));
    await onScriptsChanged();
  }

  async function createScript() {
    const res = await fetch("/api/scripts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newScript) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || ui(language, "فشل إنشاء السكربت", "Create failed"));
    setStatus(ui(language, "تمت إضافة السكربت.", "Script added."));
    setNewScript({ title: "", category: newScript.category, country: newScript.country, language: newScript.language, body: "" });
    await onScriptsChanged();
    setSelectedId(data.script.id);
  }

  async function deleteScript(id: string) {
    if (!confirm(ui(language, "هل تريد حذف هذا السكربت لكل المستخدمين؟", "Delete this script for all users?"))) return;
    const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    if (!res.ok) return setStatus(ui(language, "فشل الحذف", "Delete failed"));
    setStatus(ui(language, "تم حذف السكربت.", "Script deleted."));
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
    if (!res.ok) return setStatus(ui(language, "فشل حفظ الترتيب", "Saving order failed"));
    setStatus(ui(language, "تم حفظ الترتيب للجميع.", "Order saved for everyone."));
    await onScriptsChanged();
  }

  async function deleteUser(id: string) {
    if (!confirm(ui(language, "هل تريد حذف هذا المستخدم؟", "Delete this user?"))) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data.error || ui(language, "فشل حذف المستخدم", "User delete failed"));
    setStatus(ui(language, "تم حذف المستخدم.", "User deleted."));
    await loadUsers();
  }

  return (
    <div className="admin-layout-v2">
      <div className="card admin-editor add-script-card admin-wide-card">
        <div className="section-head">
          <div>
            <h2>{ui(language, "إضافة سكربت", "Add script")}</h2>
            <p>{ui(language, "أنشئ سكربت جديد وانشره لكل المستخدمين.", "Create a new script and publish it for all users.")}</p>
          </div>
          <button className="btn" onClick={createScript}>{ui(language, "إضافة للجميع", "Add script for everyone")}</button>
        </div>

        {status && <p className={status.toLowerCase().includes("failed") || status.toLowerCase().includes("error") ? "error" : "success"}>{status}</p>}

        <div className="add-script-form admin-add-grid">
          <div className="field add-title">
            <label>{ui(language, "العنوان", "Title")}</label>
            <input
              className="input"
              value={newScript.title}
              placeholder={ui(language, "مثال: موافقة إرسال رابط الدفع", "Example: Payment Link Approval")}
              onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
            />
          </div>

          <div className="field">
            <label>{ui(language, "التصنيف", "Category")}</label>
            <select
              className="select"
              value={newScript.category}
              onChange={(e) => setNewScript({ ...newScript, category: e.target.value })}
            >
              {adminCategories.map((cat) => <option key={cat} value={cat}>{displayCategory(cat, language)}</option>)}
              <option value="Links">{displayCategory("Links", language)}</option>
              <option value="Branches & Hours">{displayCategory("Branches & Hours", language)}</option>
              <option value="Tickets">{displayCategory("Tickets", language)}</option>
            </select>
          </div>

          <div className="field">
            <label>{ui(language, "الدولة", "Country")}</label>
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
            <label>{ui(language, "اللغة", "Language")}</label>
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
          <label>{ui(language, "نص السكربت", "Body")}</label>
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
          <button className="btn small" onClick={saveOrder}>{ui(language, "حفظ الترتيب", "Save order")}</button>
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
            <h2>{ui(language, "تعديل السكربت", "Edit script")}</h2>
            <p>{ui(language, "التعديلات تظهر عند جميع المستخدمين.", "Changes apply to all users.")}</p>
          </div>
          <div className="toolbar">
            <button className="btn ghost small danger-btn" onClick={() => selected && deleteScript(selected.id)} disabled={!selected}>{ui(language, "حذف السكربت", "Delete script")}</button>
            <button className="btn small" onClick={saveSelected} disabled={!selected}>{ui(language, "حفظ التعديل", "Save changes")}</button>
          </div>
        </div>

        {status && <p className={status.toLowerCase().includes("failed") || status.toLowerCase().includes("error") ? "error" : "success"}>{status}</p>}

        {selected && (
          <>
            <div className="field">
              <label>{ui(language, "العنوان", "Title")}</label>
              <input className="input" value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} />
            </div>

            <div className="admin-fields">
              <div className="field">
                <label>{ui(language, "التصنيف", "Category")}</label>
                <input className="input" value={selected.category} onChange={(event) => updateSelected({ category: event.target.value })} />
              </div>

              <div className="field">
                <label>{ui(language, "الدولة", "Country")}</label>
                <select className="select" value={selected.country} onChange={(event) => updateSelected({ country: event.target.value as Script["country"] })}>
                  <option value="KSA">KSA</option>
                  <option value="UAE">UAE</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>

              <div className="field">
                <label>{ui(language, "اللغة", "Language")}</label>
                <select className="select" value={selected.language} onChange={(event) => updateSelected({ language: event.target.value as Script["language"] })}>
                  <option value="AR">AR</option>
                  <option value="EN">EN</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>{ui(language, "نص السكربت", "Body")}</label>
              <textarea className="textarea admin-body" value={selected.body} onChange={(event) => updateSelected({ body: event.target.value })} />
            </div>
          </>
        )}
      </div>

      <div className="card admin-panel users-panel">
        <h2>{ui(language, "المستخدمون", "Users")}</h2>
        <div className="admin-list">
          {users.map((member) => (
            <div className="user-row" key={member.id}>
              <div>
                <b>{member.nameEn} / {member.nameAr}</b>
                <span>{member.email} • {member.role} • {member.emailVerifiedAt ? "Verified" : "Not verified"}</span>
              </div>
              <button className="btn ghost small danger-btn" onClick={() => deleteUser(member.id)} disabled={member.id === currentUser.id}>{ui(language, "حذف المستخدم", "Delete user")}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
