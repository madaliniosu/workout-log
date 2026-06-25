'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/exercises', label: 'Exercises' },
  { href: '/workouts', label: 'Workouts' },
  { href: '/settings', label: 'Settings' },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0 border-r p-4 flex flex-col gap-1">
      {links.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive
                ? 'rounded px-3 py-2 text-sm font-medium bg-gray-100 text-gray-950'
                : 'rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50'
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
