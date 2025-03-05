import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import {ClerkProvider} from "@clerk/nextjs"
import ThemeProvider from "./ThemeProvider";

const inter= Inter({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Tickle",
  description: "A live chat app built with stream and clerk"
};

export default function RootLayout({
  children,
}:{
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
    <html lang="en">
      <body
        className={inter.className}>
          <main>
            <ThemeProvider>
            {children}
            </ThemeProvider>
          </main>
        </body>
    </html>
    </ClerkProvider>
  );
}
