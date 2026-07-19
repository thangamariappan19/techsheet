export const metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for TechSheet - how we collect, use, and protect your data.",
    alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "July 19, 2026";
const SITE_URL = "https://techsheet.vercel.app";
const CONTACT_EMAIL = "thangamariappancse@gmail.com";

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tight mb-4">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
            </div>

            <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight max-w-none space-y-8">

                <section>
                    <p>
                        This Privacy Policy explains how TechSheet (<a href={SITE_URL}>{SITE_URL}</a>) collects,
                        uses, and protects information when you visit our website. By using TechSheet, you agree to
                        the practices described here.
                    </p>
                </section>

                <section>
                    <h2>1. Information We Collect</h2>
                    <h3>Automatically Collected</h3>
                    <ul>
                        <li><strong>Usage data</strong> — pages visited, time on site, referring URLs, browser type, and device type, collected via Google Analytics.</li>
                        <li><strong>Cookies</strong> — small files stored in your browser used for analytics and advertising preferences.</li>
                    </ul>
                    <h3>Provided by You</h3>
                    <ul>
                        <li><strong>Account data</strong> — if you sign in with Google, we receive your name and email address via Firebase Authentication.</li>
                        <li><strong>Comments and likes</strong> — content you submit on blog posts, stored in Firebase Firestore.</li>
                        <li><strong>Email address</strong> — if you subscribe to our newsletter.</li>
                    </ul>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <ul>
                        <li>To operate and improve the website</li>
                        <li>To understand how readers use the site (Google Analytics)</li>
                        <li>To display relevant advertisements (Google AdSense)</li>
                        <li>To enable comments and likes on posts (Firebase)</li>
                        <li>To send updates if you have subscribed (newsletter)</li>
                    </ul>
                    <p>We do not sell your personal data to third parties.</p>
                </section>

                <section>
                    <h2>3. Google Analytics</h2>
                    <p>
                        We use Google Analytics 4 to understand site traffic and reader behaviour. Google Analytics
                        sets cookies and collects anonymised usage data. You can opt out by installing the{" "}
                        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                            Google Analytics Opt-out Browser Add-on
                        </a>.
                    </p>
                    <p>
                        Google&apos;s privacy policy:{" "}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                            policies.google.com/privacy
                        </a>
                    </p>
                </section>

                <section>
                    <h2>4. Google AdSense &amp; Advertising</h2>
                    <p>
                        TechSheet displays advertisements served by Google AdSense. Google uses cookies to show ads
                        based on your prior visits to this and other websites. You can opt out of personalised
                        advertising at{" "}
                        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
                            google.com/settings/ads
                        </a>{" "}
                        or via{" "}
                        <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
                            aboutads.info
                        </a>.
                    </p>
                </section>

                <section>
                    <h2>5. Firebase</h2>
                    <p>
                        We use Google Firebase for authentication, comments, and likes. Firebase may collect
                        device and usage data as described in Google&apos;s privacy policy. Data stored in
                        Firebase (comments, likes) is associated with your Google account when you are signed in.
                    </p>
                </section>

                <section>
                    <h2>6. Cookies</h2>
                    <p>We use the following types of cookies:</p>
                    <ul>
                        <li><strong>Essential</strong> — required for the site to function (theme preference, authentication session).</li>
                        <li><strong>Analytics</strong> — Google Analytics cookies to measure site traffic.</li>
                        <li><strong>Advertising</strong> — Google AdSense cookies for ad personalisation.</li>
                    </ul>
                    <p>You can disable cookies in your browser settings, though some features may not work correctly.</p>
                </section>

                <section>
                    <h2>7. Third-Party Links</h2>
                    <p>
                        Blog posts may contain links to external websites. We are not responsible for the privacy
                        practices of those sites and encourage you to review their policies.
                    </p>
                </section>

                <section>
                    <h2>8. Data Retention</h2>
                    <p>
                        Analytics data is retained for 14 months (Google Analytics default). Firebase data
                        (comments, likes) is retained until you request deletion. We will delete your data upon
                        request.
                    </p>
                </section>

                <section>
                    <h2>9. Your Rights</h2>
                    <p>Depending on your location, you may have the right to:</p>
                    <ul>
                        <li>Access the personal data we hold about you</li>
                        <li>Request correction or deletion of your data</li>
                        <li>Opt out of analytics and advertising cookies</li>
                        <li>Lodge a complaint with your local data protection authority</li>
                    </ul>
                    <p>To exercise any of these rights, contact us at the email below.</p>
                </section>

                <section>
                    <h2>10. Children&apos;s Privacy</h2>
                    <p>
                        TechSheet is not directed at children under 13. We do not knowingly collect personal
                        information from children. If you believe a child has provided us with personal data,
                        please contact us and we will delete it.
                    </p>
                </section>

                <section>
                    <h2>11. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top
                        will reflect any changes. Continued use of TechSheet after changes constitutes acceptance
                        of the updated policy.
                    </p>
                </section>

                <section>
                    <h2>12. Contact</h2>
                    <p>
                        For any privacy-related questions or data requests, contact us at:{" "}
                        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </p>
                </section>

            </div>
        </div>
    );
}
