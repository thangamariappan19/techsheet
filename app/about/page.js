import AboutContent from "../../Components/AboutContent";

const BASE_URL = "https://techsheet.vercel.app";

export const metadata = {
    title: "About Thanga Mariappan Pandian — Senior Front-End Architect",
    description: "Thanga Mariappan Pandian is a Senior Front-End Architect with 10+ years of experience building scalable React systems, leading technical initiatives, and writing daily tech blogs on TechSheet.",
    alternates: {
        canonical: `${BASE_URL}/about`,
    },
    openGraph: {
        title: "About Thanga Mariappan Pandian — Senior Front-End Architect",
        description: "Senior Front-End Architect with 10+ years of experience in React, Next.js, TypeScript, and AI. Creator of TechSheet.",
        type: "profile",
        url: `${BASE_URL}/about`,
        images: [{ url: `${BASE_URL}/about.jpg`, width: 800, height: 800, alt: "Thanga Mariappan Pandian" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "About Thanga Mariappan Pandian — Senior Front-End Architect",
        description: "Senior Front-End Architect with 10+ years of experience in React, Next.js, and AI.",
        creator: "@iamthangam",
        site: "@iamthangam",
    },
};

const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Thanga Mariappan Pandian",
    "alternateName": ["Thanga Mariappan", "Thanga"],
    "jobTitle": "Senior Front-End Architect",
    "description": "Senior Front-End Architect with 10+ years of experience building scalable web applications, React systems, and AI-powered tools.",
    "url": `${BASE_URL}/about`,
    "image": `${BASE_URL}/about.jpg`,
    "email": "thangamariappancse@gmail.com",
    "sameAs": [
        "https://twitter.com/iamthangam",
        "https://github.com/thangamariappan19",
        "https://www.linkedin.com/in/thanga-mariappan-p/",
        "https://thangamariappan.vercel.app",
        `${BASE_URL}`,
    ],
    "knowsAbout": [
        "React", "Next.js", "TypeScript", "Frontend Architecture",
        "Software Engineering", "AI", "Web Performance", "DevOps"
    ],
    "worksFor": {
        "@type": "Organization",
        "name": "TechSheet",
        "url": BASE_URL,
    },
};

export default function AboutPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
            />
            <AboutContent />
        </>
    );
}
