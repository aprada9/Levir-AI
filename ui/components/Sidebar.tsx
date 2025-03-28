'use client';

import { cn } from '@/lib/utils';
import { BookOpenText, Home, Search, SquarePen, Settings, FileSearch, Telescope, History, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useState, type ReactNode } from 'react';
import Layout from './Layout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/auth-helpers-nextjs';
import { useLanguage } from '@/i18n/client';

const VerticalIconContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-y-3 w-full">{children}</div>
  );
};

interface SidebarProps {
  children: React.ReactNode;
  session: Session | null;
}

const Sidebar = ({ children, session }: SidebarProps) => {
  const segments = useSelectedLayoutSegments();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const mainNavLinks = [
    {
      icon: SquarePen,
      href: '/',
      active: !segments.includes('ocr'),
      label: 'Levir AI',
      subItems: [
        {
          icon: Search,
          href: '/search',
          active: segments.includes('search'),
          label: t('nav.search'),
        },
        {
          icon: History,
          href: '/library',
          active: segments.includes('library'),
          label: t('nav.history'),
        },
        {
          icon: Telescope,
          href: '/discover',
          active: segments.includes('discover'),
          label: t('nav.discover'),
        },
      ],
    },
    {
      icon: FileSearch,
      href: '/ocr',
      active: segments.includes('ocr'),
      label: t('nav.ocr'),
      subItems: [
        {
          icon: FileSearch,
          href: '/ocr',
          active: segments.length === 1 && segments[0] === 'ocr',
          label: t('nav.ocr'),
        },
        {
          icon: History,
          href: '/ocr/history',
          active: segments.includes('history'),
          label: t('nav.ocrHistory'),
        },
      ],
    },
    {
      icon: Settings,
      href: '/settings',
      active: segments.includes('settings'),
      label: t('nav.settings'),
      subItems: [],
    },
  ];

  return (
    <div>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col items-start justify-between gap-y-5 overflow-y-auto bg-light-secondary dark:bg-dark-secondary px-4 py-8">
          <div className="w-full space-y-2">
            {mainNavLinks.map((link, i) => (
              <div key={i} className="w-full">
                <div className="flex w-full">
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center flex-grow p-3 rounded-lg transition-colors',
                      link.active
                        ? 'text-black dark:text-white bg-black/10 dark:bg-white/10'
                        : 'text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10'
                    )}
                  >
                    <link.icon size={24} />
                    <span className="ml-3">{link.label}</span>
                  </Link>
                  {link.subItems.length > 0 && (
                    <button
                      onClick={() => setExpandedItem(expandedItem === link.label ? null : link.label)}
                      className={cn(
                        'p-3 transition-colors',
                        link.active
                          ? 'text-black dark:text-white'
                          : 'text-black/70 dark:text-white/70'
                      )}
                    >
                      <svg
                        className={`h-5 w-5 transform transition-transform ${
                          expandedItem === link.label ? 'rotate-180' : ''
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {expandedItem === link.label && link.subItems.length > 0 && (
                  <div className="ml-8 mt-2 space-y-1">
                    {link.subItems.map((subItem, j) => (
                      <Link
                        key={j}
                        href={subItem.href}
                        className={cn(
                          'flex items-center p-2 rounded-lg transition-colors',
                          subItem.active
                            ? 'text-black dark:text-white bg-black/10 dark:bg-white/10'
                            : 'text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10'
                        )}
                      >
                        <subItem.icon size={18} />
                        <span className="ml-2 text-sm">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {session && (
            <button
              onClick={handleSignOut}
              className="flex items-center p-3 rounded-lg transition-colors text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 w-full mt-auto"
            >
              <LogOut size={24} />
              <span className="ml-3">{t('nav.signOut')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile bottom navigation - simplified version */}
      <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 bg-light-primary dark:bg-dark-primary px-4 py-4 shadow-sm lg:hidden">
        {mainNavLinks.map((link, i) => (
          <Link
            href={link.href}
            key={i}
            className={cn(
              'relative flex flex-col items-center space-y-1 text-center w-full',
              link.active
                ? 'text-black dark:text-white'
                : 'text-black dark:text-white/70',
            )}
          >
            {link.active && (
              <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-black dark:bg-white" />
            )}
            <link.icon />
            <p className="text-xs">{link.label}</p>
          </Link>
        ))}

        {session && (
          <button
            onClick={handleSignOut}
            className="relative flex flex-col items-center space-y-1 text-center w-full text-black/70 dark:text-white/70"
          >
            <LogOut />
            <p className="text-xs">{t('nav.signOut')}</p>
          </button>
        )}
      </div>

      <Layout>{children}</Layout>
    </div>
  );
};

export default Sidebar;
