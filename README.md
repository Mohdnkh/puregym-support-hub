# PureGym Support Hub

Internal support website for PureGym KSA/UAE agents.

## Features

- Login / Sign up
- Email verification through Gmail SMTP
- User and Admin roles
- Scripts dashboard with KSA/UAE + Arabic/English filters
- Script box with one small AI spelling correction button only
- Admin script editor updates scripts for everyone
- AI Support Chatbot with built-in style filters: KSA Arabic, KSA English, UAE Arabic, UAE English
- Calculation Tool rebuilt from the uploaded Excel workbook
- Railway-ready `.env.example`

## Important script rules implemented

- KSA Agent Scripts and UAE Agent Scripts should have opening greetings removed from the script body, such as `حياك الله` or customer mentions.
- WhatsApp Scripts are ignored.
- Google Reviews Scripts use the logged-in employee name.
- New App FAQs are converted into ready reply scripts instead of Q&A format.
- Freeze Policy is included as membership policy summary.
- Action Templates are included as direct action scripts.

## Local setup

```bash
npm install
cp .env.example .env
# Fill DATABASE_URL, AUTH_SECRET, JWT_SECRET, SMTP, OpenAI, and admin values.
npm run db:push
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

## Railway deployment

1. Push this project to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add Railway PostgreSQL.
4. Add the values from `.env.example` in Railway Variables.
5. Deploy.
6. Run seed once from Railway shell if needed:

```bash
npm run db:push
npm run db:seed
```

## Gmail SMTP

Use a Gmail App Password, not the normal Gmail password.

Required variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

## Admin

Set these before running seed:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME_AR=
ADMIN_NAME_EN=
```

## Notes

The project contains seeded scripts so the website can start immediately after database setup. Admin can update scripts later from the Admin Editor without changing code.
