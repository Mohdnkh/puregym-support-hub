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
PDF_PATH = DOCS / "PureGym-Support-Hub-Overview.pdf"
PPTX_PATH = DOCS / "PureGym-Support-Hub-Presentation.pptx"

GREEN = "#00A651"
BLUE = "#005EB8"
DARK = "#111827"
MUTED = "#4B5563"
LIGHT = "#F3F6F8"
LINE = "#D7DEE8"

UPDATED = "July 4, 2026"
MADE_BY = "Made by Mohammed Alkhandagji"
OFFICIAL_COST_SOURCES = "Official cost references: Vercel plan pages, Neon plans, Groq model cost page, and Gemini API cost page."

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
    c.drawString(42, h - 78, "Project overview, operating model, and feature coverage")
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
            "AI provider is no longer tied to OpenAI. Groq is the default provider, with Gemini and OpenAI kept as optional fallbacks.",
            "Ctrl+K now opens the in-app command palette when the page has focus, making script search faster than navigating categories.",
            "Fill-before-copy variables now work across scripts that contain dates, duration, membership type, amount, or member name placeholders.",
            "Smoke tests were added for the dashboard shell, admin protection, script APIs, and quick-script access rules.",
            "Documentation now matches the current Vercel, Neon, Groq, and Gemini setup.",
        ],
        54,
        y,
        w - 108,
    )

    y -= 10
    y = section_title(c, "Primary Capabilities", 42, y)
    cols = [
        ("Agent Workspace", ["Script Library", "Quick Scripts", "Favorites", "Branch Directory"]),
        ("Admin Control", ["Script/category activation", "Quick-script management", "Shared content controls", "Content status management"]),
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
            "Persistent application data is stored in Neon PostgreSQL through Prisma.",
            "Scripts edited in the admin dashboard are stored in Neon, so deployment does not overwrite current admin additions.",
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
            "Admin can manage operational scripts, categories, Quick Scripts, activation status, and shared support content.",
            "User account creation, removal, and role changes are left to the technical team rather than handled in this presentation scope.",
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
            "/api/health supports external monitoring for database, AI configuration, and system readiness.",
        ],
        54,
        y,
        w - 108,
    )

    draw_footer(c)
    c.showPage()

    # Page 3
    draw_header(c, "Feature Coverage", 3)
    y = h - 80
    y = section_title(c, "Workspace Features", 42, y)
    y = bullet_list(
        c,
        [
            "Script Library with category filters, active/inactive visibility for admins, favorites, and one-click copy behavior.",
            "Quick Scripts with shared admin-managed content, drag-and-drop ordering, personal favorites, and male/female wording toggles.",
            "Ctrl+K command palette for fast script lookup and keyboard-first copying.",
            "Fill-before-copy prompts for dates, duration, membership type, amount, and member names.",
            "Branch Directory with searchable KSA/UAE branch references.",
        ],
        54,
        y,
        w - 108,
    )

    y -= 8
    y = section_title(c, "Assistant and Admin Features", 42, y)
    y = bullet_list(
        c,
        [
            "AI chatbot uses official knowledge, scripts, trainer notes, conversation memory, and country/language signals.",
            "AI Trainer accepts text, links, and image-based references without forcing agents to tag every item manually.",
            "Spellcheck helper improves selected scripts while keeping the agent in control.",
            "Admin Editor manages scripts, categories, activation status, account approvals, and generated passwords.",
            "Calculation Tool includes membership calculations and Hijri/Gregorian conversion in both directions.",
        ],
        54,
        y,
        w - 108,
    )

    y -= 8
    y = section_title(c, "Reliability Features", 42, y)
    y = bullet_list(
        c,
        [
            "Shared Quick Scripts now read from the master Script table, preventing old per-user copies from returning.",
            "Legacy UserQuickScript audit refuses cleanup if any unique user content is detected.",
            "Smoke tests cover public pages, route protection, health checks, and authenticated flows when credentials are provided.",
            "Health checks expose database, AI configuration, and system readiness for external monitors.",
        ],
        54,
        y,
        w - 108,
    )
    draw_footer(c)
    c.showPage()

    # Page 4
    draw_header(c, "Operating Cost", 4)
    y = h - 80
    y = section_title(c, "Monthly Cost Model", 42, y)
    y = draw_wrapped(
        c,
        "The hub is designed for low operating cost because the main workload is an internal Next.js dashboard, "
        "a small PostgreSQL database, and AI calls that run only when agents use the assistant or helper actions. "
        "The numbers below are planning estimates for about 25 application users, not final invoices.",
        42,
        y,
        w - 84,
        size=10.5,
        leading=15,
    )
    y -= 14
    y = section_title(c, "Cost Details", 42, y)
    y = bullet_list(
        c,
        [
            "Vercel hosting: $0/mo on Hobby for light internal use, or $20/mo on Pro with 1 deploying team seat and $20 monthly usage credit. This pays for the Next.js app, API routes, CDN, builds, deployments, and production controls.",
            "Neon PostgreSQL: $0/mo can work for a small database; Launch is a typical $15/mo for intermittent load and 1 GB. This pays for persistent scripts, categories, favorites, account requests, AI references, and memory summaries.",
            "Groq AI: llama-3.1-8b-instant is $0.05 per 1M input tokens and $0.08 per 1M output tokens. AI cost appears only when chat, spellcheck, trainer extraction, or summary actions are used.",
            "Gemini optional fallback: selected Gemini API models include a free tier, so it can be used as a no-cost path for light AI usage within rate limits.",
            "Email, domain, and basic monitoring: $0/mo when existing SMTP, the Vercel domain, and built-in checks are enough. Custom domains, paid email, or external monitoring depend on the provider selected.",
        ],
        54,
        y,
        w - 108,
    )

    y -= 8
    y = section_title(c, "Practical Budget", 42, y)
    y = bullet_list(
        c,
        [
            "Lean internal setup: about $0-$10/mo if Vercel Hobby, Neon Free, and low AI volume stay within plan limits.",
            "Recommended production baseline: about $35-$45/mo using Vercel Pro at $20/mo, Neon Launch around $15/mo, and a small AI buffer.",
            "25-user AI example: 25 users x 20 AI messages/day x 30 days = 15,000 AI calls/month. At 1,500 input tokens and 700 output tokens per call on Groq, the AI token cost is about $2/mo.",
            "A heavier AI workload can be budgeted at $5-$10/mo first, then adjusted after real usage appears in provider dashboards.",
        ],
        54,
        y,
        w - 108,
    )
    y -= 6
    y = section_title(c, "Cost Notes", 42, y)
    y = bullet_list(
        c,
        [
            "The 25 support users are application users; they are not Vercel paid team seats.",
            "Only people who deploy or manage the Vercel project need paid Vercel team access on Pro.",
            OFFICIAL_COST_SOURCES,
        ],
        54,
        y,
        w - 108,
    )
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
        shape_xml(shape_id + 1, "top-accent-blue", 7.2, 0, 6.13, 0.16, BLUE),
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
        shape_xml(3, "blue-field", 7.4, 0, 5.93, 7.5, BLUE),
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
        "Agents get one focused workspace",
        "The dashboard keeps daily support work inside one organized screen.",
        [
            "Approved scripts are centralized and searchable.",
            "Country and language context stays visible.",
            "Favorites and most-used scripts reduce repeated searching.",
            "Admin changes are stored in Neon, not old project files.",
        ],
        2,
        GREEN,
        [("Audience", "KSA and UAE support agents"), ("Goal", "Faster accurate responses"), ("Data", "Neon-backed content")],
    ),
    slide_xml(
        "Script Library and Quick Scripts stay controlled",
        "Shared content is easier to manage and safer to use.",
        [
            "Script Library supports category filtering, favorites, activation, and one-click copy.",
            "Quick Scripts are shared from the master Script table so admin edits apply to everyone.",
            "Admins can drag cards to reorder Quick Scripts instead of clicking arrows repeatedly.",
            "Male/Female wording toggles work from regular and favorite Quick Script cards.",
        ],
        3,
        BLUE,
        [("Library", "Search and copy"), ("Quick", "Shared and ordered"), ("Favorite", "Personal per user")],
    ),
    slide_xml(
        "Search and copy flows are built for speed",
        "Agents can reach the right wording without moving through long lists.",
        [
            "Ctrl+K opens the in-app command palette when the page has focus.",
            "Most-used scripts are tracked per agent locally.",
            "Copying a script can prompt for date, duration, amount, membership type, or member name.",
            "The copy pipeline applies employee name, gender, country heart, variables, and usage tracking.",
        ],
        4,
        GREEN,
        [("Shortcut", "Ctrl+K"), ("Fill", "Smart prompts"), ("Copy", "Ready output")],
    ),
    slide_xml(
        "AI helps agents answer with context",
        "The assistant uses the hub's own knowledge instead of generic answers.",
        [
            "Groq is the default provider using llama-3.1-8b-instant.",
            "Gemini and OpenAI remain optional providers through environment variables.",
            "AI Trainer accepts text, links, and image references as reusable knowledge.",
            "The chatbot uses scripts, official knowledge, memory, and country/language signals.",
        ],
        5,
        BLUE,
        [("Chatbot", "Support context"), ("Trainer", "Reusable knowledge"), ("Spellcheck", "Agent-controlled")],
    ),
    slide_xml(
        "Admin controls keep shared data clean",
        "Role boundaries make it clear who can change operational content.",
        [
            "Admin can manage scripts, categories, Quick Scripts, activation status, and shared support content.",
            "User creation, removal, and role changes are left to the technical team.",
            "Deactivation hides scripts or categories globally without deleting the record.",
            "Shared content changes apply to all users after saving.",
        ],
        6,
        GREEN,
        [("Admin", "Content authority"), ("Technical team", "User accounts"), ("User", "Daily operation")],
    ),
    slide_xml(
        "Support tools cover common daily tasks",
        "The hub includes utilities agents need during real support work.",
        [
            "Branch Directory gives searchable KSA and UAE branch references.",
            "Calculation Tool supports membership-related calculations.",
            "Hijri Month supports Hijri to Gregorian and Gregorian to Hijri conversion.",
            "Profile settings keep agent names available for script personalization.",
        ],
        7,
        BLUE,
        [("Branches", "Searchable"), ("Calendar", "Two-way conversion"), ("Profile", "Agent names")],
    ),
    slide_xml(
        "QA and health checks make releases safer",
        "The project now has repeatable checks before deployment.",
        [
            "npm run build verifies Prisma, Next.js, type checking, and static generation.",
            "npm run smoke verifies page rendering and anonymous API protection.",
            "Authenticated smoke can run with SMOKE_EMAIL and SMOKE_PASSWORD.",
            "/api/health reports database, AI configuration, and system readiness.",
            "Legacy UserQuickScript cleanup runs only after Neon audit confirms no unique user data is needed.",
        ],
        8,
        GREEN,
        [("Build", "Production compile"), ("Smoke", "Route protection"), ("Health", "Monitor-ready")],
    ),
    slide_xml(
        "Operating cost stays small for 25 users",
        "The main monthly cost is hosting, database capacity, and AI usage.",
        [
            "Hosting: Vercel can be $0/mo for light internal use, or $20/mo on Pro for production control.",
            "Database: Neon can start at $0/mo; Launch is typically about $15/mo for intermittent load and 1 GB.",
            "AI: Groq Llama 3.1 8B is $0.05 per 1M input tokens and $0.08 per 1M output tokens.",
            "25-user example: 15,000 AI calls/month at moderate token size is about $2/mo on Groq.",
            "Practical budget: $0-$10/mo lean, or about $35-$45/mo for a safer production baseline.",
        ],
        9,
        BLUE,
        [("Vercel", "$0 or $20/mo"), ("Neon", "$0 or ~$15/mo"), ("AI", "~$2-$10/mo")],
    ),
    slide_xml(
        "The hub is ready for daily support work",
        "The final result is a cleaner, faster workspace for agents and admins.",
        [
            "Agents can search, fill, copy, calculate, and use AI from one focused dashboard.",
            "Admins can keep scripts, categories, quick replies, and shared references clean.",
            "Neon keeps current content live, so deployments do not replace admin updates.",
            "The operating model stays simple, controlled, and low-cost for a 25-user team.",
        ],
        10,
        GREEN,
        [("Outcome", "Faster support"), ("Control", "Cleaner content"), ("Cost", "Predictable baseline")],
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
