import "../styles/globals.css";
import { ThemeProvider } from "../Components/ThemeProvider";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ChatWidget from "../Components/ChatWidget";
import GoogleAnalytics from "../Components/GoogleAnalytics";
import { Inter } from "next/font/google";

const ADSENSE_PUBLISHER_ID = "ca-pub-6762060430561818";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const BASE_URL = "https://techsheet.vercel.app";

export const metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "TechSheet - Modern Developer Hub",
        template: "%s | TechSheet",
    },
    description: "Daily tech blogs on frontend architecture, AI, and software engineering for senior developers. Written by architects, powered by real news.",
    keywords: ["frontend architecture", "react", "next.js", "typescript", "AI", "software engineering", "tech blog", "developer resources"],
    authors: [{ name: "Thanga Mariappan" }],
    creator: "Thanga Mariappan",
    publisher: "TechSheet",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: BASE_URL,
        siteName: "TechSheet",
        title: "TechSheet - Modern Developer Hub",
        description: "Daily tech blogs on frontend architecture, AI, and software engineering for senior developers.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "TechSheet - Modern Developer Hub",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "TechSheet - Modern Developer Hub",
        description: "Daily tech blogs on frontend architecture, AI, and software engineering.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    // Replace with your actual Google Search Console verification code
    // Get it at: https://search.google.com/search-console
    // verification: { google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE" },
    alternates: {
        types: {
            "application/rss+xml": `${BASE_URL}/feed.xml`,
        },
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="alternate" type="application/rss+xml" title="TechSheet RSS Feed" href={`${BASE_URL}/feed.xml`} />
                {/* AdSense script in <head> so crawlers can detect it */}
                <script
                    async
                    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
                    crossOrigin="anonymous"
                />
            </head>
            <body className={`${inter.variable} font-sans antialiased`}>
                <GoogleAnalytics />
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <div className="flex min-h-screen flex-col">
                        <Navbar />
                        <main className="flex-1 pt-20">
                            {children}
                        </main>
                        <Footer />
                        <ChatWidget />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
