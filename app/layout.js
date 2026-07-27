import "../styles/globals.css";
import { ThemeProvider } from "../Components/ThemeProvider";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ChatWidget from "../Components/ChatWidget";
import ConsentScripts from "../Components/ConsentScripts";
import CookieConsent from "../Components/CookieConsent";
import { Inter } from "next/font/google";

const BASE_URL = "https://techsheet.vercel.app";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "TechSheet - Modern Developer Hub by Thanga Mariappan Pandian",
        template: "%s | TechSheet",
    },
    description: "Daily tech blogs on frontend architecture, AI, and software engineering by Thanga Mariappan Pandian — Senior Front-End Architect with 10+ years of experience.",
    keywords: [
        "Thanga Mariappan Pandian", "Thanga Mariappan", "frontend architecture",
        "react", "next.js", "typescript", "AI", "software engineering",
        "tech blog", "developer resources", "senior front-end architect",
    ],
    authors: [{ name: "Thanga Mariappan Pandian", url: "https://thangamariappan.vercel.app" }],
    creator: "Thanga Mariappan Pandian",
    publisher: "TechSheet",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: BASE_URL,
        siteName: "TechSheet",
        title: "TechSheet - Modern Developer Hub by Thanga Mariappan Pandian",
        description: "Daily tech blogs on frontend architecture, AI, and software engineering by Thanga Mariappan Pandian.",
    },
    twitter: {
        card: "summary_large_image",
        site: "@iamthangam",
        creator: "@iamthangam",
        title: "TechSheet - Modern Developer Hub by Thanga Mariappan Pandian",
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
    "description": "Daily tech blogs on frontend architecture, AI, and software engineering by Thanga Mariappan Pandian.",
    "author": {
        "@type": "Person",
        "name": "Thanga Mariappan Pandian",
        "url": `${BASE_URL}/about`,
        "sameAs": [
            "https://twitter.com/iamthangam",
            "https://github.com/thangamariappan19",
            "https://www.linkedin.com/in/thanga-mariappan-p/",
            "https://thangamariappan.vercel.app",
        ],
    },
    "publisher": {
        "@type": "Organization",
        "name": "TechSheet",
        "url": BASE_URL,
        "logo": {
            "@type": "ImageObject",
            "url": `${BASE_URL}/opengraph-image`,
            "width": 1200,
            "height": 630,
        },
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
                {/* Google Consent Mode v2 defaults — must run before GA initializes */}
                <script dangerouslySetInnerHTML={{ __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('consent', 'default', {
                        analytics_storage: 'denied',
                        ad_storage: 'denied',
                        ad_user_data: 'denied',
                        ad_personalization: 'denied',
                        wait_for_update: 500
                    });
                    try {
                        var c = JSON.parse(localStorage.getItem('techsheet-cookie-consent') || 'null');
                        if (c) gtag('consent', 'update', {
                            analytics_storage: c.analytics ? 'granted' : 'denied',
                            ad_storage: c.advertising ? 'granted' : 'denied',
                            ad_user_data: c.advertising ? 'granted' : 'denied',
                            ad_personalization: c.advertising ? 'granted' : 'denied',
                        });
                    } catch(e) {}
                `}} />
                <ConsentScripts />
                <CookieConsent />
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
