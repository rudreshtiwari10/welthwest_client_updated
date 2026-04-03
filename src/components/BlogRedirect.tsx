import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * Redirects /blog/:slug to /blogs/:slug (Next.js SSR version).
 * This eliminates duplicate content that hurts SEO — the Next.js version
 * has proper server-side rendering, meta tags, and structured data.
 */
const BlogRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    // Use window.location for a full navigation to the Next.js app
    // (React Router can't handle this since /blogs/* is served by Next.js via Vercel rewrite)
    window.location.replace(`/blogs/${slug}`);
  }, [slug]);

  return null;
};

export default BlogRedirect;
