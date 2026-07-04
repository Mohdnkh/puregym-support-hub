from __future__ import annotations

import html
import textwrap
import zipfile
from datetime import datetime, timezone
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PDF_PATH = DOCS / "PureGym-Support-Hub-Overview-and-Cost.pdf"
PPTX_PATH = DOCS / "PureGym-Support-Hub-Presentation.pptx"

GREEN = "#00A651"
BLUE = "#005EB8"
DARK = "#111827"
MUTED = "#4B5563"
LIGHT = "#F3F6F8"
LINE = "#D7DEE8"

UPDATED = "July 4, 2026"
MADE_BY = "Made by Mohammed Alkhandagji"

SOURCES = [
    "Vercel pricing: https://vercel.com/pricing",
    "Neon pricing: https://neon.com/pricing",
    "Groq pricing: https://groq.com/pricing",
    "Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing",
]


def ensure_docs_dir() -> None:
    DOCS.mkdir(parents=True, exist_ok=True)


def hex_color(value: str):
    return colors.HexColor(value)


def draw_wrapped(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font: str = "Helvetica",
    size: int = 10,
    leading: int = 14,
    color: str = DARK,
) -> float:
    c.setFillColor(hex_color(color))
    c.setFont(font, size)
    max_chars = max(20, int(width / (size * 0.48)))
    lines: list[str] = []
    for paragraph in text.split("\n"):
        if not paragraph.strip():
            lines.append("")
            continue
        lines.extend(textwrap.wrap(paragraph, width=max_chars, break_long_words=False))
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_header(c: canvas.Canvas, title: str, page_no: int) -> None:
    w, h = A4
    c.setFillColor(hex_color(GREEN))
    c.rect(0, h - 18, w * 0.52, 18, stroke=0, fill=1)
    c.setFillColor(hex_color(BLUE))
    c.rect(w * 0.52, h - 18, w * 0.48, 18, stroke=0, fill=1)
    c.setFillColor(hex_color(DARK))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(42, h - 42, title)
    c.setFillColor(hex_color(MUTED))
    c.setFont("Helvetica", 8)
    c.drawRightString(w - 42, h - 42, f"{UPDATED} | Page {page_no}")


def draw_footer(c: canvas.Canvas) -> None:
    w, _ = A4
    c.setStrokeColor(hex_color(LINE))
    c.line(42, 36, w - 42, 36)
    c.setFillColor(hex_color(MUTED))
    c.setFont("Helvetica", 8)
    c.drawString(42, 22, MADE_BY)
    c.drawRightString(w - 42, 22, "PureGym Support Hub")


def bullet_list(c: canvas.Canvas, items: list[str], x: float, y: float, width: float) -> float:
    for item in items:
        c.setFillColor(hex_color(GREEN if len(items) % 2 else BLUE))
        c.circle(x + 3, y + 4, 2, stroke=0, fill=1)
        y = draw_wrapped(c, item, x + 14, y, width - 14, size=9.5, leading=13, color=DARK)
        y -= 4
    return y


def section_title(c: canvas.Canvas, text: str, x: float, y: float) -> float:
    c.setFillColor(hex_color(DARK))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x, y, text)
    c.setStrokeColor(hex_color(GREEN))
    c.setLineWidth(2)
    c.line(x, y - 8, x + 80, y - 8)
    return y - 28


