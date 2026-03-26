"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";

export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const institute = String(formData.get("institute") ?? "").trim();
  const numberOfPlayers = Number(formData.get("numberOfPlayers"));
  const numberOfFans = Number(formData.get("numberOfFans"));

  if (!name || !institute) {
    throw new Error("Navn og institut skal udfyldes.");
  }

  if (
    !Number.isInteger(numberOfPlayers) ||
    !Number.isInteger(numberOfFans) ||
    numberOfPlayers < 0 ||
    numberOfFans < 0
  ) {
    throw new Error("Antal spillere og antal fans skal vaere ikke-negative heltal.");
  }

  await prisma.$executeRaw`
    INSERT INTO Team (name, institute, numberOfPlayers, numberOfFans)
    VALUES (${name}, ${institute}, ${numberOfPlayers}, ${numberOfFans})
  `;

  revalidatePath("/hold");
  redirect("/hold");
}
