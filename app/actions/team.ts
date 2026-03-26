"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";

export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const clubColor = String(formData.get("clubColor") ?? "#000000").trim();

  if (!name) {
    throw new Error("Holdnavn skal udfyldes.");
  }

  await prisma.team.create({
    data: { name, clubColor },
  });

  revalidatePath("/hold");
  redirect("/hold");
}
