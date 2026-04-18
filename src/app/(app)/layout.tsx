import Navbar from "@/components/layout/Navbar";
import BottomTabBar from "@/components/layout/BottomTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/*
        Mobile: pt-16 accounts for the fixed top bar (48px + gap)
        Mobile: pb-24 accounts for the fixed bottom tab bar (64px + safe area + gap)
        Desktop: no extra padding needed — navbar is sticky in flow
      */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:pt-6 pt-16 pb-28 md:pb-8">
        {children}
      </main>

      <BottomTabBar />
    </div>
  );
}
