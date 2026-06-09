// src/app/api/webhooks/clerk/route.ts
// Listens to Clerk events (user.created, user.updated, user.deleted) and syncs PostgreSQL.

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET in environment variables");
    return new Response("Error: Webhook secret not configured in env.", {
      status: 500,
    });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return new Response("Error: Invalid webhook signature", {
      status: 400,
    });
  }

  // Handle events
  const eventType = evt.type;
  
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    if (!email_addresses || email_addresses.length === 0) {
      return new Response("Error: User has no email addresses", {
        status: 400,
      });
    }

    const primaryEmail = email_addresses[0].email_address;
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;

    try {
      // Sync to local PostgreSQL
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: primaryEmail,
          fullName: fullName,
        },
        create: {
          clerkId: id,
          email: primaryEmail,
          fullName: fullName,
        },
      });
      
      console.log(`Successfully synced user ${id} (${primaryEmail}) to PostgreSQL`);
      return NextResponse.json({ success: true, message: `Synced user ${id}` });
    } catch (dbErr) {
      console.error("Database sync error for Clerk webhook:", dbErr);
      return new Response("Error: Database operation failed", {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    
    if (!id) {
      return new Response("Error: Missing deleted user ID", {
        status: 400,
      });
    }

    try {
      // Find user and delete
      const user = await prisma.user.findUnique({
        where: { clerkId: id },
      });

      if (user) {
        await prisma.user.delete({
          where: { clerkId: id },
        });
        console.log(`Deleted user ${id} from PostgreSQL`);
      }
      
      return NextResponse.json({ success: true, message: `Deleted user ${id}` });
    } catch (dbErr) {
      console.error("Database delete error for Clerk webhook:", dbErr);
      return new Response("Error: Database operation failed", {
        status: 500,
      });
    }
  }

  return NextResponse.json({ success: true, message: `Ignored unhandled event: ${eventType}` });
}
