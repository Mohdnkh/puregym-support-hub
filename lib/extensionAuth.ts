import { prisma } from "./db";
import { hashToken } from "./crypto";

export type ExtensionUser = {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  role: "USER" | "ADMIN";
};

export function getBearerToken(req: Request) {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

export async function getUserFromExtensionToken(req: Request): Promise<ExtensionUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const accessToken = await prisma.extensionAccessToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          nameAr: true,
          nameEn: true,
          role: true
        }
      }
    }
  });

  if (!accessToken || accessToken.revokedAt || !accessToken.user) return null;

  await prisma.extensionAccessToken.update({
    where: { id: accessToken.id },
    data: { lastUsedAt: new Date() }
  }).catch(() => null);

  return accessToken.user;
}
