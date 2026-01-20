import { PageTransition } from "@/shared";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
