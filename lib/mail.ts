import nodemailer from "nodemailer";

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationCode(email: string, code: string) {
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || "PureGym Support Hub";

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !fromEmail) {
    console.warn("SMTP variables are missing. Verification code:", code);
    return;
  }

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: "PureGym Support Hub verification code",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:auto;padding:24px">
        <h2 style="margin:0 0 12px">PureGym Support Hub</h2>
        <p>Please use the code below to verify your account:</p>
        <div style="font-size:30px;letter-spacing:8px;font-weight:800;background:#f3f4f6;border-radius:14px;padding:16px;text-align:center;margin:18px 0">${code}</div>
        <p>This code will expire soon. If you did not request this account, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetCode(email: string, code: string) {
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || "PureGym Support Hub";

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !fromEmail) {
    console.warn("SMTP variables are missing. Password reset code:", code);
    return;
  }

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: "PureGym Support Hub password reset code",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:auto;padding:24px">
        <h2 style="margin:0 0 12px">PureGym Support Hub</h2>
        <p>Please use the code below to reset your password:</p>
        <div style="font-size:30px;letter-spacing:8px;font-weight:800;background:#f3f4f6;border-radius:14px;padding:16px;text-align:center;margin:18px 0">${code}</div>
        <p>This code will expire soon. If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(
  email: string,
  tokenOrCode: string,
) {
  return sendVerificationCode(email, tokenOrCode);
}