def generate_pdf() -> None:
    c = canvas.Canvas(str(PDF_PATH), pagesize=A4)
    w, h = A4

    # Page 1
    c.setFillColor(hex_color(GREEN))
    c.rect(0, h - 92, w * 0.58, 92, stroke=0, fill=1)
    c.setFillColor(hex_color(BLUE))
    c.rect(w * 0.58, h - 92, w * 0.42, 92, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(42, h - 58, "PureGym Support Hub")
    c.setFont("Helvetica", 11)
    c.drawString(42, h - 78, "Project overview, operating model, and cost estimate")
    c.setFillColor(hex_color(MUTED))
    c.setFont("Helvetica", 9)
    c.drawRightString(w - 42, h - 112, f"Updated {UPDATED}")

    y = h - 150
    y = section_title(c, "Executive Summary", 42, y)
    y = draw_wrapped(
        c,
        "PureGym Support Hub is an internal support workspace for KSA and UAE agents. "
        "It centralizes approved scripts, quick replies, branch references, admin control, "
        "AI assistance, and operational checks in one Vercel-hosted dashboard backed by Neon PostgreSQL.",
        42,
        y,
        w - 84,
        size=11,
        leading=16,
    )
    y -= 18
    y = section_title(c, "Latest Delivered Updates", 42, y)
    y = bullet_list(
        c,
        [
            "AI provider is no longer tied to OpenAI. Groq is the default low-cost provider, with Gemini and OpenAI kept as optional fallbacks.",
            "Ctrl+K now opens the in-app command palette when the page has focus, making script search faster than navigating categories.",
            "Fill-before-copy variables now work across scripts that contain dates, duration, membership type, amount, or member name placeholders.",
            "Smoke tests were added for the dashboard shell, admin protection, script APIs, and quick-script access rules.",
            "Documentation and cost assumptions now match the current Vercel, Neon, Groq, and Gemini setup.",
        ],
        54,
        y,
        w - 108,
    )

    y -= 10
    y = section_title(c, "Primary Capabilities", 42, y)
    cols = [
        ("Agent Workspace", ["Script Library", "Quick Scripts", "Favorites", "Branch Directory"]),
        ("Admin Control", ["Script/category activation", "Quick-script management", "User approval", "Role separation"]),
        ("AI Assistance", ["Support chatbot", "Spellcheck helper", "AI Trainer references", "Memory summaries"]),
    ]
    col_w = (w - 100) / 3
    for index, (title, items) in enumerate(cols):
        x = 42 + index * (col_w + 8)
        c.setFillColor(hex_color(LIGHT))
        c.roundRect(x, y - 118, col_w, 110, 8, stroke=0, fill=1)
        c.setFillColor(hex_color(DARK))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x + 12, y - 28, title)
        c.setFont("Helvetica", 9)
        c.setFillColor(hex_color(MUTED))
        yy = y - 48
        for item in items:
            c.drawString(x + 12, yy, f"- {item}")
            yy -= 16

    draw_footer(c)
    c.showPage()

    # Page 2
    draw_header(c, "Architecture and Governance", 2)
    y = h - 80
    y = section_title(c, "Production Architecture", 42, y)
    y = bullet_list(
        c,
        [
            "Frontend and API routes run on Next.js 14 App Router deployed to Vercel.",
            "Persistent application data lives in Neon PostgreSQL through Prisma.",
            "Scripts edited in the admin dashboard are stored in Neon, so deployment does not overwrite live admin additions.",
            "Rate limiting protects login, signup, password reset, and AI chat endpoints.",
            "Security headers and httpOnly signed session cookies are enabled for production use.",
        ],
        54,
        y,
        w - 108,
    )

    y -= 8
    y = section_title(c, "Roles and Data Safety", 42, y)
    y = bullet_list(
        c,
        [
            "Super Admin controls user role changes and account removal.",
            "Admin can manage operational scripts and approve/generate passwords for new users.",
            "Regular users can use scripts, quick replies, favorites, calculations, and AI without changing shared content.",
            "Category and script deactivation hides content globally without deleting historical data.",
            "Legacy quick-script data is audited before cleanup, and cleanup only runs when rows are confirmed duplicates.",
        ],
        54,
        y,
        w - 108,
    )

    y -= 8
    y = section_title(c, "QA and Operational Checks", 42, y)
    y = bullet_list(
        c,
        [
            "npm run build validates Prisma generation, Next.js compilation, linting, type checks, and page generation.",
            "npm run smoke validates public page rendering and anonymous API protections by default.",
            "Authenticated smoke checks can be enabled with SMOKE_EMAIL and SMOKE_PASSWORD.",
            "Authenticated smoke checks can verify shared quick scripts without creating legacy per-user copies.",
            "/api/health supports external monitoring and can be protected with HEALTH_SECRET or CRON_SECRET.",
        ],
        54,
        y,
        w - 108,
    )

    draw_footer(c)
    c.showPage()

    # Page 3
    draw_header(c, "Cost Estimate", 3)
    y = h - 80
    y = section_title(c, "Expected Monthly Cost for 25 Daily Users", 42, y)
    y = draw_wrapped(
        c,
        "The estimate below assumes 25 support users, daily script usage, moderate AI chat usage, and one developer/admin seat managing deployment. "
        "Support agents are application users, not Vercel developer seats.",
        42,
        y,
        w - 84,
        size=10.5,
        leading=15,
    )
    y -= 18
    rows = [
        ("Vercel hosting", "$0 on Hobby for light use; $20/mo Pro recommended for production ownership and higher limits."),
        ("Neon PostgreSQL", "$0 Free can work for small data; Launch typical spend is about $15/mo if Free limits are exceeded."),
        ("AI provider", "Groq Llama 3.1 8B is very low cost at $0.05/M input and $0.08/M output tokens; Gemini API also has free usage through Google AI Studio."),
        ("Email SMTP", "Usually $0 if using an existing Gmail/SMTP account within provider limits."),
        ("Practical range", "$0-$10/mo for light internal use, or roughly $35-$45/mo for a safer production setup with Vercel Pro + Neon Launch + AI buffer."),
    ]
    table_x = 42
    table_w = w - 84
    row_h = 54
    for i, (name, detail) in enumerate(rows):
        top = y - i * row_h
        c.setFillColor(hex_color("#FFFFFF" if i % 2 == 0 else LIGHT))
        c.rect(table_x, top - row_h + 8, table_w, row_h, stroke=0, fill=1)
        c.setStrokeColor(hex_color(LINE))
        c.rect(table_x, top - row_h + 8, table_w, row_h, stroke=1, fill=0)
        c.setFillColor(hex_color(DARK))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(table_x + 10, top - 14, name)
        draw_wrapped(c, detail, table_x + 145, top - 14, table_w - 160, size=9, leading=12, color=MUTED)
    y = y - len(rows) * row_h - 4

    y = section_title(c, "Development Roadmap", 42, y)
    y = bullet_list(
        c,
        [
            "Browser extension connected to the hub, replacing TextBlaze-style snippets with centrally managed shortcuts.",
            "Health endpoint monitors AI configuration, database access, cron configuration, and offer-sync freshness.",
            "Legacy database audit/cleanup command removes UserQuickScript rows only when they are confirmed duplicates.",
        ],
        54,
        y,
        w - 108,
    )

    y -= 14
    y = section_title(c, "Sources", 42, y)
    for source in SOURCES:
        y = draw_wrapped(c, source, 54, y, w - 108, size=8.5, leading=12, color=MUTED)
    draw_footer(c)
    c.showPage()
    c.save()


