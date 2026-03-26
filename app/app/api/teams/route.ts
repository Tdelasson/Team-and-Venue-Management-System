import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teams = await prisma.team.findMany({
    include: {
      _count: { select: { users: true, bookings: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(teams);
}
