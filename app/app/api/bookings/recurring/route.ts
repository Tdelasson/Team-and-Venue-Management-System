import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMockUser } from "@/lib/get-mock-user";
import { checkPitchConflict } from "@/lib/booking-conflicts";
import type { PitchOption } from "@/lib/types";

export async function POST(request: NextRequest) {
  const user = await getMockUser(request);
  if (!user || user.role !== "COACH") {
    return NextResponse.json({ error: "Kun trænere kan oprette bookinger" }, { status: 403 });
  }

  const body = await request.json();
  const { title, pitchOption, startTime, endTime, weeks } = body;

  if (!title || !pitchOption || !startTime || !endTime || !weeks) {
    return NextResponse.json({ error: "Alle felter skal udfyldes" }, { status: 400 });
  }

  if (weeks < 1 || weeks > 20) {
    return NextResponse.json({ error: "Antal uger skal være mellem 1 og 20" }, { status: 400 });
  }

  const recurringGroupId = `recurring-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const created: unknown[] = [];
  const conflicts: { week: number; conflicts: unknown[] }[] = [];

  for (let week = 0; week < weeks; week++) {
    const start = new Date(startTime);
    start.setDate(start.getDate() + week * 7);
    const end = new Date(endTime);
    end.setDate(end.getDate() + week * 7);

    const conflict = await checkPitchConflict(pitchOption as PitchOption, start, end);
    if (conflict.hasConflict) {
      conflicts.push({ week: week + 1, conflicts: conflict.conflictingBookings });
      continue;
    }

    const booking = await prisma.booking.create({
      data: {
        type: "TRAINING",
        title,
        pitchOption,
        startTime: start,
        endTime: end,
        teamId: user.teamId!,
        createdByUserId: user.id,
        recurringGroupId,
      },
      include: { team: true },
    });
    created.push(booking);
  }

  return NextResponse.json({
    created,
    conflicts,
    recurringGroupId,
    message: `${created.length} af ${weeks} bookinger oprettet`,
  }, { status: 201 });
}
