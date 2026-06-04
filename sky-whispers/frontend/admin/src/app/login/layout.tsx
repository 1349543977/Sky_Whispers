import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - 云端气象局 Admin",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
