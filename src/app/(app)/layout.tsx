import { SideNav } from '@/components/side-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <SideNav />
      <main className="flex-1 bg-[#f9f9f9] border-l border-[#e5e5e5] p-8">{children}</main>
    </div>
  );
}
