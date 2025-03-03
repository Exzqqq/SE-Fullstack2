import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      colors: {
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF",
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCE8",
        lamaPink: "#fb6f92",
        lamaGreen: "#98C99F",
        lamaBlueLight: "#BCE6EA",
        lamaDark: "#444444",
        lamaError: "#fec9d5",
        lamahover: "#ff8ea7",
        lamared: "#E57373",
      },
    },
  },
  plugins: [],
} satisfies Config;
