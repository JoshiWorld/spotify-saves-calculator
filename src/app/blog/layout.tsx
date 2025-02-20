import { BlogHeader } from "../_components/blog/blog-header";
import { Footer } from "../_components/landing/footer";

export default function BlogLayout({
  children,
}: Readonly<{ children: React.ReactNode; params: { id: string } }>) {
  return (
    <div>
        <BlogHeader />
        {children}
        <Footer />
    </div>
  );
}