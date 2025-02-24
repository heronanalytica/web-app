import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src/app/content/blog');

// Get all blog posts
export const getAllPosts = () => {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog directory not found: ${BLOG_DIR}`);
    return []; // Return an empty array if the directory doesn't exist
  }

  const files = fs.readdirSync(BLOG_DIR);

  return files.map((filename) => {
    const slug = filename.replace('.md', '');
    const markdown = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
    const { data: frontmatter } = matter(markdown);

    return {
      slug,
      frontmatter,
    };
  });
};

// Get a single blog post
export const getPostBySlug = async (slug: string) => {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const markdown = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(markdown);

  return {
    frontmatter,
    content,
  };
};

