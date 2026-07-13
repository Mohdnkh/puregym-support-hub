---
name: puregym-frontend-design
description: PureGym Support Hub frontend design guidance for distinctive, fast, support-agent-focused UI work.
---

# PureGym Frontend Design

Use this when reshaping PureGym Support Hub UI. The product is an internal support console for KSA/UAE agents, so the design should feel operational, fast, calm, and unmistakably PureGym Arabia.

## Design Direction

- Build for repeated daily use, not a marketing landing page.
- Keep the sidebar stable and left-aligned across Arabic and English.
- Use PureGym green for KSA context and a strong blue for UAE context, with restrained neutrals and high-contrast text.
- Borrow the clean fitness-energy feel from PureGym and the polished enterprise/service tone from Extensya.
- Spend boldness in one place per screen: a signature header, status strip, or interaction. Keep everything else quiet and precise.
- Avoid generic gradients, oversized cards, one-note palettes, and decorative clutter.

## UX Rules

- Optimize for copy speed: search, favorite, category, and one-click copy should be reachable without scrolling battles.
- Dense screens should scan quickly: compact cards, clear labels, consistent spacing, and no text overflow.
- Empty and error states must tell the agent exactly what to do next.
- Arabic and English should change text, not flip the whole layout into a confusing mirrored UI.
- Every visual change should be checked on desktop and mobile dimensions before shipping.

## Implementation Rules

- Keep CSS scoped and avoid conflicting duplicate selectors.
- Prefer stable dimensions for cards, toolbars, chat panes, and shortcut panels.
- Respect keyboard focus and reduced motion.
- Use readable type scale. No viewport-based font scaling.
- Do not alter the PureGym logo unless explicitly requested.

## AI Chat UI

- Chat errors should be translated into agent-friendly messages, never raw provider/API text.
- Keep chat history compact and the active conversation prominent.
- The message panel should feel like a focused support workspace, not a generic chatbot demo.
