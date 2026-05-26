import nodemailer from "nodemailer";

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify?token=${encodeURIComponent(token)}`;
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || "PureGym Support Hub";

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !fromEmail) {
    console.warn("SMTP variables are missing. Verification link:", verifyUrl);
    return;
  }

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: "Verify your PureGym Support Hub account",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>PureGym Support Hub</h2>
        <p>Please verify your account by clicking the button below:</p>
        <p><a href="${verifyUrl}" style="display:inline-block;background:#111827;color:white;padding:10px 16px;border-radius:8px;text-decoration:none">Verify account</a></p>
        <p>If the button does not work, copy this link:</p>
        <p>${verifyUrl}</p>
      </div>
    `
  });
}
