import { PageTransition, Sidebar, ThemeSwitcher } from "@/shared";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex flex-1 flex-col bg-bg">
        <div className="absolute right-3 top-3">
          <ThemeSwitcher />
        </div>
        <div className="flex-1 overflow-auto p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
}
