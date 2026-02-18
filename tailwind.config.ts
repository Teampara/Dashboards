import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paraspect: {
          navy: "#111827",
          teal: "#14B8A6",
          sky: "#0EA5E9",
          amber: "#F59E0B",
          lilac: "#A78BFA"
        }
      }
    }
  },
  plugins: []
};

export default config;
