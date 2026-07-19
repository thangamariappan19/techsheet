import { getAllBlogPosts } from "../Lib/Data";
import Header from "../Components/Header";
import BlogList from "./BlogList";

export const metadata = {
    title: "TechSheet - Frontend Architecture, AI & Software Engineering Blog",
    description: "Daily expert blogs on React, Next.js, TypeScript, frontend architecture, and AI for senior developers. Real code, real patterns, no fluff.",
    keywords: [
        "frontend architecture", "react tutorials", "next.js blog", "typescript tips",
        "software engineering", "AI for developers", "web performance", "tech blog",
        "developer resources", "javascript", "fullstack", "devops"
    ],
    openGraph: {
        title: "TechSheet - Frontend Architecture, AI & Software Engineering Blog",
        description: "Daily expert blogs on React, Next.js, TypeScript, and AI for senior developers.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "TechSheet - Frontend Architecture, AI & Software Engineering Blog",
        description: "Daily expert blogs on React, Next.js, TypeScript, and AI for senior developers.",
    },
};

export default async function Page() {
    const blogs = await getAllBlogPosts();

    return (
        <div className="relative isolate overflow-hidden bg-background min-h-screen">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 to-purple-600/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
                    }}
                />
            </div>
            <Header />
            <BlogList initialBlogs={blogs} />
            <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl">
                <div
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary/10 to-accent/10 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
                    }}
                />
            </div>
        </div>
    );
}
