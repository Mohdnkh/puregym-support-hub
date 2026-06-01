import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const renameSchema = z.object({
  oldName: z.string().min(2),
  newName: z.string().min(2).max(80)
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { oldName, newName } = renameSchema.parse(await req.json());
  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();

  if (!cleanOld || !cleanNew) return NextResponse.json({ error: "Category names are required" }, { status: 400 });
  if (cleanOld === cleanNew) return NextResponse.json({ ok: true, count: 0 });

  const result = await prisma.script.updateMany({
    where: { category: cleanOld },
    data: { category: cleanNew }
  });

  return NextResponse.json({ ok: true, count: result.count });
}
