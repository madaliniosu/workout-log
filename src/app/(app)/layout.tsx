import { SideNav } from '@/components/side-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <SideNav />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
