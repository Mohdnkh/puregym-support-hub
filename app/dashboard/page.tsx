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

const CATEGORY_ORDER = [
  "Cancellation & Retention",
  "Freeze",
  "Transfers & Refunds",
  "Payment & Billing",
  "App / Login / Password",
  "Friend / Bring a Friend",
  "Offers, Prices & PT",
  "Membership & Packages",
  "Branches, Hours & Links"
];

function applyUserName(text: string, language: Lang, user: User | null) {
  const name = language === "AR" ? user?.nameAr || "الفريق" : user?.nameEn || "Team";

  return String(text || "")
    .replaceAll("{{employeeName}}", name)
    .replaceAll("محمد", name)
    .replaceAll("Mohammed", name)
    .replaceAll("example@gmail.com", "example@email.com")
    .replaceAll("00/00/0000", "00-00-2020")
    .replaceAll("__/__/____", "00-00-2020");
}

function preview(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 140 ? clean.slice(0, 140) + "..." : clean;
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
  const [category, setCategory] = useState("Cancellation & Retention");
  const [selectedId, setSelectedId] = useState("");
  const [editorText, setEditorText] = useState("");
  const [quickNoteText, setQuickNoteText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((res) => res.json());

      if (!me.user) {
        router.push("/login");
        return;
      }

      setUser(me.user);

      const data = await fetch("/api/scripts").then((res) => res.json());
      setScripts(data.scripts || []);
    }

    load();
  }, [router]);

  const visibleScripts = useMemo(() => {
    return scripts.filter(
      (script) =>
        script.active &&
        (script.country === "ALL" || script.country === country) &&
        script.language === language
    );
  }, [scripts, country, language]);

  const categories = useMemo(() => {
    const set = new Set(
      visibleScripts
        .filter((script) => script.category !== "Quick Scripts")
        .map((script) => script.category)
    );

    return CATEGORY_ORDER.filter((item) => set.has(item)).concat(
      Array.from(set)
        .filter((item) => !CATEGORY_ORDER.includes(item))
        .sort()
    );
  }, [visibleScripts]);

  const quickScripts = useMemo(() => {
    return visibleScripts.filter((script) => script.category === "Quick Scripts");
  }, [visibleScripts]);

  const quickStickyText = useMemo(() => {
    return quickScripts
      .map((script) => `${script.title}\n${applyUserName(script.body, script.language, user)}`)
      .join("\n\n━━━━━━━━━━━━━━━━━━━━\n\n");
  }, [quickScripts, user]);

  const filteredScripts = useMemo(() => {
    return visibleScripts.filter((script) => script.category === category);
  }, [visibleScripts, category]);

  const selected = useMemo(() => {
    return filteredScripts.find((script) => script.id === selectedId) || filteredScripts[0] || null;
  }, [filteredScripts, selectedId]);

  useEffect(() => {
    if (!categories.includes(category) && categories[0]) {
      setCategory(categories[0]);
    }
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
    setTimeout(() => setMessage(""), 1300);
  }

  function selectScript(script: Script) {
    setSelectedId(script.id);
    setEditorText(applyUserName(script.body, script.language, user));
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

      const data = await res.json().catch(() => ({ error: "AI route returned a non-JSON response. Check terminal logs." }));

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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">PG</div>
          <div>
            <div className="brand">PureGym Hub</div>
            <div className="subbrand">Support scripts</div>
          </div>
        </div>

        <button className={`nav-button ${section === "quick" ? "active" : ""}`} onClick={() => setSection("quick")}>
          Quick Scripts
        </button>

        <button className={`nav-button ${section === "scripts" ? "active" : ""}`} onClick={() => setSection("scripts")}>
          Script Library
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

        <div className="sidebar-user">
          <b>{language === "AR" ? user?.nameAr : user?.nameEn}</b>
          <span>{user?.email}</span>
          <button className="btn secondary small full" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>{section === "quick" ? "Quick Scripts" : section === "scripts" ? "Script Library" : section === "chatbot" ? "AI Chatbot" : section === "calculator" ? "Calculation Tool" : "Admin Editor"}</h1>
            <p>{country} • {language === "AR" ? "Arabic" : "English"}</p>
          </div>

          <div className="toolbar">
            <button className={`toggle ksa ${country === "KSA" ? "active" : ""}`} onClick={() => setCountry("KSA")}>
              💚 KSA
            </button>
            <button className={`toggle uae ${country === "UAE" ? "active" : ""}`} onClick={() => setCountry("UAE")}>
              💙 UAE
            </button>
            <button className={`toggle ${language === "AR" ? "active" : ""}`} onClick={() => setLanguage("AR")}>
              Arabic
            </button>
            <button className={`toggle ${language === "EN" ? "active" : ""}`} onClick={() => setLanguage("EN")}>
              English
            </button>
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
                  <button className="btn ghost small" onClick={() => setQuickNoteText(quickStickyText)}>
                    Reset
                  </button>
                  <button className="btn small" onClick={() => copyText(quickNoteText)}>
                    Copy All
                  </button>
                </div>
              </div>

              <textarea
                className="textarea sticky-note"
                dir={language === "AR" ? "rtl" : "ltr"}
                value={quickNoteText}
                onChange={(event) => setQuickNoteText(event.target.value)}
              />
            </div>

            <div className="quick-cards">
              {quickScripts.map((script) => {
                const body = applyUserName(script.body, script.language, user);
                return (
                  <button className="mini-script-card" key={script.id} onClick={() => copyText(body)}>
                    <b>{script.title}</b>
                    <span>{preview(body)}</span>
                  </button>
                );
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
                  return (
                    <button key={item} className={`category-card ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>
                      <b>{item}</b>
                      <span>{count} scripts</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="script-results">
              <div className="section-head">
                <div>
                  <h2>{category}</h2>
                  <p>{filteredScripts.length} scripts available</p>
                </div>
              </div>

              <div className="script-card-grid">
                {filteredScripts.map((script) => {
                  const body = applyUserName(script.body, script.language, user);
                  return (
                    <button key={script.id} className={`script-card ${selectedId === script.id ? "active" : ""}`} onClick={() => selectScript(script)}>
                      <div className="script-card-top">
                        <b>{script.title}</b>
                        <span>{script.country}</span>
                      </div>
                      <p>{preview(body)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="script-box card">
              <div className="section-head compact">
                <div>
                  <h2>Script Box</h2>
                  <p>{selected?.title || "Select a script"}</p>
                </div>
                <div className="toolbar">
                  <button className="btn ghost small" onClick={spellcheck} disabled={!editorText}>
                    تدقيق
                  </button>
                  <button className="btn small" onClick={() => copyText(editorText)} disabled={!editorText}>
                    Copy
                  </button>
                </div>
              </div>

              <textarea
                className="textarea script-editor"
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

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, country, language })
      });

      const data = await res.json().catch(() => ({ error: "AI route returned a non-JSON response. Check terminal logs." }));
      setAnswer(res.ok ? data.answer : data.error || "AI failed");
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "AI failed");
    } finally {
      setLoading(false);
    }
  }

  async function checkHealth() {
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ai/health");
      const data = await res.json().catch(() => ({ error: "Health route returned a non-JSON response. Check terminal logs." }));
      setAnswer(JSON.stringify(data, null, 2));
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "AI health check failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card ai-card">
      <div className="section-head">
        <div>
          <h2>AI Support Chatbot</h2>
          <p>{country} • {language === "AR" ? "Arabic" : "English"}</p>
        </div>
        <div className="toolbar">
          <button className="btn secondary small" onClick={checkHealth} disabled={loading}>
            Check AI
          </button>
          <button className="btn" onClick={ask} disabled={loading || !input.trim()}>
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </div>

      <textarea
        className="textarea"
        dir={language === "AR" ? "rtl" : "ltr"}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="اكتب سؤالك أو السكربت هنا..."
      />

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
      <div className="section-head">
        <div>
          <h2>Calculation Tool</h2>
          <p>Simple tools for common billing cases.</p>
        </div>
      </div>

      <div className="tool-tabs">
        <button className={`toggle ${tool === "monthly-to-pif" ? "active" : ""}`} onClick={() => setTool("monthly-to-pif")}>Monthly to PIF</button>
        <button className={`toggle ${tool === "home-monthly" ? "active" : ""}`} onClick={() => setTool("home-monthly")}>Home Gym Monthly</button>
        <button className={`toggle ${tool === "home-pif" ? "active" : ""}`} onClick={() => setTool("home-pif")}>Home Gym PIF</button>
        <button className={`toggle ${tool === "upgrade" ? "active" : ""}`} onClick={() => setTool("upgrade")}>Upgrade</button>
        <button className={`toggle ${tool === "deduction" ? "active" : ""}`} onClick={() => setTool("deduction")}>Deduction Date</button>
        <button className={`toggle ${tool === "discount" ? "active" : ""}`} onClick={() => setTool("discount")}>Discount</button>
      </div>

      {tool === "monthly-to-pif" && <MonthlyToPif values={values} set={set} country={country} />}
      {(tool === "home-monthly" || tool === "upgrade") && (
        <MonthlyTransfer values={values} set={set} country={country} label={tool === "upgrade" ? "Upgrade" : "Home Gym Transfer Monthly"} priceDiff={priceDiff} nextPayment={nextPayment} days={days} />
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
    <div className="calculator-grid">
      <div>
        <NumberField label="Monthly price" value={values.monthlyPrice} onChange={(value) => set("monthlyPrice", value)} />
        <NumberField label="PIF total price" value={values.totalPif} onChange={(value) => set("totalPif", value)} />
        <DateField label="Date of transfer" value={start} onChange={(value) => set("startDate", value)} />
        <DateField label="One day before next deduction date" value={end} onChange={(value) => set("endDate", value)} />
      </div>
      <ResultBox items={[["Price per day", money(perDay, country)], ["Days used", String(usedDays)], ["Used amount", money(usedAmount, country)], ["Remaining PIF amount", money(remaining, country)]]} />
    </div>
  );
}

function MonthlyTransfer({ values, set, country, label, priceDiff, nextPayment, days }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; label: string; priceDiff: number; nextPayment: number; days: number }) {
  return (
    <div className="calculator-grid">
      <div>
        <h3>{label}</h3>
        <NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} />
        <NumberField label="New price" value={values.next} onChange={(value) => set("next", value)} />
        <DateField label="Date of transfer" value={values.transferDate} onChange={(value) => set("transferDate", value)} />
        <DateField label="One day before next deduction date" value={values.nextDate} onChange={(value) => set("nextDate", value)} />
      </div>
      <ResultBox items={[["Days", String(Math.max(days, 0))], ["Price difference", money(priceDiff, country)], ["Next payment amount", money(nextPayment, country)]]} />
    </div>
  );
}

function PifTransfer({ values, set, country, pifDays }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; pifDays: number }) {
  return (
    <div className="calculator-grid">
      <div>
        <NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} />
        <NumberField label="New price" value={values.next} onChange={(value) => set("next", value)} />
        <NumberField label="Number of months" value={values.months} onChange={(value) => set("months", value)} />
      </div>
      <ResultBox items={[["Price difference", money(Number(values.next || 0) - Number(values.current || 0), country)], ["Days to be deducted", Math.max(pifDays, 0).toFixed(1)]]} note="If member transfers from higher price gym to lower price gym, no days are added." />
    </div>
  );
}

function DeductionDate({ values, set, country, days, result }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country; days: number; result: number }) {
  return (
    <div className="calculator-grid">
      <div>
        <DateField label="Current deduction date" value={values.currentDate} onChange={(value) => set("currentDate", value)} />
        <DateField label="New deduction date" value={values.newDate} onChange={(value) => set("newDate", value)} />
        <NumberField label="Membership price" value={values.membershipPrice} onChange={(value) => set("membershipPrice", value)} />
      </div>
      <ResultBox items={[["Days difference", String(days)], ["Next payment amount", money(result, country)]]} />
    </div>
  );
}

function Discount({ values, set, country }: { values: Record<string, string>; set: (name: string, value: string) => void; country: Country }) {
  const price = Number(values.current || 0);
  return (
    <div className="calculator-grid">
      <div>
        <NumberField label="Current price" value={values.current} onChange={(value) => set("current", value)} />
      </div>
      <ResultBox items={[["After 25% discount", money(price * 0.75, country)], ["After 20% discount", money(price * 0.8, country)]]} note="Only monthly members who did not join on discounted price are eligible." />
    </div>
  );
}

function ResultBox({ items, note }: { items: [string, string][]; note?: string }) {
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

function Admin({ scripts, setScripts }: { scripts: Script[]; setScripts: (scripts: Script[]) => void }) {
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("");

  const selected = useMemo(() => {
    return scripts.find((script) => script.id === selectedId) || scripts[0] || null;
  }, [scripts, selectedId]);

  useEffect(() => {
    if (!selectedId && scripts[0]) {
      setSelectedId(scripts[0].id);
    }
  }, [scripts, selectedId]);

  if (!selected) {
    return <div className="card">No scripts available.</div>;
  }

  function update(patch: Partial<Script>) {
    setScripts(scripts.map((script) => (script.id === selected.id ? { ...script, ...patch } : script)));
  }

  async function save() {
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

  return (
    <div className="admin-layout">
      <div className="card">
        <h2>All scripts</h2>
        <div className="admin-list">
          {scripts.map((script) => (
            <button key={script.id} className={`script-card ${selected.id === script.id ? "active" : ""}`} onClick={() => setSelectedId(script.id)}>
              <b>{script.title}</b>
              <p>{script.category} • {script.country} • {script.language}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card admin-editor">
        <div className="section-head">
          <div>
            <h2>Admin Script Editor</h2>
            <p>Edit one script for everyone.</p>
          </div>
          <button className="btn" onClick={save}>Save</button>
        </div>

        {status && <p className={status.startsWith("Saved") ? "success" : "error"}>{status}</p>}

        <div className="field">
          <label>Title</label>
          <input className="input" value={selected.title} onChange={(event) => update({ title: event.target.value })} />
        </div>

        <div className="admin-fields">
          <div className="field">
            <label>Category</label>
            <input className="input" value={selected.category} onChange={(event) => update({ category: event.target.value })} />
          </div>

          <div className="field">
            <label>Country</label>
            <select className="select" value={selected.country} onChange={(event) => update({ country: event.target.value as Script["country"] })}>
              <option value="ALL">ALL</option>
              <option value="KSA">KSA</option>
              <option value="UAE">UAE</option>
            </select>
          </div>

          <div className="field">
            <label>Language</label>
            <select className="select" value={selected.language} onChange={(event) => update({ language: event.target.value as Script["language"] })}>
              <option value="AR">AR</option>
              <option value="EN">EN</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Body</label>
          <textarea className="textarea admin-body" value={selected.body} onChange={(event) => update({ body: event.target.value })} />
        </div>
      </div>
    </div>
  );
}
