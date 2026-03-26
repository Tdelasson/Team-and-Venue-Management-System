import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMockUser } from "@/lib/get-mock-user";
import { checkPitchConflict } from "@/lib/booking-conflicts";
import type { PitchOption } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const teamId = searchParams.get("teamId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  } else {
    where.status = "APPROVED";
  }

  if (teamId) where.teamId = teamId;
  if (type) where.type = type;

  if (from || to) {
    where.startTime = {};
    if (from) (where.startTime as Record<string, unknown>).gte = new Date(from);
    if (to) (where.startTime as Record<string, unknown>).lte = new Date(to);
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      team: true,
      createdBy: { select: { id: true, name: true } },
      participations: {
        include: { user: { select: { id: true, name: true } } },
      },
      spectatorInterests: { select: { userId: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  const user = await getMockUser(request);
  if (!user || user.role !== "COACH") {
    return NextResponse.json({ error: "Kun trænere kan oprette bookinger" }, { status: 403 });
  }

  const body = await request.json();
  const { type, title, pitchOption, startTime, endTime } = body;

  if (!type || !title || !pitchOption || !startTime || !endTime) {
    return NextResponse.json({ error: "Alle felter skal udfyldes" }, { status: 400 });
  }

  if (type === "MATCH" && pitchOption !== "FULL") {
    return NextResponse.json({ error: "Kampe kræver hele banen" }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return NextResponse.json({ error: "Starttid skal være før sluttid" }, { status: 400 });
  }

  const conflict = await checkPitchConflict(pitchOption as PitchOption, start, end);
  if (conflict.hasConflict) {
    return NextResponse.json(
      { error: "Banen er allerede booket i dette tidsrum", conflicts: conflict.conflictingBookings },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      type,
      title,
      pitchOption,
      startTime: start,
      endTime: end,
      teamId: user.teamId!,
      createdByUserId: user.id,
    },
    include: {
      team: true,
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
