import React from 'react';
import MarkdownField from '@/components/text/mdfield'
// Define the shape of the data this component expects
interface AboutSectionProps {
  title: string;
  paragraphs: string[];
}
export default function AboutSection({ title, paragraphs }: AboutSectionProps) {
  return (
    <section id="about" className="py-12 bg-gray-50 scroll-smooth">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">

          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          <MarkdownField content={paragraphs} />

        </div>
      </div>
    </section>
  );
}
