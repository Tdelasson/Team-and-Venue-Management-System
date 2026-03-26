import { prisma } from "@/lib/prisma";
import type { PitchOption } from "@/lib/types";

interface ConflictResult {
  hasConflict: boolean;
  conflictingBookings: { id: string; title: string; pitchOption: string; startTime: Date; endTime: Date }[];
}

export async function checkPitchConflict(
  pitchOption: PitchOption,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<ConflictResult> {
  const pitchConditions: string[] = [];

  if (pitchOption === "FULL") {
    pitchConditions.push("FULL", "HALF_A", "HALF_B");
  } else if (pitchOption === "HALF_A") {
    pitchConditions.push("FULL", "HALF_A");
  } else {
    pitchConditions.push("FULL", "HALF_B");
  }

  const overlapping = await prisma.booking.findMany({
    where: {
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
        { status: { in: ["APPROVED", "PENDING"] } },
        { pitchOption: { in: pitchConditions } },
        ...(excludeBookingId ? [{ id: { not: excludeBookingId } }] : []),
      ],
    },
    select: { id: true, title: true, pitchOption: true, startTime: true, endTime: true },
  });

  return {
    hasConflict: overlapping.length > 0,
    conflictingBookings: overlapping,
  };
}
