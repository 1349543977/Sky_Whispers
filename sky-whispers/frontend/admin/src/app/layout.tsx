import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "云端气象局 - Admin Dashboard",
  description: "Sky Whispers Admin Dashboard - 云端气象局管理后台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main
                  className="flex-1 overflow-y-auto p-4 md:p-6 page-transition-enter"
                  style={{
                    background: "var(--sky-surface)",
                    backgroundImage: `
                      radial-gradient(ellipse at 20% 50%, rgba(126, 181, 214, 0.04) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 20%, rgba(140, 198, 165, 0.04) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 80%, rgba(242, 197, 124, 0.03) 0%, transparent 50%)
                    `,
                  }}
                >
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
