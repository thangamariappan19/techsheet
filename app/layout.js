import "../styles/globals.css";
import { ThemeProvider } from "../Components/ThemeProvider";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
    title: "TechSheet - Modern Developer Hub",
    description: "Tech blogs and articles on various topics related to Software Development",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <div className="flex min-h-screen flex-col">
                        <Navbar />
                        <main className="flex-1 pt-20">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
