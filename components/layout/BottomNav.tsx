'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '홈', emoji: '🏠' },
  { href: '/diet', label: '식단', emoji: '🍽️' },
  { href: '/exercise', label: '운동', emoji: '💪' },
  { href: '/friends', label: '친구', emoji: '👥' },
  { href: '/settings', label: '설정', emoji: '⚙️' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all ${
                isActive
                  ? 'text-pink-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>
                {item.emoji}
              </span>
              <span className={`text-xs mt-1 font-medium`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-1 bg-pink-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
