"use server"

import { hash } from 'bcryptjs'
import { redirect } from 'next/navigation'
import { createSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * PRODUCTION-READY: Handles user registration
 * Includes safety checks for Prisma initialization
 */
export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  // 1. Basic Validation
  if (!email || !password || !name) {
    console.error("Registration Failed: Missing fields");
    return; 
  }

  try {
    // 2. Debugging: This will print to your terminal (not browser)
    // It tells us if 'user' is actually available on the prisma object
    console.log("--- Debugging Prisma State ---");
    console.log("Models found in Prisma:", Object.keys(prisma));

    if (!prisma.user) {
      throw new Error("CRITICAL: 'user' model is missing from Prisma Client. Run 'npx prisma generate'.");
    }

    // 3. Check for existing user
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      redirect('/login?error=exists');
    }

    // 4. Secure Password
    const hashedPassword = await hash(password, 10);
    
    // 5. Create the User in DB
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        role: 'CLIENT' 
      }
    });

    console.log(`[SUCCESS] User created: ${user.email}`);

    // 6. Establish Session
    await createSession(user.id, user.role);

  } catch (error) {
    // Check if it's a redirect (Next.js treats redirect() as an error)
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error("DATABASE ERROR during registration:", error);
    return { success: false, message: "Server error. Please check terminal." };
  }

  // 7. Final Redirect
  redirect('/');
}