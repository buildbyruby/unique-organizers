import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore
import pg from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  /**
   * PRODUCTION FIX: Resolve the (node:1564) SECURITY WARNING.
   * Explicitly appends verify-full to the connection string to satisfy 
   * upcoming pg driver security standards.
   */
  if (connectionString.includes("postgresql://") && !connectionString.includes("sslmode=")) {
    connectionString += connectionString.includes("?") ? "&sslmode=verify-full" : "?sslmode=verify-full";
  }

  const pool = new pg.Pool({ 
    connectionString,
    // Required for many hosted DB providers (Neon, Supabase, Aiven)
    ssl: {
      rejectUnauthorized: false 
    }
  })
  
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma