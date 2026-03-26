import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { team: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const mapped = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    teamId: u.teamId,
    teamName: u.team?.name ?? null,
  }));

  return NextResponse.json({ users: mapped });
}
