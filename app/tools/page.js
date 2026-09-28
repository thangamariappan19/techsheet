import PerformanceBudgetCalculator from "../../Components/PerformanceBudgetCalculator";

const BASE_URL = "https://techsheet.vercel.app";

export const metadata = {
    title: "Developer Tools — Core Web Vitals Checker | TechSheet",
    description: "Free Core Web Vitals checker: enter your LCP, INP, CLS, FCP, and TTFB metrics to get an instant pass/fail score and specific fix recommendations based on Google's thresholds.",
    alternates: {
        canonical: `${BASE_URL}/tools`,
    },
    openGraph: {
        title: "Core Web Vitals Checker — Free Performance Tool | TechSheet",
        description: "Enter your site's performance metrics and get an instant assessment with actionable fix recommendations.",
        url: `${BASE_URL}/tools`,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Core Web Vitals Checker | TechSheet",
        description: "Free tool: check your LCP, INP, CLS, FCP, TTFB against Google's thresholds and get specific fix recommendations.",
        creator: "@iamthangam",
    },
};

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
                <PerformanceBudgetCalculator />
            </div>
        </div>
    );
}