EMU_PER_INCH = 914400
SLIDE_W = 13.333333
SLIDE_H = 7.5
SLIDE_W_EMU = int(SLIDE_W * EMU_PER_INCH)
SLIDE_H_EMU = int(SLIDE_H * EMU_PER_INCH)


def emu(value_in_inches: float) -> int:
    return int(value_in_inches * EMU_PER_INCH)


def xml_escape(value: str) -> str:
    return html.escape(value, quote=True)


def color_xml(hex_value: str) -> str:
    return f'<a:solidFill><a:srgbClr val="{hex_value.lstrip("#")}"/></a:solidFill>'


def line_xml(hex_value: str = LINE, width: int = 9525) -> str:
    return f'<a:ln w="{width}">{color_xml(hex_value)}</a:ln>'


def shape_xml(shape_id: int, name: str, x: float, y: float, w: float, h: float, fill: str, line: str = "none") -> str:
    line_part = "<a:ln><a:noFill/></a:ln>" if line == "none" else line_xml(line)
    return f"""
      <p:sp>
        <p:nvSpPr><p:cNvPr id="{shape_id}" name="{xml_escape(name)}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          {color_xml(fill)}
          {line_part}
        </p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
      </p:sp>
    """


def run_xml(text: str, size: int, color: str, bold: bool = False) -> str:
    bold_attr = ' b="1"' if bold else ""
    return (
        f'<a:r><a:rPr lang="en-US" sz="{size * 100}"{bold_attr}>'
        f'{color_xml(color)}<a:latin typeface="Arial"/></a:rPr><a:t>{xml_escape(text)}</a:t></a:r>'
    )


def text_xml(
    shape_id: int,
    name: str,
    x: float,
    y: float,
    w: float,
    h: float,
    paragraphs: list[str],
    size: int = 18,
    color: str = DARK,
    bold: bool = False,
    align: str = "l",
) -> str:
    para_xml = []
    for paragraph in paragraphs:
        para_xml.append(f'<a:p><a:pPr algn="{align}"/>{run_xml(paragraph, size, color, bold)}<a:endParaRPr lang="en-US" sz="{size * 100}"/></a:p>')
    return f"""
      <p:sp>
        <p:nvSpPr><p:cNvPr id="{shape_id}" name="{xml_escape(name)}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/><a:ln><a:noFill/></a:ln>
        </p:spPr>
        <p:txBody><a:bodyPr wrap="square" anchor="t"/><a:lstStyle/>{''.join(para_xml)}</p:txBody>
      </p:sp>
    """


