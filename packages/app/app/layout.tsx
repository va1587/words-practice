import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@devmentor/ui/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "DevMentor — ścieżki nauki dla programistów",
    template: "%s · DevMentor",
  },
  description:
    "Uporządkowane ścieżki nauki programowania: moduły, lekcje, zadania praktyczne i śledzenie postępów.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
