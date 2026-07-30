import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient instance across the app instead of creating
// a new one per import (which would exhaust Neon's connection limit fast
// during nodemon's hot reloads in dev).
const prisma = new PrismaClient();

export default prisma;