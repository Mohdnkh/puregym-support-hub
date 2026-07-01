import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  active: z.boolean(),
});

// Activate / deactivate every script in a category (admin + super admin).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"))
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { name, active } = schema.parse(await req.json());
  const clean = name.trim();
  if (!clean) return NextResponse.json({ error: "Category name is required" }, { status: 400 });

  const result = await prisma.script.updateMany({
    where: { category: clean },
    data: { active },
  });

  return NextResponse.json({ ok: true, count: result.count });
}
