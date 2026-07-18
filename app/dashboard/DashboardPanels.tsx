"use client";

/* eslint-disable @next/next/no-img-element */
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

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
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  imageData?: string | null;
  imageName?: string | null;
  tone?: "error";
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

function detectUiLanguage(value: string): Lang {
  return /[\u0600-\u06FF]/.test(value) ? "AR" : "EN";
}

export function ChatbotPanel() {
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
          tone: res.ok ? undefined : "error",
        },
      ]);
      await loadSessions();
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "AI failed",
          tone: "error",
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
            <div key={index} className={`message-row ${msg.role} ${msg.tone === "error" ? "error" : ""}`}>
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
              <div className="message-bubble typing-dots" aria-label={uiLanguage === "AR" ? "جاري الرد" : "Responding"}>
                <span />
                <span />
                <span />
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

export function CalculatorPanel({ country }: { country: Country }) {
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

export function ProfilePanel({
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

export function AdminPanel({
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
    setStatus(
      isPending
        ? `Account approved for ${data.email}. Default password: ${data.password}`
        : `New generated password for ${data.email}.`,
    );
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
    if (!confirm("Delete this AI knowledge item permanently? Deactivate hides it from the AI without deleting it.")) return;
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
                Deactivate hides the selected category for everyone without deleting it.
                Delete permanently removes it and cannot be undone.
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
                answers. Active items are included in the chatbot knowledge base
                for all users.
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