def bullet_text_xml(shape_id: int, name: str, x: float, y: float, w: float, h: float, bullets: list[str], size: int = 18) -> str:
    paras = []
    for item in bullets:
        paras.append(
            f'<a:p><a:pPr marL="228600" indent="-171450"/>'
            f'{run_xml("- " + item, size, DARK)}<a:endParaRPr lang="en-US" sz="{size * 100}"/></a:p>'
        )
    return f"""
      <p:sp>
        <p:nvSpPr><p:cNvPr id="{shape_id}" name="{xml_escape(name)}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/><a:ln><a:noFill/></a:ln>
        </p:spPr>
        <p:txBody><a:bodyPr wrap="square" anchor="t"/><a:lstStyle/>{''.join(paras)}</p:txBody>
      </p:sp>
    """


def slide_xml(title: str, subtitle: str, bullets: list[str], index: int, accent: str = GREEN, cards: list[tuple[str, str]] | None = None) -> str:
    shape_id = 2
    shapes = [
        shape_xml(shape_id, "top-accent-green", 0, 0, 7.2, 0.16, GREEN),
        shape_xml(shape_id + 1, "top-accent-blue", 7.2, 0, 6.2, 0.16, BLUE),
        text_xml(shape_id + 2, "eyebrow", 0.58, 0.36, 5.4, 0.3, ["PUREGYM SUPPORT HUB"], 10, MUTED, True),
        text_xml(shape_id + 3, "title", 0.58, 0.86, 8.3, 1.1, [title], 35, DARK, True),
        text_xml(shape_id + 4, "subtitle", 0.6, 1.9, 9.4, 0.55, [subtitle], 17, MUTED),
        bullet_text_xml(shape_id + 5, "bullets", 0.78, 2.75, 6.1, 3.8, bullets, 17),
        shape_xml(shape_id + 6, "side-panel", 7.25, 2.65, 5.45, 3.55, LIGHT, LINE),
        text_xml(shape_id + 7, "slide-number", 12.22, 6.96, 0.55, 0.2, [str(index)], 9, MUTED),
        text_xml(shape_id + 8, "made-by", 0.58, 6.92, 4.2, 0.25, [MADE_BY], 9, MUTED),
    ]
    shape_id += 9
    if cards:
        card_y = 2.9
        for card_title, card_body in cards[:3]:
            shapes.append(shape_xml(shape_id, f"card-{shape_id}", 7.58, card_y, 4.78, 0.88, "#FFFFFF", LINE))
            shapes.append(text_xml(shape_id + 1, f"card-title-{shape_id}", 7.78, card_y + 0.14, 4.35, 0.22, [card_title], 13, accent, True))
            shapes.append(text_xml(shape_id + 2, f"card-body-{shape_id}", 7.78, card_y + 0.42, 4.35, 0.24, [card_body], 11, MUTED))
            card_y += 1.05
            shape_id += 3
    else:
        shapes.append(text_xml(shape_id, "panel-big-word", 7.65, 3.04, 4.55, 0.68, ["FAST"], 34, accent, True, "ctr"))
        shapes.append(text_xml(shape_id + 1, "panel-copy", 7.72, 3.92, 4.5, 0.75, ["Search, fill, copy, and support members from one place."], 16, DARK, False, "ctr"))

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr>{color_xml("#FFFFFF")}<a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      {''.join(shapes)}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>"""


def title_slide_xml() -> str:
    shapes = [
        shape_xml(2, "green-field", 0, 0, 7.4, 7.5, GREEN),
        shape_xml(3, "blue-field", 7.4, 0, 5.95, 7.5, BLUE),
        text_xml(4, "title", 0.72, 1.1, 7.4, 1.45, ["PureGym Support Hub"], 46, "#FFFFFF", True),
        text_xml(5, "subtitle", 0.76, 2.72, 7.0, 0.86, ["Internal support workspace for KSA and UAE agents"], 22, "#FFFFFF"),
        text_xml(6, "date", 0.78, 5.88, 5.1, 0.3, [f"Updated {UPDATED}"], 12, "#FFFFFF"),
        text_xml(7, "made-by", 0.78, 6.24, 5.2, 0.3, [MADE_BY], 12, "#FFFFFF", True),
        text_xml(8, "right-copy", 8.02, 1.36, 4.35, 2.2, ["One console for approved scripts, quick replies, admin control, AI help, and operational checks."], 26, "#FFFFFF", True),
        text_xml(9, "right-small", 8.05, 4.62, 4.0, 0.7, ["Built for faster, cleaner support conversations."], 18, "#FFFFFF"),
    ]
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    {''.join(shapes)}
  </p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>"""


