import Button from "@/Components/Button";

import Link  from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-1 text-6xl font-extrabold text-yellow-500">Tickle</h1>
      <p className="mb-10">The coolest chat app on the planet</p>
      <Button as={Link} href="/chat">
        Start Chatting
      </Button>
    </div>
  );
}
