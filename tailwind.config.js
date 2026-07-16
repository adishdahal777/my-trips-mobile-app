/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                slate: {
                  50: "#f8fafc",
                  100: "#f1f5f9",
                  200: "#e2e8f0",
                  300: "#cbd5e1",
                  400: "#94a3b8",
                  500: "#64748b",
                  600: "#475569",
                  700: "#334155",
                  800: "#1e293b",
                  900: "#0f172a",
                },
                blue: {
                  500: "#3b82f6",
                  600: "#2563eb",
                  700: "#1d4ed8",
                },
                green: {
                  500: "#10b981",
                },
                coral: "#F97316",
                muted: "#64748b",
            },
        },
    },
    plugins: [],
};
