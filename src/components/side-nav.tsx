'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, BookOpen, Calendar, History, BarChart3, User } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/exercises', label: 'Exercises', icon: BookOpen },
  { href: '/calendar', label: 'Schedule', icon: Calendar },
  { href: '/history', label: 'History', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Profile', icon: User },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-[260px] shrink-0 flex-col gap-10 border-r border-[#e5e5e5] bg-white p-8">
      <div className="flex items-center gap-3">
        <Image src="/Logo-BeFitus.svg" alt="" width={32} height={32} />
        <span className="font-heading text-2xl font-extrabold text-black">BeFitus</span>
      </div>

      <div className="flex w-full flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 ${
                isActive ? 'bg-[#c8ff57]' : 'opacity-60 hover:bg-[#f9f9f9]'
              }`}
            >
              <Icon size={20} strokeWidth={2} color="#111111" />
              <span className="font-heading text-[15px] font-semibold text-[#111111]">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
