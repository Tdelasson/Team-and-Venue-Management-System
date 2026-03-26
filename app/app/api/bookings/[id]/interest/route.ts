import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/get-mock-user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user || user.role !== "SPECTATOR") {
    return NextResponse.json({ error: "Kun tilskuere kan markere interesse" }, { status: 403 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking ikke fundet" }, { status: 404 });
  }

  if (booking.type !== "MATCH") {
    return NextResponse.json({ error: "Kun kampe kan have tilskuerinteresse" }, { status: 400 });
  }

  if (booking.status !== "APPROVED") {
    return NextResponse.json({ error: "Kan kun vise interesse for godkendte bookinger" }, { status: 400 });
  }

  const existing = await prisma.spectatorInterest.findUnique({
    where: { userId_bookingId: { userId: user.id, bookingId: id } },
  });

  if (existing) {
    await prisma.spectatorInterest.delete({ where: { id: existing.id } });
    return NextResponse.json({ interested: false });
  } else {
    await prisma.spectatorInterest.create({
      data: { userId: user.id, bookingId: id },
    });
    return NextResponse.json({ interested: true });
  }
}
