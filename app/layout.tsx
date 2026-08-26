import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fontFraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Annam Kitchen — Healthy Meals, Zero Prep",
  description:
    "Affordable, healthy meal subscriptions for busy professionals, students, gym-goers, and the elderly. Fresh delivery, clean macros, ready in 2 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`bg-background ${fontSans.variable} ${fontFraunces.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider forcedTheme="light">{children}</ThemeProvider>
      </body>
    </html>
  );
}
