import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "果果小夥伴・猜性別",
  description: "你猜果果的小夥伴是男寶寶還是女寶寶？快來投下你的一票！",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
