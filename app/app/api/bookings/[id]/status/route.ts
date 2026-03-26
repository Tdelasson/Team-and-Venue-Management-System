import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMockUser } from "@/lib/get-mock-user";
import { checkPitchConflict } from "@/lib/booking-conflicts";
import type { PitchOption } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getMockUser(request);
  if (!user) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking ikke fundet" }, { status: 404 });
  }

  const body = await request.json();
  const { status } = body;

  if (status === "APPROVED" || status === "REJECTED") {
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Kun admins kan godkende/afvise" }, { status: 403 });
    }
    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Kan kun godkende/afvise ventende bookinger" }, { status: 400 });
    }

    if (status === "APPROVED") {
      const conflict = await checkPitchConflict(
        booking.pitchOption as PitchOption,
        booking.startTime,
        booking.endTime,
        booking.id
      );
      if (conflict.hasConflict) {
        return NextResponse.json(
          { error: "Banen er allerede booket i dette tidsrum", conflicts: conflict.conflictingBookings },
          { status: 409 }
        );
      }
    }
  } else if (status === "CONDUCTED") {
    if (booking.createdByUserId !== user.id) {
      return NextResponse.json({ error: "Kun opretteren kan markere som gennemført" }, { status: 403 });
    }
    if (booking.status !== "APPROVED") {
      return NextResponse.json({ error: "Kun godkendte bookinger kan markeres som gennemført" }, { status: 400 });
    }
    if (booking.type !== "TRAINING") {
      return NextResponse.json({ error: "Kun træninger kan markeres som gennemført" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      team: true,
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}
