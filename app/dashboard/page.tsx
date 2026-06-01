"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
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

type AiRole = "USER" | "ASSISTANT";

type AiMessage = {
  id: string;
  role: AiRole;
  content: string;
  imageDataUrl?: string | null;
  createdAt?: string;
};

type AiSession = {
  id: string;
  title: string;
  updatedAt?: string;
  _count?: { messages: number };
  messages?: AiMessage[];
};

type KnowledgeItem = {
  id: string;
  title: string;
  body: string;
  country: "ALL" | "KSA" | "UAE";
  language: "AR" | "EN";
  sourceType: string;
  sourceUrl?: string | null;
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
          <div className="brand-mark"><img src="/pg-hub-mark.svg" alt="PureGym Hub" /></div>
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
            <p>{section === "chatbot" ? "General PureGym AI • Arabic / English auto-detect" : `${country} • ${language === "AR" ? "Arabic" : "English"}`}</p>
          </div>

          {section !== "chatbot" && (
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
          )}
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

        {section === "chatbot" && <Chatbot />}
        {section === "calculator" && <Calculator country={country} />}
        {section === "admin" && user?.role === "ADMIN" && <Admin scripts={scripts} setScripts={setScripts} />}
      </main>
    </div>
  );
}

function Chatbot() {
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function loadSessions() {
    const data = await fetch("/api/ai/history").then((res) => res.json()).catch(() => ({ sessions: [] }));
    setSessions(data.sessions || []);
  }

  async function openSession(sessionId: string) {
    const data = await fetch(`/api/ai/history?sessionId=${encodeURIComponent(sessionId)}`).then((res) => res.json());
    if (data.session) {
      setActiveSessionId(data.session.id);
      setMessages(data.session.messages || []);
    }
  }

  function newChat() {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setImageDataUrl(null);
    setImageName("");
    setStatus("");
  }

  async function deleteSession(sessionId: string) {
    const ok = confirm("Delete this chat?");
    if (!ok) return;

    await fetch("/api/ai/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });

    if (activeSessionId === sessionId) newChat();
    await loadSessions();
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Please attach an image file only.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setStatus("Image is too large. Please use an image under 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result || ""));
      setImageName(file.name);
      setStatus("");
    };
    reader.readAsDataURL(file);
  }

  async function ask() {
    const question = input.trim();
    if (!question && !imageDataUrl) return;

    const tempUserMessage: AiMessage = {
      id: `temp-${Date.now()}`,
      role: "USER",
      content: question || "Please analyze the attached image.",
      imageDataUrl
    };

    setMessages((current) => [...current, tempUserMessage]);
    setInput("");
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: tempUserMessage.content, sessionId: activeSessionId, imageDataUrl })
      });

      const data = await res.json().catch(() => ({ error: "AI route returned a non-JSON response. Check terminal logs." }));

      if (!res.ok) {
        setMessages((current) => [...current, { id: `err-${Date.now()}`, role: "ASSISTANT", content: data.error || "AI failed" }]);
        return;
      }

      setActiveSessionId(data.sessionId);
      setMessages((current) => [
        ...current.filter((msg) => msg.id !== tempUserMessage.id),
        data.userMessage || tempUserMessage,
        data.assistantMessage || { id: `ai-${Date.now()}`, role: "ASSISTANT", content: data.answer }
      ]);
      setImageDataUrl(null);
      setImageName("");
      await loadSessions();
    } catch (error) {
      setMessages((current) => [...current, { id: `err-${Date.now()}`, role: "ASSISTANT", content: error instanceof Error ? error.message : "AI failed" }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask();
    }
  }

  return (
    <div className="ai-chat-layout premium-ai">
      <aside className="card chat-history-panel">
        <div className="section-head compact">
          <div>
            <h2>Chats</h2>
            <p>Your private conversations only. AI learns globally without exposing chats.</p>
          </div>
          <button className="btn small" onClick={newChat}>New</button>
        </div>

        <div className="chat-session-list">
          {sessions.length === 0 && <p className="muted-text">No chats yet.</p>}
          {sessions.map((session) => (
            <div key={session.id} className={`chat-session-card ${activeSessionId === session.id ? "active" : ""}`}>
              <button onClick={() => openSession(session.id)}>
                <b>{session.title}</b>
                <span>{session._count?.messages || 0} messages</span>
              </button>
              <button className="chat-delete-button" onClick={() => deleteSession(session.id)} aria-label="Delete chat">×</button>
            </div>
          ))}
        </div>
      </aside>

      <section className="card chatgpt-shell premium-chat-shell">
        <div className="section-head compact">
          <div>
            <h2>PureGym AI Assistant</h2>
            <p>General mode: detects Arabic/English and KSA/UAE from your question.</p>
          </div>
          <button className="btn ghost small" onClick={newChat}>Reset</button>
        </div>

        <div className="messages-panel premium-messages">
          {messages.length === 0 && (
            <div className="message-row assistant">
              <div className="message-bubble">
                أهلًا! اسألني عن سياسات PureGym، السكربتات، الشروط، روابط الدفع، QR، الفروع، أو ارفق صورة واطلب مني تحليلها.
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.role === "USER" ? "user" : "assistant"}`}>
              <div className="message-bubble">
                {msg.imageDataUrl && <img className="chat-image" src={msg.imageDataUrl} alt="Attachment" />}
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble typing">Thinking…</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {imageDataUrl && (
          <div className="attachment-preview">
            <img src={imageDataUrl} alt="Preview" />
            <div>
              <b>{imageName || "Attached image"}</b>
              <span>Will be sent with your next message.</span>
            </div>
            <button className="chat-delete-button" onClick={() => { setImageDataUrl(null); setImageName(""); }}>×</button>
          </div>
        )}

        {status && <p className="error">{status}</p>}

        <div className="chat-input-bar enhanced premium-input-bar">
          <label className="attach-button" title="Attach image">
            📎
            <input type="file" accept="image/*" hidden onChange={handleImage} />
          </label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="اكتب سؤالك أو ارفق صورة… / Ask anything about PureGym…"
            rows={2}
          />
          <button className="send-button" onClick={ask} disabled={loading || (!input.trim() && !imageDataUrl)}>➤</button>
        </div>
      </section>
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
  const [adminTab, setAdminTab] = useState<"scripts" | "trainer">("scripts");
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

  function update(patch: Partial<Script>) {
    if (!selected) return;
    setScripts(scripts.map((script) => (script.id === selected.id ? { ...script, ...patch } : script)));
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

  return (
    <div className="admin-master">
      <div className="card admin-tabs-card">
        <div className="section-head compact">
          <div>
            <h2>Admin Center</h2>
            <p>Manage scripts and train the PureGym AI knowledge base.</p>
          </div>
          <div className="toolbar">
            <button className={`toggle ${adminTab === "scripts" ? "active" : ""}`} onClick={() => setAdminTab("scripts")}>Scripts</button>
            <button className={`toggle ${adminTab === "trainer" ? "active" : ""}`} onClick={() => setAdminTab("trainer")}>AI Chatbot Trainer</button>
          </div>
        </div>
      </div>

      {adminTab === "trainer" && <AiTrainer />}

      {adminTab === "scripts" && selected && (
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
      )}
    </div>
  );
}

function AiTrainer() {
  const emptyForm = { title: "", body: "", country: "ALL" as "ALL" | "KSA" | "UAE", language: "EN" as "AR" | "EN", sourceType: "manual", sourceUrl: "" };
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const data = await fetch("/api/ai/trainer").then((res) => res.json()).catch(() => ({ items: [] }));
    setItems(data.items || []);
  }

  function selectItem(item: KnowledgeItem) {
    setSelectedId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      country: item.country,
      language: item.language,
      sourceType: item.sourceType,
      sourceUrl: item.sourceUrl || ""
    });
    setStatus("");
  }

  function newItem() {
    setSelectedId("");
    setForm(emptyForm);
    setStatus("");
  }

  async function saveItem() {
    const method = selectedId ? "PUT" : "POST";
    const res = await fetch("/api/ai/trainer", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: selectedId || undefined, active: true })
    });

    const data = await res.json().catch(() => ({ error: "Save failed" }));
    if (!res.ok) {
      setStatus(data.error || "Save failed");
      return;
    }

    setStatus("AI knowledge saved.");
    await loadItems();
    if (data.item?.id) setSelectedId(data.item.id);
  }

  async function deleteItem() {
    if (!selectedId) return;
    const ok = confirm("Delete this AI knowledge item?");
    if (!ok) return;

    const res = await fetch("/api/ai/trainer", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error || "Delete failed");
      return;
    }

    setStatus("Deleted.");
    newItem();
    await loadItems();
  }

  return (
    <div className="ai-trainer-layout">
      <div className="card">
        <div className="section-head compact">
          <div>
            <h2>AI Knowledge</h2>
            <p>Private trainer data. This improves AI answers for all users.</p>
          </div>
          <button className="btn small" onClick={newItem}>New</button>
        </div>
        <div className="admin-list trainer-list">
          {items.map((item) => (
            <button key={item.id} className={`script-card ${selectedId === item.id ? "active" : ""}`} onClick={() => selectItem(item)}>
              <b>{item.title}</b>
              <p>{item.country} • {item.language} • {item.sourceType}</p>
            </button>
          ))}
          {items.length === 0 && <p className="muted-text">No trainer items yet. Add policies, internal notes, links, or official terms.</p>}
        </div>
      </div>

      <div className="card admin-editor">
        <div className="section-head">
          <div>
            <h2>AI Chatbot Trainer</h2>
            <p>Add trusted PureGym knowledge only. Avoid private member data.</p>
          </div>
          <div className="toolbar">
            {selectedId && <button className="btn ghost small danger-btn" onClick={deleteItem}>Delete</button>}
            <button className="btn" onClick={saveItem}>Save knowledge</button>
          </div>
        </div>

        {status && <p className={status.includes("saved") || status.includes("Deleted") ? "success" : "error"}>{status}</p>}

        <div className="field">
          <label>Title</label>
          <input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. UAE freeze policy" />
        </div>

        <div className="admin-fields">
          <div className="field">
            <label>Country</label>
            <select className="select" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value as "ALL" | "KSA" | "UAE" })}>
              <option value="ALL">ALL</option>
              <option value="KSA">KSA</option>
              <option value="UAE">UAE</option>
            </select>
          </div>
          <div className="field">
            <label>Language</label>
            <select className="select" value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value as "AR" | "EN" })}>
              <option value="AR">AR</option>
              <option value="EN">EN</option>
            </select>
          </div>
          <div className="field">
            <label>Source type</label>
            <input className="input" value={form.sourceType} onChange={(event) => setForm({ ...form, sourceType: event.target.value })} />
          </div>
        </div>

        <div className="field">
          <label>Source URL / reference</label>
          <input className="input" value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} placeholder="Official URL, policy file, internal note..." />
        </div>

        <div className="field">
          <label>Knowledge body</label>
          <textarea className="textarea admin-body" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Paste the exact policy, summary, or approved internal instruction here." />
        </div>
      </div>
    </div>
  );
}
