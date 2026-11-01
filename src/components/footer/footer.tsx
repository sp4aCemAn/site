import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaEnvelope,
  FaBluesky,
  FaGithub,
  FaXTwitter,
  FaLinkedinIn
} from 'react-icons/fa6';
import type { Socials } from '@/data/siteConfig';

interface FooterProps {
  siteName: string;
  socials: Socials;
}

interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
}

export default function Footer({ siteName, socials }: FooterProps) {
  const links: SocialLink[] = [
    socials.githubUrl && { href: socials.githubUrl, label: 'GitHub', icon: <FaGithub size={20} />, external: true },
    socials.twitterUrl && { href: socials.twitterUrl, label: 'Twitter / X', icon: <FaXTwitter size={20} />, external: true },
    socials.linkedinUrl && { href: socials.linkedinUrl, label: 'LinkedIn', icon: <FaLinkedinIn size={20} />, external: true },
    socials.facebookUrl && { href: socials.facebookUrl, label: 'Facebook', icon: <FaFacebookF size={20} />, external: true },
    socials.instagramUrl && { href: socials.instagramUrl, label: 'Instagram', icon: <FaInstagram size={20} />, external: true },
    socials.tiktokUrl && { href: socials.tiktokUrl, label: 'TikTok', icon: <FaTiktok size={20} />, external: true },
    socials.blueskyUrl && { href: socials.blueskyUrl, label: 'Bluesky', icon: <FaBluesky size={20} />, external: true },
    socials.email && { href: `mailto:${socials.email}`, label: 'Email', icon: <FaEnvelope size={20} /> }
  ].filter(Boolean) as SocialLink[];

  return (
    <footer className="py-8 border-t-2 bg-brand-color1 border-t-inferno">
      <div className='container mx-auto px-6 flex flex-col justify-between items-start'>

        {/* Socials */}
        <div className="flex space-x-6 mb-4">
          {links.map(({ href, label, icon, external }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="text-white hover:text-inferno transition-colors"
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {icon}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-left text-white text-sm">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