SLIDES = [
    title_slide_xml(),
    slide_xml(
        "The hub removes daily support friction",
        "Agents should not jump between scattered notes, admin changes, and AI tools during a live conversation.",
        [
            "Approved scripts are centralized and searchable.",
            "Country and language context stays visible.",
            "Favorites and most-used scripts reduce repeated searching.",
            "Admin changes live in Neon, not old project files.",
        ],
        2,
        GREEN,
        [("Audience", "KSA and UAE support agents"), ("Goal", "Faster accurate responses"), ("Data", "Neon-backed live content")],
    ),
    slide_xml(
        "The latest batch makes scripts faster to reach",
        "Ctrl+K and variable prompts turn the script library into a keyboard-first tool.",
        [
            "Ctrl+K opens the in-app command palette when the page has focus.",
            "Copying a script can prompt for date, duration, amount, membership type, or member name.",
            "The same copy pipeline applies name, gender, country heart, variables, and usage tracking.",
            "Most-used scripts are tracked per agent locally.",
        ],
        3,
        BLUE,
        [("Shortcut", "Ctrl+K command palette"), ("Fill", "Dates and script variables"), ("Copy", "Ready-to-send output")],
    ),
    slide_xml(
        "AI now runs on a low-cost provider by default",
        "The app is no longer locked to OpenAI billing.",
        [
            "Groq is the default provider using llama-3.1-8b-instant.",
            "Gemini can be enabled with GEMINI_API_KEY and AI_PROVIDER=gemini.",
            "OpenAI stays available only as an intentional fallback.",
            "The AI health route now reports provider, model, database status, and configuration readiness.",
        ],
        4,
        GREEN,
        [("Default", "Groq"), ("Alternative", "Gemini"), ("Fallback", "OpenAI only if selected")],
    ),
    slide_xml(
        "Admin governance protects shared content",
        "The model separates daily usage from global content control.",
        [
            "Super Admin owns role changes and user removal.",
            "Admin and Super Admin can manage scripts and quick scripts.",
            "Deactivation hides scripts or categories globally without deleting the record.",
            "Account requests can be approved with generated passwords.",
        ],
        5,
        BLUE,
        [("Super Admin", "User authority"), ("Admin", "Content authority"), ("User", "Daily operation")],
    ),
    slide_xml(
        "QA now has a repeatable smoke path",
        "The project has a simple command for catching broken routes before deployment.",
        [
            "npm run build verifies Prisma, Next.js, type checking, and static generation.",
            "npm run smoke verifies page rendering and anonymous API protection.",
            "Authenticated smoke can run with SMOKE_EMAIL and SMOKE_PASSWORD.",
            "Quick-script authenticated checks are gated to avoid unintended database writes.",
        ],
        6,
        GREEN,
        [("Build", "Production compile"), ("Smoke", "Route protection"), ("Safe", "No DB writes by default")],
    ),
    slide_xml(
        "The cost profile stays small for 25 users",
        "Support agents are app users, not infrastructure seats.",
        [
            "Vercel Hobby can run light use; Pro is safer for production ownership.",
            "Neon Free may be enough for small data; Launch is the practical growth step.",
            "Groq token pricing keeps moderate AI usage in a low monthly range.",
            "Gemini API free usage is another option when rate limits fit the workflow.",
        ],
        7,
        BLUE,
        [("Light use", "$0-$10/mo"), ("Safer setup", "$35-$45/mo"), ("OpenAI", "Not required")],
    ),
    slide_xml(
        "The next development track is operational maturity",
        "The roadmap focuses on reliability and agent speed, not extra manual admin work.",
        [
            "Browser extension connected to the hub can replace TextBlaze-style local snippets.",
            "Health checks monitor AI configuration, cron setup, and offer-sync freshness.",
            "Legacy UserQuickScript cleanup runs only after Neon audit confirms no unique user data is needed.",
            "Documentation should keep matching the deployed behavior after each batch.",
        ],
        8,
        GREEN,
        [("Extension", "Central shortcuts"), ("Monitoring", "AI, cron, offers"), ("Cleanup", "Audit before delete")],
    ),
]


