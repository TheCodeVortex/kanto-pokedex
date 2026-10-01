import type { Metadata } from "next";
import { geistMono, geistSans } from "@/shared/presentation/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokédex | Gotta know 'em all",
  description:
    "Stats, types, abilities and evolutions for every Pokémon, all in one fast Pokédex.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
