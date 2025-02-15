import { Home, Search, BookOpenText, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import { cn } from '@/lib/utils';

const PerplexicaTopNav = () => {
  const segments = useSelectedLayoutSegments();

  const navLinks = [
    {
      icon: Home,
      href: '/',
      active: segments.length === 0 || segments.includes('c'),
      label: 'Home',
    },
    {
      icon: Search,
      href: '/discover',
      active: segments.includes('discover'),
      label: 'Discover',
    },
    {
      icon: BookOpenText,
      href: '/library',
      active: segments.includes('library'),
      label: 'Library',
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-light-primary dark:bg-dark-primary border-b border-light-100 dark:border-dark-200">
      <div className="flex items-center justify-between px-4 py-2 lg:pl-24">
        <div className="flex space-x-4">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-lg transition-colors',
                link.active
                  ? 'bg-light-secondary dark:bg-dark-secondary text-black dark:text-white'
                  : 'text-black/70 dark:text-white/70 hover:bg-light-secondary dark:hover:bg-dark-secondary'
              )}
            >
              <div className="flex items-center space-x-2">
                <link.icon size={18} />
                <span className="text-sm">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/settings">
          <Settings className="cursor-pointer" />
        </Link>
      </div>
    </div>
  );
};

export default PerplexicaTopNav; 