def rels_xml(rels: list[tuple[str, str, str]]) -> str:
    body = "".join(
        f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/{typ}" Target="{target}"/>'
        for rid, typ, target in rels
    )
    return f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{body}</Relationships>'


def generate_pptx() -> None:
    content_types = [
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
        '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
        '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
        '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
    ]
    for i in range(1, len(SLIDES) + 1):
        content_types.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')

    slide_ids = "".join(f'<p:sldId id="{255 + i}" r:id="rId{i}"/>' for i in range(1, len(SLIDES) + 1))
    presentation_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
 <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId{len(SLIDES)+1}"/></p:sldMasterIdLst>
 <p:sldIdLst>{slide_ids}</p:sldIdLst>
 <p:sldSz cx="{SLIDE_W_EMU}" cy="{SLIDE_H_EMU}" type="screen16x9"/>
 <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>"""

    master_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
 <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
 <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
 <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>"""
    layout_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
 <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
 <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>"""
    theme_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="PureGym Support Hub">
 <a:themeElements>
  <a:clrScheme name="PureGym"><a:dk1><a:srgbClr val="111827"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="005EB8"/></a:dk2><a:lt2><a:srgbClr val="F3F6F8"/></a:lt2><a:accent1><a:srgbClr val="00A651"/></a:accent1><a:accent2><a:srgbClr val="005EB8"/></a:accent2><a:accent3><a:srgbClr val="4B5563"/></a:accent3><a:accent4><a:srgbClr val="D7DEE8"/></a:accent4><a:accent5><a:srgbClr val="111827"/></a:accent5><a:accent6><a:srgbClr val="F3F6F8"/></a:accent6><a:hlink><a:srgbClr val="005EB8"/></a:hlink><a:folHlink><a:srgbClr val="00A651"/></a:folHlink></a:clrScheme>
  <a:fontScheme name="Arial"><a:majorFont><a:latin typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Arial"/></a:minorFont></a:fontScheme>
  <a:fmtScheme name="PureGym"><a:fillStyleLst><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:srgbClr val="D7DEE8"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
 </a:themeElements>
</a:theme>"""

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    core_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 <dc:title>PureGym Support Hub Presentation</dc:title><dc:creator>Mohammed Alkhandagji</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>"""
    app_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>PureGym Support Hub</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>{len(SLIDES)}</Slides></Properties>"""

    with zipfile.ZipFile(PPTX_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">{"".join(content_types)}</Types>')
        zf.writestr("_rels/.rels", rels_xml([("rId1", "officeDocument", "ppt/presentation.xml"), ("rId2", "metadata/core-properties", "docProps/core.xml"), ("rId3", "extended-properties", "docProps/app.xml")]))
        zf.writestr("docProps/core.xml", core_xml)
        zf.writestr("docProps/app.xml", app_xml)
        zf.writestr("ppt/presentation.xml", presentation_xml)
        presentation_rels = [(f"rId{i}", "slide", f"slides/slide{i}.xml") for i in range(1, len(SLIDES) + 1)]
        presentation_rels.append((f"rId{len(SLIDES)+1}", "slideMaster", "slideMasters/slideMaster1.xml"))
        presentation_rels.append((f"rId{len(SLIDES)+2}", "theme", "theme/theme1.xml"))
        zf.writestr("ppt/_rels/presentation.xml.rels", rels_xml(presentation_rels))
        zf.writestr("ppt/theme/theme1.xml", theme_xml)
        zf.writestr("ppt/slideMasters/slideMaster1.xml", master_xml)
        zf.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", rels_xml([("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml")]))
        zf.writestr("ppt/slideLayouts/slideLayout1.xml", layout_xml)
        zf.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", rels_xml([("rId1", "slideMaster", "../slideMasters/slideMaster1.xml")]))
        for i, slide in enumerate(SLIDES, start=1):
            zf.writestr(f"ppt/slides/slide{i}.xml", slide)
            zf.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", rels_xml([("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml")]))


def main() -> None:
    ensure_docs_dir()
    generate_pdf()
    generate_pptx()
    print(PDF_PATH)
    print(PPTX_PATH)


if __name__ == "__main__":
    main()
