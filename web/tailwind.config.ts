import type { Config } from "tailwindcss";

// In Tailwind v4, color tokens are defined in globals.css @theme block.
// This config only provides the content paths for class scanning.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
