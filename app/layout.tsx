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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tx-expliner.vercel.app"),
  title: {
    default: "FiscalQuant | AI-Powered Government Budget Explainer & Simulator",
    template: "%s | FiscalQuant",
  },
  description:
    "Explore, simulate, and understand government budget allocations with interactive data visualizers and real-time AI explanations.",
  keywords: [
    "Government Budget",
    "Union Budget India",
    "Fiscal Policy Visualizer",
    "Budget Simulator",
    "AI Financial Analysis",
    "Tax Explainer",
  ],
  openGraph: {
    title: "FiscalQuant | AI-Powered Government Budget Explainer & Simulator",
    description:
      "Explore, simulate, and understand government budget allocations with interactive data visualizers and real-time AI explanations.",
    url: "/",
    siteName: "FiscalQuant",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FiscalQuant | AI-Powered Government Budget Explainer & Simulator",
    description:
      "Explore, simulate, and understand government budget allocations with interactive visualizers and AI explanations.",
  },
  icons: {
    icon: [{ url: "/icon.avif", type: "image/avif" }],
    shortcut: ["/icon.avif"],
    apple: ["/icon.avif"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8055483943832059"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/icon.avif" type="image/avif" />
        <link rel="shortcut icon" href="/icon.avif" type="image/avif" />
        <link rel="apple-touch-icon" href="/icon.avif" />
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



