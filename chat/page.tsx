"use client";

import { UserButton, useUser } from "@clerk/nextjs";

import { StreamChat } from "stream-chat";

import { Chat, LoadingIndicator, Streami18n } from "stream-chat-react";
import useInitializeClient from "./useInitializeChatClient";
import Menubar from "./menubar";
import ChatChannel from "./chatChannel";
import ChatSidebar from "./ChatSidebar";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import useWindowSize from "@/hooks/useWindowSize";
import { mdBreakpoint } from "@/utils/tailwind";
import { useTheme } from "../ThemeProvider";
import { register } from "module";
import { registerServiceWorker } from "../../utils/serviceWorker";
import {
  getCurrentPushSubscription,
  sendPushSubscriptionToServer,
} from "@/notifications/pushService";
import PushMessageListener from "./PushMessageListener";

interface ChatPageProps {
  searchParams: { channelId?: string };
}

const i18Instance = new Streami18n({ language: "en" });

export default function ChatPage({
  searchParams: { channelId },
}: ChatPageProps) {
  const chatClient = useInitializeClient();
  const { user } = useUser();
  const { theme } = useTheme();

  const [chatSidebarOpen, setChatSiddebarOpen] = useState(false);

  const windowSize = useWindowSize();
  const isLargeScreen = windowSize.width >= mdBreakpoint;

  useEffect(() => {
    if (windowSize.width >= mdBreakpoint) setChatSiddebarOpen(false);
  }, [windowSize.width]);

  useEffect(() => {
    async function setUpServiceWorker() {
      try {
        await registerServiceWorker();
      } catch (error) {
        console.log(error);
      }
    }
    setUpServiceWorker();
  }, []);

  useEffect(() => {
    async function syncPushSubscription() {
      try {
        const subscription = await getCurrentPushSubscription();
        if (subscription) {
          await sendPushSubscriptionToServer(subscription);
        }
      } catch (error) {
        console.error(error);
      }
    }
    syncPushSubscription();
  }, []);

  useEffect(() => {
    if(channelId){
      history.replaceState(null,"","/chat")
    }
  }, [channelId]);


  useEffect(()=>{
    if(channelId){
      history.replaceState(null,"","/chat")
    }
  },[channelId]);

  const handleSidebarOnClose = useCallback(() => {
    setChatSiddebarOpen(false);
  }, []);

  if (!chatClient || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-black">
        <LoadingIndicator size={40} />
      </div>
    );
  }

  return (
    <div className="x1:px-20 x1:py-8 h-screen bg-gray-100 text-black dark:bg-black dark:text-white">
      <div className="m-auto flex h-full min-w-[350px] max-w-[1600px] flex-col shadow-sm">
        <Chat
          client={chatClient}
          theme={
            theme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"
          }
        >
          <div className="flex justify-center border-b border-b-[#DBDDE1] p-3 md:hidden">
            <button onClick={() => setChatSiddebarOpen(!chatSidebarOpen)}>
              {!chatSidebarOpen ? (
                <span className="flex items-center gap-1">
                  <Menu />
                  Menu
                </span>
              ) : (
                <X />
              )}
            </button>
          </div>
          <div className="flex h-full flex-row overflow-y-auto">
            <ChatSidebar
              user={user}
              show={isLargeScreen || chatSidebarOpen}
              onClose={handleSidebarOnClose}
              customActiveChannel={channelId}
            />
            <ChatChannel
              show={isLargeScreen || !chatSidebarOpen}
              hideChannelOnThread={!isLargeScreen}
            />
          </div>
          <PushMessageListener />
        </Chat>
      </div>
    </div>
  );
}
