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
  themeColor: "#0c0c0e",
  colorScheme: "dark",
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
      className={`dark ${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="mizline-kds-theme"
          disableTransitionOnChange
          value={{ light: "light", dark: "dark" }}
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
