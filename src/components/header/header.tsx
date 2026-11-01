"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Button from "@/components/buttons/button";
import type { NavLink } from "@/data/siteConfig";

interface HeaderProps {
  navLinks: NavLink[];
  siteName: string;
}

export default function Header({ navLinks, siteName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayName = siteName || "Name";
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-brand-color1 border-b-2 border-b-inferno sticky top-0 z-50 shadow-sm w-full h-14">
      <nav className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 h-full">

        <div className="flex justify-between items-center w-full h-full">

          {/* LEFT: Logo Area */}
          <div className="flex-shrink-0 flex items-center h-full">
            <Link href="/" className="text-2xl font-bold text-white hover:opacity-80 transition-opacity">
              {displayName}
            </Link>
          </div>

          {/* RIGHT: Navigation */}
          <div className="hidden md:flex items-center h-full">
            <div className="flex items-stretch h-full space-x-2">
              {navLinks.map(({ label, href }) => (
                <Button
                  key={label}
                  href={href}
                  variant="header"
                  className="w-28 h-full flex items-center font-medium rounded-none text-sm text-bold"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center h-full z-50">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 text-white hover:bg-white/10 rounded transition-colors z-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            className="md:hidden bg-black absolute top-full left-0 w-full shadow-xl"
            style={{ borderTop: '2px solid var(--color-inferno)', borderBottom: '2px solid var(--color-inferno)' }}
          >
            <div className="flex flex-col space-y-2 w-full px-6 py-8">
              {navLinks.map(({ label, href }) => (
                <Button
                  key={label}
                  href={href}
                  variant="primary"
                  className="flex justify-center items-center py-3 block w-full text-center text-base font-medium hover:opacity-80 transition-opacity"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
