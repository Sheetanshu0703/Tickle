import { POST } from "@/app/api/register-push/route";
import { getReadyServiceWorker } from "../utils/serviceWorker";
import { env } from "@/env";


export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const sw = await getReadyServiceWorker();
  if (!sw) {
    throw new Error("Service worker is not available or not ready");
  }
  return sw.pushManager.getSubscription();
}

export async function registerPushNotifications() {
  if (!("PushManager" in window)) {
    throw Error("push notification are not supported by this browser");
  }

  const existingSubscription = await getCurrentPushSubscription();

  if (existingSubscription) {
    throw Error("Existing push Subscription found");
  }

  const sw = await getReadyServiceWorker();

  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
  });

  await sendPushSubscriptionToServer(subscription);
}

export async function unregisterPushNotifications() {
  const existingSubscription = await getCurrentPushSubscription();

  if (!existingSubscription) {
    throw Error("No existing push subscription found");
  }

  await deletePushSubscriptionFromServer(existingSubscription);

  await existingSubscription.unsubscribe();
}

export async function sendPushSubscriptionToServer(
  subscription: PushSubscription
) {
  const response = await fetch("/api/register-push", {
    method: "POST",
    body: JSON.stringify(subscription)
  });

  if (!response.ok) {
    throw Error("Failed  to send  push subscription to server");
  }
}

export async function deletePushSubscriptionFromServer(
  subscription: PushSubscription
) {
  const response = await fetch("/api/register-push", {
    method: "DELETE",
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw Error("Failed  to delete push subscription from  server");
  }
}
