import type { Metadata } from "next";
import { Jua } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DietProvider } from "@/contexts/DietContext";
import AppShell from "@/components/layout/AppShell";

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "빼빼 - 다이어트 친구",
  description: "귀여운 AI 운동 친구와 함께하는 다이어트 도우미",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${jua.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <DietProvider>
            <AppShell>{children}</AppShell>
          </DietProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
