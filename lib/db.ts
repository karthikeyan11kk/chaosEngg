import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

// This line is enough for production, but in development we need to follow these steps to prevent reimporting the Prisma client
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;