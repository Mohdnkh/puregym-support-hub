import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { prisma } from "./db";

export type SessionUser = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  profileImage: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  emailVerified: boolean;
};

type TokenPayload = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
};

const COOKIE_NAME = "pg_session";

export function signSession(payload: TokenPayload, rememberMe = false) {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET or AUTH_SECRET");
  }

  const options: SignOptions = {
    expiresIn: (rememberMe ? "30d" : process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, secret as Secret, options);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret as Secret) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user) {
      return null;
    }

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "").toLowerCase();
    const role =
      superAdminEmail && user.email.toLowerCase() === superAdminEmail
        ? "SUPER_ADMIN"
        : user.role;

    return {
      id: user.id,
      email: user.email,
      nameAr: user.nameAr,
      nameEn: user.nameEn,
      profileImage: user.profileImage,
      role,
      emailVerified: Boolean(user.emailVerifiedAt)
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(rememberMe = false) {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    sameSite: (process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none") || "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * (rememberMe ? 30 : 7)
  };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
