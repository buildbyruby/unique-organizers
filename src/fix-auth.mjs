import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  })

  console.log("SUCCESS: Admin user created/updated!")
  console.log("Email: admin@test.com")
  console.log("Password: admin123")
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())