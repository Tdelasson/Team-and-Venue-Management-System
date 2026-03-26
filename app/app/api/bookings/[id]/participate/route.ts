import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/get-mock-user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user || user.role !== "PLAYER") {
    return NextResponse.json({ error: "Kun spillere kan tilmelde sig" }, { status: 403 });
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking ikke fundet" }, { status: 404 });
  }

  if (booking.status !== "APPROVED") {
    return NextResponse.json({ error: "Kan kun tilmelde sig godkendte bookinger" }, { status: 400 });
  }

  if (user.teamId !== booking.teamId) {
    return NextResponse.json({ error: "Du kan kun tilmelde dig dit eget holds bookinger" }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  if (!["ATTENDING", "NOT_ATTENDING"].includes(status)) {
    return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
  }

  const participation = await prisma.participation.upsert({
    where: {
      userId_bookingId: { userId: user.id, bookingId: id },
    },
    create: {
      userId: user.id,
      bookingId: id,
      status,
    },
    update: { status },
  });

  return NextResponse.json(participation);
}
