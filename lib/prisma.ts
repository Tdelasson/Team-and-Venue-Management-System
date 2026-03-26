import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as any;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (typeof window === 'undefined') {
  globalForPrisma.prisma = prisma;
}