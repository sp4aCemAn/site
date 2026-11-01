import React from 'react';

interface LeftAlTextProp {
  title: string;
  content: string[];
}

export default function LeftAlText({ title, content }: LeftAlTextProp) {
  return (
    // UPDATED CLASSES:
    // md:w-5/8   -> Keeps width at 62.5% (same as image)
    // md:mx-0    -> Resets margins so the block sits on the LEFT
    // md:text-left -> Aligns the actual text inside the block to the LEFT
    <div className="w-full text-center md:text-left md:w-5/8 md:mx-0">

      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        {title}
      </h2>

      <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
        {content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

    </div>
  );
}
