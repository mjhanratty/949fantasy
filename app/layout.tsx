import type { Metadata } from "next";
import { JetBrains_Mono, Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Keep font weights minimal: each weight adds dev + build work (Google CSS + font files).
// .font-display uses 800; body uses 400–600; .font-stat uses 700 (Space Grotesk).
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "949Fantasy — Fantasy intelligence for serious players",
    template: "%s | 949Fantasy",
  },
  description:
    "Premium fantasy football analytics: weekly rankings, floor and ceiling ranges, player value, start/sit intelligence, and draft value discovery — built for serious fantasy players.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${sora.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
