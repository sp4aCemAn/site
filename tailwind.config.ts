import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 1. THIS IS THE MISSING PIECE
      colors: {
        // Now classes like 'bg-brand-blue' or 'text-brand-blue2' will work
        'brand-blue': 'var(--brand-blue)',
        'brand-blue2': 'var(--brand-blue2)',
        'brand-dark': 'var(--dark-blue3)', // Mapped to the --dark-blue3 I saw in your CSS
        'brand-blue-light': 'var(--brand-blue-light)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    // This is the magic line that makes prose/markdown work:
    typography,
  ],
};
export default config;
