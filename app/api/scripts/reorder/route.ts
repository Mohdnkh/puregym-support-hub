import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({ ids: z.array(z.string()).min(1) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { ids } = schema.parse(await req.json());

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.script.update({
        where: { id },
        data: { sortOrder: (index + 1) * 10 }
      })
    )
  );

  return NextResponse.json({ ok: true });
}
