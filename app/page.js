import { getAllBlogPosts } from "../Lib/Data";
import BlogHeader from "../Components/BlogHeader";
import Header from "../Components/Header";

export const metadata = {
    title: "TechSheet | Premium Developer Resources",
    description: "Master software development with our comprehensive tech sheets and articles.",
};

export default async function Page() {
    const blogs = await getAllBlogPosts();

    return (
        <div className="relative isolate overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
                    }}
                />
            </div>

            <Header />

            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="flex flex-col gap-12">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest TechSheets</h2>
                        <p className="max-w-2xl text-lg text-muted-foreground">
                            Deep dives into modern technologies, simplified for rapid learning and reference.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs &&
                            blogs.map((blog) => (
                                blog.data.isPublished && (
                                    <BlogHeader
                                        key={blog.data.Id}
                                        data={blog.data}
                                        content={blog.content}
                                        readTime={blog.readTime?.text || '5 min read'}
                                    />
                                )
                            ))}
                    </div>
                </div>
            </section>

            {/* Footer background decoration */}
            <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                <div
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
                    }}
                />
            </div>
        </div>
    );
}
