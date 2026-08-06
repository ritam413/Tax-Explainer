import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { Agentation } from "agentation";
import { AppProviders } from "@/components/providers/AppProviders";
import { AuthModal } from "@/components/ui/AuthModal";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tx Expliner | Government Budget Visualizer",
  description: "Interactive AI-powered government budget explainer and snapshot dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme_preference');
                  var theme = localTheme === 'light' ? 'light' : 'dark';
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <AppProviders>
          {children}
          <AuthModal />
        </AppProviders>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}



