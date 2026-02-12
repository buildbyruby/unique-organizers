import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // This turns 13027737 into a secure string the app can read
  const hashedPassword = await bcrypt.hash("13027737", 10)
  
  await prisma.user.upsert({
    where: { email: 'rubykituli14@gmail.com' },
    update: { 
      password: hashedPassword, 
      role: 'ADMIN' 
    },
    create: {
      email: 'rubykituli14@gmail.com',
      password: hashedPassword,
      name: 'Ruby Kituli',
      role: 'ADMIN',
    },
  })

  console.log("✅ DONE: rubykituli14@gmail.com is now an ADMIN with password 13027737");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())