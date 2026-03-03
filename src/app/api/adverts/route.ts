import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Force Next.js to always fetch fresh data, never cached versions
export const dynamic = "force-dynamic";

/**
 * GET: Fetches all marketing assets for the Admin Dashboard.
 * This powers the "Active Transmissions" list in your UI.
 */
export async function GET() {
  try {
    const adverts = await prisma.advert.findMany({
      orderBy: [
        { priority: 'desc' }, // Higher priority shows first
        { createdAt: 'desc' }  // Then newest first
      ],
    });

    return NextResponse.json(adverts);
  } catch (error) {
    console.error("CRITICAL_API_ERROR [ADVERTS_GET]:", error);
    return NextResponse.json(
      { error: "Failed to sync with satellite database" }, 
      { status: 500 }
    );
  }
}

/**
 * NOTE: We use Server Actions (actions.ts) for POST, PUT, and DELETE 
 * to take advantage of type safety and easier revalidation. 
 * This GET route exists specifically to hydrate the Client-side Admin list.
 */