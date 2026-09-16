const BASE_URL = "https://techsheet.vercel.app";

export const metadata = {
    title: "Contact",
    description: "Get in touch with Thanga Mariappan Pandian — Senior Front-End Architect and creator of TechSheet.",
    alternates: { canonical: `${BASE_URL}/contact` },
    openGraph: {
        title: "Contact | TechSheet",
        description: "Reach out to Thanga Mariappan Pandian for collaboration, feedback, or questions about TechSheet.",
        url: `${BASE_URL}/contact`,
    },
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tight mb-4">Contact</h1>
                <p className="text-muted-foreground text-lg">
                    Have a question, feedback, or want to collaborate? I&apos;d love to hear from you.
                </p>
            </div>

            <div className="space-y-8">
                <section className="border rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-bold">Thanga Mariappan Pandian</h2>
                    <p className="text-muted-foreground">
                        Senior Front-End Architect with 10+ years of experience in React, Next.js, TypeScript, and AI systems. Creator of TechSheet.
                    </p>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold w-20">Email</span>
                            <a
                                href="mailto:thangamariappancse@gmail.com"
                                className="text-primary hover:underline"
                            >
                                thangamariappancse@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold w-20">Twitter</span>
                            <a
                                href="https://twitter.com/iamthangam"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                @iamthangam
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold w-20">LinkedIn</span>
                            <a
                                href="https://linkedin.com/in/thangamariappan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                linkedin.com/in/thangamariappan
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-semibold w-20">GitHub</span>
                            <a
                                href="https://github.com/thangam"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                github.com/thangam
                            </a>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold">What I can help with</h2>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                        <li>Frontend architecture consulting and code reviews</li>
                        <li>Speaking engagements and technical writing</li>
                        <li>Guest posts and content collaboration on TechSheet</li>
                        <li>Feedback on articles or suggestions for new topics</li>
                        <li>General questions about React, Next.js, or AI engineering</li>
                    </ul>
                </section>

                <section className="bg-muted/40 rounded-xl p-6">
                    <p className="text-sm text-muted-foreground">
                        For advertising or partnership inquiries, please email{" "}
                        <a href="mailto:thangamariappancse@gmail.com" className="text-primary hover:underline">
                            thangamariappancse@gmail.com
                        </a>{" "}
                        with the subject line <strong>&quot;Partnership — TechSheet&quot;</strong>.
                    </p>
                </section>
            </div>
        </div>
    );
}
