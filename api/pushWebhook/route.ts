import { NextResponse } from "next/server";
import { StreamPushEvent } from "./StreamPushEvent";

import { clerkClient } from "@clerk/nextjs/server";
import webPush, { WebPushError } from "web-push";
import { env } from "@/env";
import { StreamChat } from "stream-chat";

export async function POST(req: Request) {
  try {
    // Check if environment variables are present
    if (!env.NEXT_PUBLIC_STREAM_KEY || !env.STREAM_SECRET) {
      throw new Error("Stream API keys are missing in environment variables");
    }
    if (!env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || !env.WEB_PUSH_PRIVATE_KEY) {
      throw new Error("Web Push keys are missing in environment variables");
    }

    // Initialize Stream client
    const streamClient = StreamChat.getInstance(
      env.NEXT_PUBLIC_STREAM_KEY,
      env.STREAM_SECRET
    );

    const rawBody = await req.text();

    // Validate the webhook signature
    const signature = req.headers.get("x-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing x-signature header" }, { status: 400 });
    }

    const validRequest = streamClient.verifyWebhook(rawBody, signature);
    

    if (!validRequest) {
      return NextResponse.json(
        { error: "Webhook signature invalid" },
        { status: 401 }
      );
    }

    // Parse the event data
    const event: StreamPushEvent = JSON.parse(rawBody);
    console.log("Push Webhook Body: ", JSON.stringify(event));

    const sender = event.user;
    const recipientIds = event.channel.members
      .map((member) => member.user_id)
      .filter((id) => id !== sender.id);
    const channelId = event.channel.id;

    // Fetch recipient users from Clerk
    const recipients = (
      await clerkClient.users.getUserList({ userId: recipientIds })
    ).filter((user) => !user.unsafeMetadata.mutedChannels?.includes(channelId));
    console.log("Recipient list:", recipients);
    console.log("Preparing to send notifications...");


    // Prepare push notification promises
    const pushPromises = recipients.flatMap((recipient) => {
      const subscriptions = recipient.privateMetadata.subscriptions || [];
      return subscriptions.map((subscription) =>
        webPush
          .sendNotification(
            subscription,
            JSON.stringify({
              title: sender.name || "New Message",
              body: event.message?.text || "You have a new message",
              icon: sender.image || "/default-icon.png",
              image:
                event.message?.attachments?.[0]?.image_url ||
                event.message?.attachments?.[0]?.thumb_url,
              channelId,
            }),
            {
              vapidDetails: {
                subject: "mailto:sheetanshu@tickle.com",
                publicKey: env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
                privateKey: env.WEB_PUSH_PRIVATE_KEY,
              },
            }
          )
          .catch((error) => {
            console.error("Error sending push notification: ", error);
            if (error instanceof WebPushError && error.statusCode === 410) {
              console.log("Push subscription expired, deleting...");

              // Remove expired subscriptions
              clerkClient.users.updateUser(recipient.id, {
                privateMetadata: {
                  subscriptions: recipient.privateMetadata.subscriptions?.filter(
                    (s) => s.endpoint !== subscription.endpoint
                  ),
                },
              });
            }
          })
      );
    }).flat();
   console.log("pushPromises");


    // Wait for all push notifications to be sent
    await Promise.all(pushPromises);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
