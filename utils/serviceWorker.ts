export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw Error("Service workers are not supported by this browser");
  }
  const registration = await navigator.serviceWorker.register(
    "/serviceWorker.js",
    {
      scope: "/",
    }
  );
  console.log("Service Worker registered successfully:", registration);
}

export async function getReadyServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw Error("Service workers are not supported by this browser");
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    console.log("Service Worker ready and active:", registration.active);
    return registration;
  } catch (error) {
    console.error("Service Worker is not ready:", error);
  }
}
