import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="blog-container">
      <ul className="blog-list">
        {posts.map(({ slug, frontmatter }) => (
          <li key={slug} className="blog-item">
            <Link href={`/blog/${slug}`} className="blog-link">
              <h2 className="blog-post-title">{frontmatter.title}</h2>
              <p className="blog-post-meta">
                {new Date(frontmatter.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}{" "}
                • {frontmatter.readTime}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
