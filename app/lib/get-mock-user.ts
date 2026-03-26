import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { team: true },
  });
}
