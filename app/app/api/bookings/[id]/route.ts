import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/get-mock-user";
import { checkPitchConflict } from "@/lib/booking-conflicts";
import type { PitchOption } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      team: true,
      createdBy: { select: { id: true, name: true } },
      participations: {
        include: { user: { select: { id: true, name: true } } },
      },
      spectatorInterests: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking ikke fundet" }, { status: 404 });
  }

  return NextResponse.json(booking);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking ikke fundet" }, { status: 404 });
  }

  if (booking.createdByUserId !== user.id) {
    return NextResponse.json({ error: "Kun opretteren kan redigere" }, { status: 403 });
  }

  if (!["PENDING", "APPROVED"].includes(booking.status)) {
    return NextResponse.json({ error: "Kan kun redigere ventende eller godkendte bookinger" }, { status: 400 });
  }

  const body = await request.json();
  const { title, startTime, endTime, pitchOption } = body;

  const updateData: Record<string, unknown> = {};
  if (title) updateData.title = title;

  const newStart = startTime ? new Date(startTime) : booking.startTime;
  const newEnd = endTime ? new Date(endTime) : booking.endTime;
  const newPitch = (pitchOption || booking.pitchOption) as PitchOption;

  if (startTime) updateData.startTime = newStart;
  if (endTime) updateData.endTime = newEnd;
  if (pitchOption) updateData.pitchOption = pitchOption;

  if (startTime || endTime || pitchOption) {
    const conflict = await checkPitchConflict(newPitch, newStart, newEnd, id);
    if (conflict.hasConflict) {
      return NextResponse.json(
        { error: "Banen er allerede booket i dette tidsrum", conflicts: conflict.conflictingBookings },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      team: true,
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke autoriseret" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking ikke fundet" }, { status: 404 });
  }

  if (booking.createdByUserId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ikke autoriseret til at annullere" }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
