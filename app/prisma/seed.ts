import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.spectatorInterest.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  console.log("Database cleared! Create users and teams from the UI.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
