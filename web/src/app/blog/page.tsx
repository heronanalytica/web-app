import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";
import { formatDate } from "@/lib";

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
                {formatDate(frontmatter.date)}{" "}
                • {frontmatter.readTime}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
