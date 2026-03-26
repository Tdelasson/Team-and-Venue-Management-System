import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.spectatorInterest.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  // Create teams
  const CSSC = await prisma.team.create({
    data: { name: "CSSC", clubColor: "#1D3557" },
  });
  const cbsLions = await prisma.team.create({
    data: { name: "CBS Lions", clubColor: "#E63946" },
  });
  const kuBears = await prisma.team.create({
    data: { name: "KU Bears", clubColor: "#2A9D8F" },
  });
  const dtuWolves = await prisma.team.create({
    data: { name: "DTU Wolves", clubColor: "#E9C46A" },
  });

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: "Admin Anders",
      email: "admin@campus.dk",
      role: "ADMIN",
    },
  });

  const coachCSSC = await prisma.user.create({
    data: {
      name: "Træner Allias",
      email: "allias@CSSC.dk",
      role: "COACH",
      teamId: CSSC.id,
    },
  });

  const coachCBS = await prisma.user.create({
    data: {
      name: "Træner Camilla",
      email: "camilla@cbs.dk",
      role: "COACH",
      teamId: cbsLions.id,
    },
  });

  const coachKU = await prisma.user.create({
    data: {
      name: "Træner Kim",
      email: "kim@ku.dk",
      role: "COACH",
      teamId: kuBears.id,
    },
  });

  const coachDTU = await prisma.user.create({
    data: {
      name: "Træner Diana",
      email: "diana@dtu.dk",
      role: "COACH",
      teamId: dtuWolves.id,
    },
  });

  const playerCSSC = await prisma.user.create({
    data: {
      name: "Spiller Kage",
      email: "kage@CSSC.dk",
      role: "PLAYER",
      teamId: CSSC.id,
    },
  });

  const playerCBS = await prisma.user.create({
    data: {
      name: "Spiller Magnus",
      email: "magnus@cbs.dk",
      role: "PLAYER",
      teamId: cbsLions.id,
    },
  });

  const spectator = await prisma.user.create({
    data: {
      name: "Tilskuer Lise",
      email: "lise@campus.dk",
      role: "SPECTATOR",
    },
  });

  console.log("Seed data created successfully!");
  console.log(`  - 4 teams`);
  console.log(`  - 8 users (1 admin, 4 coaches, 2 players, 1 spectator)`);
  console.log(`  - 0 bookings (create them from the UI)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
