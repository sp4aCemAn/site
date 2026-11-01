import Link from 'next/link';
import React from 'react';

interface QuickLinkItem {
  title: string;
  text: string;
  href: string;
}

interface QuickLinksSectionProps {
  links: QuickLinkItem[];
}

export default function QuickLinksSection({ links }: QuickLinksSectionProps) {
  return (
    <section className="py-12 -mt-20 z-10 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 
                         hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 
                         flex flex-col items-start space-y-3"
            >
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition">
                {link.title}
              </h3>
              <p className="text-sm text-gray-500">
                {link.text}
              </p>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}
