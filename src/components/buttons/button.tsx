import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;                      // If this exists, it becomes a Link
  onClick?: () => void;               // If this exists (and no href), it's a Button
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "outline" | "danger" | "refined" | "header" | "hidden";
  className?: string;
  external?: boolean;                 // Force a standard <a> tag (good for external links)
}

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  external = false
}) => {

  // 1. The styling is identical for both Buttons and Links


  const variants = {
    primary: `
      bg-btn-base-start-primary text-black text-[11px] font-medium tracking-[0.25em] uppercase 
      shadow-md transition-all duration-300 
      hover:bg-btn-hover-start-primary hover:-translate-y-0.5
      active:scale-[0.98] 
      rounded-sm
    `,
    secondary: `
      bg-brand-color1 text-white border border-white text-[11px] font-medium tracking-[0.25em] uppercase 
      shadow-md transition-all duration-300 
      hover:bg-btn-hover-start-secondary 
      active:scale-[0.98] 
      rounded-sm
    `,
    mobile: "p-2 text-brand-color2 hover:bg-brand-color2/10 transition-colors",
    outline: "border-2 border-white text-white hover:bg-white/5",
    danger: `
      bg-btn-base-start-danger text-black text-[11px] font-medium tracking-[0.25em] uppercase 
      shadow-md transition-all duration-300 
      hover:bg-btn-hover-start-danger hover:-translate-y-0.5
      active:scale-[0.98] 
      rounded-sm
    `,
    refined: `
      bg-brand-color1 text-white border border-white/40 text-[11px] font-medium tracking-[0.25em] uppercase 
      shadow-md transition-all duration-300 
      hover:shadow-lg hover:-translate-y-0.5
      active:scale-[0.98] 
      rounded-sm
    `,
    header: "px-4 flex justify-center items-center bg-transparent border-t-2 border-black border-x border-black text-base text-white transition-all duration-300 hover:border-t-inferno",
    hidden: "text-white/60 hover:text-white transition"
  };
  const combinedStyles = `${variants[variant]} ${className} `;

  // 2. CASE A: It's an External Link (e.g., https://google.com)
  // We use a standard <a> tag to avoid Next.js routing logic
  if (href && (external || href.startsWith('http'))) {
    return (
      <a
        href={href}
        className={combinedStyles}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  // 3. CASE B: It's an Internal Link (e.g., /about)
  // We use Next.js <Link> for instant page loads
  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  // 4. CASE C: It's a regular Button (e.g., Form Submit)
  return (
    <button type={type} onClick={onClick} className={combinedStyles}>
      {children}
    </button>
  );
};

export default Button;
