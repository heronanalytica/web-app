import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";
import { formatDate } from "@/lib";

type BlogPostProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost(props: BlogPostProps) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) return notFound();

  return (
    <div className="blog-container" style={{ padding: "16px" }}>
      <p style={{ color: "#7f7f7f", marginBottom: "20px" }}>
        {formatDate(post.frontmatter.date)}• {post.frontmatter.readTime}
      </p>
      <h1 style={{ fontSize: "3rem", marginBottom: "60px" }}>
        {post.frontmatter.title}
      </h1>

      {/* Cover Image with Responsive Styles */}
      <div style={{ maxWidth: "100%", boxSizing: "border-box" }}>
        <img
          src={post.frontmatter.coverImage}
          alt={post.frontmatter.title}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            display: "block",
          }}
        />
      </div>

      {/* ReactMarkdown with Custom Image Rendering */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: (props) => (
            <img
              {...props}
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
                margin: "16px auto",
              }}
            />
          ),
        }}
      >
        {post.content}
      </ReactMarkdown>
    </div>
  );
}
