import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "바다온 | 수온 기반 어종 분포 지도",
  description: "대한민국 영해의 수온대별 대표 어종 분포를 탐색하는 교육용 지도입니다.",
  openGraph: {
    title: "바다온 | 수온 기반 어종 분포 지도",
    description: "수온을 따라 대한민국 영해의 대표 어종을 탐색해 보세요.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "바다온 | 수온 기반 어종 분포 지도",
    images: ["/og.png"],
  },
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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
