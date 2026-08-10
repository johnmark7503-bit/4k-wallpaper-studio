import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "../_components/icons";
import { PageHero, PageShell } from "../_components/page-shell";
import { getBlogPostsData } from "../_data/cms-data";

export const metadata: Metadata = {
  title: "Wallpaper & Screen Guides",
  description: "Practical guides about wallpaper resolution, AMOLED displays, desktop readability and screen setup.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPostsData();
  const [featured, ...remaining] = blogPosts;
  return (
    <PageShell>
      <PageHero eyebrow="Studio journal" title="Useful screen guides" description="Practical, original articles that help visitors choose, crop and use wallpapers more effectively." />
      <section className="contentShell blogIndex">
        <article className="featuredPost">
          <Link href={`/blog/${featured.slug}`}>
            <div className="featuredPostImage"><Image src={featured.cover} alt={featured.coverAlt} fill unoptimized priority sizes="(max-width: 900px) 100vw, 60vw" /></div>
            <div><p>{featured.category} · {featured.readTime}</p><h2>{featured.title}</h2><span>Read article <Icon name="arrow" size={18} /></span></div>
          </Link>
        </article>
        <div className="blogCardGrid">
          {remaining.map((post) => (
            <article className="blogCard" key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                <div className="blogCardImage"><Image src={post.cover} alt={post.coverAlt} fill unoptimized sizes="(max-width: 720px) 100vw, 50vw" /></div>
                <p>{post.category} · {post.readTime}</p><h3>{post.title}</h3><span>Read guide <Icon name="arrow" size={17} /></span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
