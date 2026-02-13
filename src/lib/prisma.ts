import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  // Configure the PG Pool to handle Supabase's SSL requirements
  const pool = new pg.Pool({ 
    connectionString,
    ssl: {
      // This specifically addresses the "self-signed certificate in certificate chain" error
      rejectUnauthorized: false 
    }
  })
  
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma