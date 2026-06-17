import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PathProvider } from "@/components/path-provider";
import { GlobalThemeToggle } from "@/components/global-theme-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Mizline Staff",
  title: {
    default: "Mizline Staff",
    template: "%s | Mizline Staff",
  },
  description: "Kitchen display and store management for Mizline",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1A1210" },
    { media: "(prefers-color-scheme: dark)", color: "#080605" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="mizline-kds-theme"
          disableTransitionOnChange
        >
          <PathProvider>
            <GlobalThemeToggle />
            {children}
          </PathProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
