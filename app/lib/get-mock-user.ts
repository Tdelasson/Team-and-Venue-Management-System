import { prisma } from "@/lib/prisma";

export async function getMockUser(request: Request) {
  const userId = request.headers.get("x-mock-user-id");
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { team: true },
  });
}
