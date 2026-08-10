import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "../../_components/icons";
import { PageShell } from "../../_components/page-shell";
import { getBlogPostData } from "../../_data/cms-data";
import { blogPosts } from "../../_data/site-data";

type BlogPostPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostData((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt, openGraph: { title: post.title, description: post.excerpt, images: [{ url: post.cover, alt: post.coverAlt }] } };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostData((await params).slug);
  if (!post) notFound();
  return (
    <PageShell>
      <article className="articlePage" id="main-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blog">Blog</Link><span>/</span><span aria-current="page">{post.title}</span></nav>
        <header className="articleHeader">
          <p className="eyebrow"><span className="eyebrowDot" /> {post.category} · {post.readTime}</p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div><span>Published {post.published}</span><span>By 4K Wallpaper Studio</span></div>
        </header>
        <div className="articleCover"><Image src={post.cover} alt={post.coverAlt} fill unoptimized priority sizes="100vw" /></div>
        <div className="articleBody">
          <div className="articleContent">
            {post.sections.map((section) => (
              <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
            ))}
          </div>
          <aside className="articleAside">
            <p className="eyebrow">Useful next step</p>
            <h2>Check your screen size</h2>
            <p>Get a wallpaper resolution recommendation using only your browser.</p>
            <Link className="primaryButton compactButton" href="/tools/screen-resolution">Open free tool <Icon name="arrow" size={17} /></Link>
          </aside>
        </div>
      </article>
    </PageShell>
  );
}
