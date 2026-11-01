
import React from 'react';
interface MapEmbedProps {
  embedSrc: string | undefined;
}

export default function MapEmbed({ embedSrc }: MapEmbedProps) {
  return (
    // 1. Use relative/absolute positioning for precise control if needed,
    // but primarily ensure the container stretches.
    <section className="relative w-full h-full">
      {/* 2. This inner div should also use h-full to stretch vertically */}
      <div className="relative w-full h-full"> {/* <-- IMPORTANT: You MUST define a height here or on an ancestor! */}
        {embedSrc ? (
          // 3. Apply the full stretching classes directly to the iframe
          <iframe
            title="Embedded Map"
            src={embedSrc}
            className="w-full h-full block" // Use Tailwind classes for width/height and position it absolutely
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          // If no link, this paragraph should also occupy space if needed.
          <div className="w-full h-full flex items-center justify-center p-4">
            No map embed link provided.
          </div>
        )}
      </div>
    </section>
  );
}

