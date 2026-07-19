import "../styles/globals.css";
import { ThemeProvider } from "../Components/ThemeProvider";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ChatWidget from "../Components/ChatWidget";
import GoogleAnalytics from "../Components/GoogleAnalytics";
import Script from "next/script";
import { Inter } from "next/font/google";

const ADSENSE_PUBLISHER_ID = "ca-pub-6762060430561818";
const BASE_URL = "https://techsheet.vercel.app";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    },
    twitter: {
        card: "summary_large_image",
        title: "TechSheet - Modern Developer Hub",
        description: "Daily tech blogs on frontend architecture, AI, and software engineering.",
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
    alternates: {
        types: { "application/rss+xml": `${BASE_URL}/feed.xml` },
    },
};

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TechSheet",
    "url": BASE_URL,
    "description": "Daily tech blogs on frontend architecture, AI, and software engineering.",
    "publisher": {
        "@type": "Organization",
        "name": "TechSheet",
        "url": BASE_URL,
    },
    "potentialAction": {
        "@type": "SearchAction",
        "target": `${BASE_URL}/?search={search_term_string}`,
        "query-input": "required name=search_term_string",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
                <GoogleAnalytics />
                {/* afterInteractive = non-blocking, better Core Web Vitals & ad quality score */}
                <Script
                    async
                    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
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
