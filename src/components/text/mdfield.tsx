import ReactMarkdown from 'react-markdown';
import NextImage from 'next/image';
import { getPublicPath } from '@/utils/paths';
import React from 'react';
export interface MarkdownFieldProps {
  content: string | string[];
  className?: string;
}

// Helper: Auto-fix paths and validate safe protocols
const getSafeSrc = (src: string) => {
  if (!src) return "";
  const isHttps = src.startsWith("https://");
  const isRelative = src.startsWith("/") && !src.startsWith("//");
  if (isHttps || isRelative) return src;
  if (!src.startsWith("/") && !src.startsWith("//")) return `${getPublicPath(`/${src}`)}`;
  return "";
};

// Helper: Robustly extract YouTube ID from any format
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Image Component
const StyledImage = ({ src, alt }: { src: string; alt?: string }) => {
  const safeSrc = getSafeSrc(src);
  if (!safeSrc) return null;
  return (
    <span className="my-8 w-full flex justify-center">
      <NextImage
        src={safeSrc}
        alt={alt || "Article Image"}
        width={1200}
        height={675}
        sizes="(max-width: 768px) 100vw, 1200px"
        className="rounded-xl shadow-lg max-h-[500px] w-auto h-auto object-contain bg-slate-50"
      />
    </span>
  );
};

export default function MarkdownField({ content, className = "" }: MarkdownFieldProps) {
  if (!content) return null;

  // Normalize content — NO escaping needed. Basic markdown lists (1. / - / * / +)
  // are core CommonMark and are parsed correctly by react-markdown's underlying
  // remark-parse even without remark-gfm. remark-gfm only adds tables, strikethrough,
  // task-list checkboxes, and autolinks — not basic list support.
  const validContent = Array.isArray(content)
    ? content.map(c => c.trim()).filter(Boolean).join('\n\n')
    : content;

  return (
    <div className={`max-w-3xl mx-auto px-4 ${className}`}>
      <article className="prose prose-invert prose-lg text-white leading-relaxed text-left">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="text-4xl font-extrabold mb-8 mt-10" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-6 mt-8" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-4 mt-6" {...props} />,
            h4: ({ node, ...props }) => <h4 className="text-lg font-semibold mb-3 mt-5" {...props} />,
            h5: ({ node, ...props }) => <h5 className="text-base font-semibold mb-2 mt-4" {...props} />,

            p: ({ node, ...props }) => <p className="mb-6" {...props} />,

            // THE ACTUAL FIX: Tailwind's Preflight reset sets `list-style: none` on
            // all <ol>/<ul>, which is why your numbers/bullets were invisible even
            // though the <li> elements were rendering correctly. We reapply the
            // list markers explicitly here.
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-outside pl-6 mb-6 space-y-2" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside pl-6 mb-6 space-y-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="pl-1 marker:text-white" {...props} />
            ),

            img: ({ node, ...props }) => (
              <StyledImage src={props.src as string} alt={props.alt} />
            ),
            a: ({ node, ...props }) => {
              const rawHref = props.href as string;
              if (!rawHref || rawHref.startsWith('#')) {
                return <a {...props} className="text-white hover:underline font-medium">{props.children}</a>;
              }
              const youtubeId = getYouTubeId(rawHref);
              if (youtubeId) {
                return (
                  <span className="block my-8 aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="w-full h-full border-none"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                  </span>
                );
              }
              const isSafeProtocol = rawHref.startsWith('https://') || rawHref.startsWith('/');
              const safeHref = isSafeProtocol ? rawHref : '#';
              if (/\.(jpg|png|webp|svg)$/i.test(rawHref)) {
                return <StyledImage src={rawHref} alt={String(props.children)} />;
              }
              return (
                <a
                  {...props}
                  href={safeHref}
                  className="text-white hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {props.children}
                </a>
              );
            }
          }}
        >
          {validContent}
        </ReactMarkdown>
      </article>
    </div>
  );
}
