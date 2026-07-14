import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PlayerBar } from "@/components/library/player-bar";
import { PlayerProvider } from "@/lib/player";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <div className="flex min-h-svh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 px-4 pt-6 pb-24 md:px-6 md:pt-8 md:pb-8">
            {children}
          </main>
          <PlayerBar />
        </div>
      </div>
    </PlayerProvider>
  );
}
