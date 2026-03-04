import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ICN 대회 운영 MVP",
  description: "대회 홍보/신청/운영 백오피스 MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
