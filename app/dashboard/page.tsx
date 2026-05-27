"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
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
};

type Country = "KSA" | "UAE";
type Lang = "AR" | "EN";
type Section = "quick" | "scripts" | "chatbot" | "calculator" | "admin";

function cleanScriptText(text: string, language: Lang) {
  let value = String(text || "").trim();

  if (language === "AR") {
    value = value
      .replace(
        /^(حياك الله|حيّاك الله|حياك|حيّاك|يا حيّ الله|يا هلا|ياهلا|يا مرحبا|هلا فيك|هلا والله|هلا وغلا|أهلًا وسهلًا|أهلاً وسهلاً|أهلًا|أهلاً|مرحبًا|مرحبا|نورتنا|نورت|يسعدنا تواصلك|مشكور لتواصلك|مشكور على تواصلك|شكرًا لتواصلك معنا|شكرًا على تواصلك معنا)\s*(@?\[?اسم العميل\]?|@?\(اسم العميل\)|@اسم العميل)?[،,! 👋🌟😊💚💙😍🙌🏻🙌🏽🙌✨-]*\s*/i,
        ""
      )
      .replaceAll("@[اسم العميل]", "[اسم العميل]")
      .replaceAll("@(اسم العميل)", "[اسم العميل]")
      .replaceAll("@اسم العميل", "[اسم العميل]")
      .replaceAll("(اسم العميل)", "[اسم العميل]");
  } else {
    value = value
      .replace(
        /^(Hi there|Hi|Hey there|Hey|Hello|Welcome|Thanks for reaching out|Thanks for contacting us|We’re glad to hear from you|We're glad to hear from you)\s*(@?\[?Customer Name\]?|@?\(Customer Name\)|@?\[tag\])?[,\s!👋🌟😊💚💙😍🙌🏻🙌🏽🙌✨-]*/i,
        ""
      )
      .replaceAll("@[Customer Name]", "[Customer Name]")
      .replaceAll("@(Customer Name)", "[Customer Name]")
      .replaceAll("(Customer Name)", "[Customer Name]")
      .replaceAll("@[tag]", "[Customer Name]")
      .replaceAll("[tag]", "[Customer Name]");
  }

  value = value
    .replaceAll("[Email]", "example@email.com")
    .replaceAll("[email]", "example@email.com")
    .replaceAll("[Phone]", "0000000000")
    .replaceAll("[phone]", "0000000000")
    .replaceAll("[Mobile]", "0000000000")
    .replaceAll("[Mobile number]", "0000000000")
    .replaceAll("[رقم الجوال]", "0000000000")
    .replaceAll("[البريد الإلكتروني]", "example@email.com")
    .replaceAll("[Start Date]", "00-00-2020")
    .replaceAll("[End Date]", "00-00-2020")
    .replaceAll("[Next Payment Date]", "00-00-2020")
    .replaceAll("[Membership Expiry Date]", "00-00-2020")
    .replaceAll("[تاريخ البداية]", "00-00-2020")
    .replaceAll("[تاريخ النهاية]", "00-00-2020")
    .replaceAll("[تاريخ الدفعة القادمة]", "00-00-2020")
    .replaceAll("[تاريخ انتهاء العضوية]", "00-00-2020")
    .replaceAll("[تاريخ الانتهاء]", "00-00-2020")
    .replaceAll("[Next Payment Amount]", "00 SAR")
    .replaceAll("[قيمة الدفعة القادمة]", "00 SAR")
    .replaceAll("[Amount]", "00 SAR")
    .replaceAll("[المبلغ]", "00 SAR");

  return value.trim();
}

function renderName(text: string, language: Lang, user: User | null) {
  const name = language === "AR" ? user?.nameAr || "الفريق" : user?.nameEn || "Team";

  return cleanScriptText(text, language)
    .replaceAll("{{employeeName}}", name)
    .replaceAll("(اسم الموظف)", name)
    .replaceAll("[اسم الموظف]", name)
    .replaceAll("(Agent Name)", name)
    .replaceAll("[Agent Name]", name);
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

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [country, setCountry] = useState<Country>("KSA");
  const [language, setLanguage] = useState<Lang>("AR");
  const [section, setSection] = useState<Section>("quick");
  const [category, setCategory] = useState("General");
  const [selectedId, setSelectedId] = useState("");
  const [editorText, setEditorText] = useState("");
  const [quickNoteText, setQuickNoteText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((r) => r.json());

      if (!me.user) {
        router.push("/login");
        return;
      }

      setUser(me.user);

      const data = await fetch("/api/scripts").then((r) => r.json());
      setScripts(data.scripts || []);
    }

    load();
  }, [router]);

  const categories = useMemo(() => {
    const visible = scripts.filter(
      (script) =>
        script.active &&
        script.category !== "Quick Scripts" &&
        (script.country === "ALL" || script.country === country) &&
        script.language === language
    );

    return Array.from(new Set(visible.map((script) => script.category))).sort();
  }, [scripts, country, language]);

  const filteredScripts = useMemo(() => {
    return scripts.filter(
      (script) =>
        script.active &&
        script.category !== "Quick Scripts" &&
        (script.country === "ALL" || script.country === country) &&
        script.language === language &&
        script.category === category
    );
  }, [scripts, country, language, category]);

  const quickScripts = useMemo(() => {
    return scripts.filter(
      (script) =>
        script.active &&
        script.category === "Quick Scripts" &&
        (script.country === "ALL" || script.country === country) &&
        script.language === language
    );
  }, [scripts, country, language]);

  const quickStickyText = useMemo(() => {
    return quickScripts
      .map((script) => `${script.title}\n${renderName(script.body, script.language, user)}`)
      .join("\n\n━━━━━━━━━━━━━━━━━━━━\n\n");
  }, [quickScripts, user]);

  useEffect(() => {
    if (!categories.includes(category) && categories[0]) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  useEffect(() => {
    setQuickNoteText(quickStickyText);
  }, [quickStickyText]);

  useEffect(() => {
    const first = filteredScripts[0];

    if (first && !filteredScripts.some((script) => script.id === selectedId)) {
      setSelectedId(first.id);
      setEditorText(renderName(first.body, first.language, user));
    }

    if (!first) {
      setSelectedId("");
      setEditorText("");
    }
  }, [filteredScripts, selectedId, user]);

  function selectScript(script: Script) {
    setSelectedId(script.id);
    setEditorText(renderName(script.body, script.language, user));
  }

  async function copyEditorText() {
    await navigator.clipboard.writeText(editorText);
    setMessage("Copied");
    setTimeout(() => setMessage(""), 1200);
  }

  async function copyQuickText() {
    await navigator.clipboard.writeText(quickNoteText);
    setMessage("Copied");
    setTimeout(() => setMessage(""), 1200);
  }

  async function spellcheck() {
    const res = await fetch("/api/ai/spellcheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editorText, language })
    });

    const data = await res.json();

    if (res.ok) {
      setEditorText(data.text);
    } else {
      setMessage(data.error || "Spellcheck failed");
      setTimeout(() => setMessage(""), 1600);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">PureGym Hub</div>
        <div className="subbrand">Scripts • AI • Calculations</div>

        <button className={`nav-button ${section === "quick" ? "active" : ""}`} onClick={() => setSection("quick")}>
          Quick Sticky Note
        </button>

        <button className={`nav-button ${section === "scripts" ? "active" : ""}`} onClick={() => setSection("scripts")}>
          Scripts Dashboard
        </button>

        <button className={`nav-button ${section === "chatbot" ? "active" : ""}`} onClick={() => setSection("chatbot")}>
          AI Chatbot
        </button>

        <button className={`nav-button ${section === "calculator" ? "active" : ""}`} onClick={() => setSection("calculator")}>
          Calculation Tool
        </button>

        {user?.role === "ADMIN" && (
          <button className={`nav-button ${section === "admin" ? "active" : ""}`} onClick={() => setSection("admin")}>
            Admin Editor
          </button>
        )}
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1 style={{ margin: 0 }}>Welcome, {language === "AR" ? user?.nameAr : user?.nameEn}</h1>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
              {user?.email} • {user?.role}
            </p>
          </div>

          <div className="toolbar">
            <button className={`pill ${country === "KSA" ? "active" : ""}`} onClick={() => setCountry("KSA")}>
              KSA
            </button>
            <button className={`pill ${country === "UAE" ? "active" : ""}`} onClick={() => setCountry("UAE")}>
              UAE
            </button>
            <button className={`pill ${language === "AR" ? "active" : ""}`} onClick={() => setLanguage("AR")}>
              Arabic
            </button>
            <button className={`pill ${language === "EN" ? "active" : ""}`} onClick={() => setLanguage("EN")}>
              English
            </button>
            <button className="btn secondary small" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {section === "quick" && (
          <div className="card">
            <div className="toolbar" style={{ justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0 }}>Quick Sticky Note</h2>
                <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
                  {country} • {language === "AR" ? "Arabic" : "English"}
                </p>
              </div>

              <div className="toolbar">
                <button className="btn ghost small" onClick={() => setQuickNoteText(quickStickyText)}>
                  Reset
                </button>
                <button className="btn small" onClick={copyQuickText}>
                  Copy All
                </button>
              </div>
            </div>

            {message && <p className="success">{message}</p>}

            <textarea
              className="textarea"
              dir={language === "AR" ? "rtl" : "ltr"}
              value={quickNoteText}
              onChange={(event) => setQuickNoteText(event.target.value)}
              style={{ minHeight: 620 }}
            />
          </div>
        )}

        {section === "scripts" && (
          <div className="grid two">
            <div className="card">
              <h2>Categories</h2>

              <div className="pills" style={{ marginBottom: 16 }}>
                {categories.map((item) => (
                  <button key={item} className={`pill ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>
                    {item}
                  </button>
                ))}
              </div>

              <div className="script-list">
                {filteredScripts.map((script) => (
                  <button
                    key={script.id}
                    className={`script-item ${selectedId === script.id ? "active" : ""}`}
                    onClick={() => selectScript(script)}
                  >
                    <div className="script-title">{script.title}</div>
                    <div className="script-meta">
                      {script.category} • {script.country} • {script.language}
                    </div>
                  </button>
                ))}

                {!filteredScripts.length && <p style={{ color: "var(--muted)" }}>No scripts found in this category.</p>}
              </div>
            </div>

            <div className="card">
              <div className="toolbar" style={{ justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>Script Box</h2>
                <div className="toolbar">
                  <button className="btn ghost small" onClick={spellcheck} disabled={!editorText}>
                    تدقيق إملائي
                  </button>
                  <button className="btn small" onClick={copyEditorText} disabled={!editorText}>
                    Copy
                  </button>
                </div>
              </div>

              {message && <p className="success">{message}</p>}

              <textarea
                className="textarea"
                dir={language === "AR" ? "rtl" : "ltr"}
                value={editorText}
                onChange={(event) => setEditorText(event.target.value)}
              />
            </div>
          </div>
        )}

        {section === "chatbot" && <Chatbot country={country} language={language} />}
        {section === "calculator" && <Calculator country={country} />}
        {section === "admin" && user?.role === "ADMIN" && <Admin scripts={scripts} setScripts={setScripts} />}
      </main>
    </div>
  );
}

function Chatbot({ country, language }: { country: Country; language: Lang }) {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    setAnswer("");

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, country, language })
    });

    const data = await res.json();

    setAnswer(res.ok ? data.answer : data.error || "AI failed");
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="toolbar" style={{ justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0 }}>AI Support Chatbot</h2>
          <p style={{ color: "var(--muted)" }}>
            Current style: {country} • {language === "AR" ? "Arabic" : "English"}
          </p>
        </div>

        <button className="btn" onClick={ask} disabled={loading || !input.trim()}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      <div className="field">
        <label>Ask anything or paste a draft script</label>
        <textarea
          className="textarea"
          dir={language === "AR" ? "rtl" : "ltr"}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="اكتب سؤالك هنا..."
        />
      </div>

      <div className="chat-box" dir={language === "AR" ? "rtl" : "ltr"}>
        {answer || "AI answer will appear here."}
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
  const days = daysBetween(values.transferDate || currentDate, nextDate || newDate);
  const priceDiff = ((next - current) / 31) * Math.max(days, 0);
  const nextPayment = next + priceDiff;
  const pifDays = next > current ? (next - current) / ((next / months) / 31) : 0;
  const deductionDiff = daysBetween(currentDate, newDate);
  const changedPayment = membershipPrice + (membershipPrice / 31) * deductionDiff;

  return (
    <div className="card">
      <h2>Calculation Tool</h2>

      <div className="pills" style={{ marginBottom: 18 }}>
        <button className={`pill ${tool === "monthly-to-pif" ? "active" : ""}`} onClick={() => setTool("monthly-to-pif")}>
          Monthly to PIF
        </button>
        <button className={`pill ${tool === "home-monthly" ? "active" : ""}`} onClick={() => setTool("home-monthly")}>
          Home Gym Monthly
        </button>
        <button className={`pill ${tool === "home-pif" ? "active" : ""}`} onClick={() => setTool("home-pif")}>
          Home Gym PIF
        </button>
        <button className={`pill ${tool === "upgrade" ? "active" : ""}`} onClick={() => setTool("upgrade")}>
          Upgrade
        </button>
        <button className={`pill ${tool === "deduction" ? "active" : ""}`} onClick={() => setTool("deduction")}>
          Deduction Date
        </button>
        <button className={`pill ${tool === "discount" ? "active" : ""}`} onClick={() => setTool("discount")}>
          Discount
        </button>
      </div>

      {tool === "monthly-to-pif" && <MonthlyToPif values={values} set={set} country={country} />}

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

      {tool === "home-pif" && <PifTransfer values={values} set={set} country={country} pifDays={pifDays} />}
      {tool === "deduction" && <DeductionDate values={values} set={set} country={country} days={deductionDiff} result={changedPayment} />}
      {tool === "discount" && <Discount values={values} set={set} country={country} />}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" type="number" step="0.01" value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" type="date" value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function MonthlyToPif({ values, set, country }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country }) {
  const monthlyPrice = Number(values.monthlyPrice || 0);
  const start = values.startDate || "";
  const end = values.endDate || "";
  const totalPif = Number(values.totalPif || 0);
  const perDay = monthlyPrice / 31;
  const usedDays = Math.max(daysBetween(start, end) + 1, 0);
  const usedAmount = perDay * usedDays;
  const remaining = totalPif - usedAmount;

  return (
    <div className="grid two">
      <div>
        <NumberField label="Monthly price" value={values.monthlyPrice} onChange={(value) => set("monthlyPrice", value)} />
        <NumberField label="PIF total price" value={values.totalPif} onChange={(value) => set("totalPif", value)} />
        <DateField label="Date of transfer" value={start} onChange={(value) => set("startDate", value)} />
        <DateField label="One day before next deduction date" value={end} onChange={(value) => set("endDate", value)} />
      </div>

      <div className="calc-result">
        <h3>Result</h3>
        <p>
          Price per day: <b>{money(perDay, country)}</b>
        </p>
        <p>
          Days used: <b>{usedDays}</b>
        </p>
        <p>
          Used amount: <b>{money(usedAmount, country)}</b>
        </p>
        <p>
          Remaining PIF amount: <b>{money(remaining, country)}</b>
        </p>
      </div>
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
  days
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
    <div className="grid two">
      <div>
        <h3>{label}</h3>
        <NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} />
        <NumberField label="New price" value={values.next} onChange={(value) => set("next", value)} />
        <DateField label="Date of transfer" value={values.transferDate} onChange={(value) => set("transferDate", value)} />
        <DateField label="One day before next deduction date" value={values.nextDate} onChange={(value) => set("nextDate", value)} />
      </div>

      <div className="calc-result">
        <h3>Result</h3>
        <p>
          Days: <b>{Math.max(days, 0)}</b>
        </p>
        <p>
          Price difference: <b>{money(priceDiff, country)}</b>
        </p>
        <p>
          Next payment amount: <b>{money(nextPayment, country)}</b>
        </p>
      </div>
    </div>
  );
}

function PifTransfer({ values, set, country, pifDays }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; pifDays: number }) {
  return (
    <div className="grid two">
      <div>
        <NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} />
        <NumberField label="New price" value={values.next} onChange={(value) => set("next", value)} />
        <NumberField label="Number of months" value={values.months} onChange={(value) => set("months", value)} />
      </div>

      <div className="calc-result">
        <h3>Result</h3>
        <p>
          Price difference: <b>{money(Number(values.next || 0) - Number(values.current || 0), country)}</b>
        </p>
        <p>
          Days to be deducted: <b>{Math.max(pifDays, 0).toFixed(1)}</b>
        </p>
        <p>Note: If member transfers from higher price gym to lower price gym, no days are added.</p>
      </div>
    </div>
  );
}

function DeductionDate({
  values,
  set,
  country,
  days,
  result
}: {
  values: Record<string, string>;
  set: (name: string, value: string) => void;
  country: Country;
  days: number;
  result: number;
}) {
  return (
    <div className="grid two">
      <div>
        <DateField label="Current deduction date" value={values.currentDate} onChange={(value) => set("currentDate", value)} />
        <DateField label="New deduction date" value={values.newDate} onChange={(value) => set("newDate", value)} />
        <NumberField label="Membership price" value={values.membershipPrice} onChange={(value) => set("membershipPrice", value)} />
      </div>

      <div className="calc-result">
        <h3>Result</h3>
        <p>
          Days difference: <b>{days}</b>
        </p>
        <p>
          Next payment amount: <b>{money(result, country)}</b>
        </p>
        <p>If deduction date is moved further, payment increases. If moved back, payment decreases.</p>
      </div>
    </div>
  );
}

function Discount({ values, set, country }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country }) {
  const price = Number(values.current || 0);

  return (
    <div className="grid two">
      <div>
        <NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} />
      </div>

      <div className="calc-result">
        <h3>Result</h3>
        <p>
          After 25% discount: <b>{money(price * 0.75, country)}</b>
        </p>
        <p>
          After 20% discount: <b>{money(price * 0.8, country)}</b>
        </p>
        <p>Only monthly members who did not join on discounted price are eligible.</p>
      </div>
    </div>
  );
}

function Admin({ scripts, setScripts }: { scripts: Script[]; setScripts: (scripts: Script[]) => void }) {
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("");
  const [newScript, setNewScript] = useState({
    title: "",
    category: "General",
    country: "KSA" as Script["country"],
    language: "AR" as Script["language"],
    body: ""
  });

  const activeScripts = useMemo(() => {
    return scripts.filter((script) => script.active !== false);
  }, [scripts]);

  const categories = useMemo(() => {
    const items = Array.from(new Set(activeScripts.map((script) => script.category))).filter(Boolean).sort();
    return items.length ? items : ["General"];
  }, [activeScripts]);

  const selected = useMemo(() => {
    return activeScripts.find((script) => script.id === selectedId) || activeScripts[0] || null;
  }, [activeScripts, selectedId]);

  useEffect(() => {
    if (!selectedId && activeScripts[0]) {
      setSelectedId(activeScripts[0].id);
    }
  }, [activeScripts, selectedId]);

  function updateSelected(patch: Partial<Script>) {
    if (!selected) return;

    setScripts(
      scripts.map((script) => {
        if (script.id !== selected.id) return script;
        return { ...script, ...patch };
      })
    );
  }

  async function createScript() {
    setStatus("");

    if (!newScript.title.trim() || !newScript.body.trim()) {
      setStatus("Please add title and body.");
      return;
    }

    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newScript)
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || "Create failed");
      return;
    }

    const createdScript = data.script as Script;
    setScripts([createdScript, ...scripts]);
    setSelectedId(createdScript.id);
    setNewScript({
      title: "",
      category: newScript.category,
      country: newScript.country,
      language: newScript.language,
      body: ""
    });
    setStatus("Script added for everyone.");
  }

  async function save() {
    if (!selected) return;

    if (selected.id.startsWith("seed-")) {
      setStatus("Run npm run db:seed first, then edit DB scripts.");
      return;
    }

    const res = await fetch(`/api/scripts/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selected.title,
        category: selected.category,
        country: selected.country,
        language: selected.language,
        body: selected.body,
        active: selected.active
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || "Save failed");
      return;
    }

    const updatedScript = data.script as Script;
    setScripts(scripts.map((script) => (script.id === updatedScript.id ? updatedScript : script)));
    setSelectedId(updatedScript.id);
    setStatus("Saved for all users.");
  }

  async function deleteScript(scriptId: string) {
    const target = scripts.find((script) => script.id === scriptId);
    const ok = window.confirm(`Delete this script?\n\n${target?.title || ""}`);

    if (!ok) return;

    const res = await fetch(`/api/scripts/${scriptId}`, {
      method: "DELETE"
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus(data.error || "Delete failed");
      return;
    }

    const nextScripts = scripts.filter((script) => script.id !== scriptId);
    setScripts(nextScripts);
    setSelectedId(nextScripts[0]?.id || "");
    setStatus("Script deleted for everyone.");
  }

  return (
    <div className="admin-clean-layout">
      <div className="card admin-add-card">
        <div className="section-head compact">
          <div>
            <h2>Add script</h2>
            <p>Create a new script and publish it to all users.</p>
          </div>
        </div>

        {status && <p className={status.includes("failed") || status.includes("Please") ? "error" : "success"}>{status}</p>}

        <div className="admin-add-grid">
          <div className="field">
            <label>Title</label>
            <input
              className="input"
              value={newScript.title}
              onChange={(event) => setNewScript({ ...newScript, title: event.target.value })}
              placeholder="Example: Payment link confirmation"
            />
          </div>

          <div className="field">
            <label>Category</label>
            <input
              className="input"
              value={newScript.category}
              onChange={(event) => setNewScript({ ...newScript, category: event.target.value })}
              list="admin-category-options"
              placeholder="Example: Payment & Billing"
            />
            <datalist id="admin-category-options">
              {categories.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="field">
            <label>Country</label>
            <select
              className="select"
              value={newScript.country}
              onChange={(event) => setNewScript({ ...newScript, country: event.target.value as Script["country"] })}
            >
              <option value="ALL">ALL</option>
              <option value="KSA">KSA</option>
              <option value="UAE">UAE</option>
            </select>
          </div>

          <div className="field">
            <label>Language</label>
            <select
              className="select"
              value={newScript.language}
              onChange={(event) => setNewScript({ ...newScript, language: event.target.value as Script["language"] })}
            >
              <option value="AR">AR</option>
              <option value="EN">EN</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Body</label>
          <textarea
            className="textarea admin-add-body"
            value={newScript.body}
            onChange={(event) => setNewScript({ ...newScript, body: event.target.value })}
            placeholder="Write the script here..."
          />
        </div>

        <button className="btn full" onClick={createScript}>
          Add script for everyone
        </button>
      </div>

      <div className="card admin-list-card">
        <div className="section-head compact">
          <div>
            <h2>All scripts</h2>
            <p>Select a script to edit or delete.</p>
          </div>
        </div>

        <div className="script-list admin-script-list">
          {activeScripts.map((script) => (
            <button
              key={script.id}
              className={`script-item ${selected?.id === script.id ? "active" : ""}`}
              onClick={() => setSelectedId(script.id)}
            >
              <div className="script-title">{script.title}</div>
              <div className="script-meta">
                {script.category} • {script.country} • {script.language}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card admin-editor admin-edit-card">
        <div className="section-head compact">
          <div>
            <h2>Admin Script Editor</h2>
            <p>Update the selected script for all users.</p>
          </div>

          {selected && (
            <button className="btn danger small" onClick={() => deleteScript(selected.id)}>
              Delete script
            </button>
          )}
        </div>

        {!selected && <p className="error">No script selected.</p>}

        {selected && (
          <>
            <div className="field">
              <label>Title</label>
              <input className="input" value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} />
            </div>

            <div className="admin-edit-grid">
              <div className="field">
                <label>Category</label>
                <input className="input" value={selected.category} onChange={(event) => updateSelected({ category: event.target.value })} list="admin-category-options-edit" />
                <datalist id="admin-category-options-edit">
                  {categories.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label>Country</label>
                <select className="select" value={selected.country} onChange={(event) => updateSelected({ country: event.target.value as Script["country"] })}>
                  <option value="ALL">ALL</option>
                  <option value="KSA">KSA</option>
                  <option value="UAE">UAE</option>
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
              <textarea className="textarea admin-edit-body" value={selected.body} onChange={(event) => updateSelected({ body: event.target.value })} />
            </div>

            <button className="btn full" onClick={save}>
              Save update for everyone
            </button>
          </>
        )}
      </div>
    </div>
  );
}
