import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";
import { PushSubscription } from "web-push";

export async function POST(req: Request) {
  try {
    const newSubscription: PushSubscription | undefined = await req.json(); //this is returned in json.stringified format

    if (!newSubscription) {
      return NextResponse.json(
        { error: "Missing push subscription in body " },
        { status: 400 }
      );
    }
    // To add a new subscription
    console.log("Received push subscription to add: ", newSubscription);

    const user = await currentUser();
    const { sessionId } = auth();

    if (!user || !sessionId) {
      return NextResponse.json(
        { error: "User not authencated" },
        { status: 401 }
      );
    }

    const userSubscriptions = user.privateMetadata.subscriptions || [];

    //before adding a new subscription we need to make sure that it doesn't already have a subsription... if Yes then we remove the previous one

    const updatedSubscriptions = userSubscriptions.filter(
      (subscription) => subscription.endpoint !== newSubscription.endpoint
    );

    updatedSubscriptions.push({ ...newSubscription, sessionId });

    await clerkClient.users.updateUser(user.id, {
      privateMetadata: { subscriptions: updatedSubscriptions }, 
    });

    return NextResponse.json(
      { message: "Push subscription saved " },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const subscriptionToDelete: PushSubscription | undefined = await req.json();

    if (!subscriptionToDelete) {
      return NextResponse.json(
        { error: "Missing push subscription in body " },
        { status: 400 }
      );
    }
    console.log("Received push subscribtion to delete: ", subscriptionToDelete);

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const userSubscriptions = user.privateMetadata.subscriptions || [];

    const updatedSubscriptions = userSubscriptions.filter(
      (subscription) => subscription.endpoint !== subscriptionToDelete.endpoint
    );

    await clerkClient.users.updateUser(user.id, {
      privateMetadata: { subscriptions: updatedSubscriptions },
    });

    return NextResponse.json(
      { message: "Push subscription deleted " },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
