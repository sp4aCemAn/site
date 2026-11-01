import Image from 'next/image';
import React from 'react';

interface ImageBannerProps {
  imageSrc: string;
  altText: string;
}

export default function ImageBanner({ imageSrc, altText }: ImageBannerProps) {
  return (
    // This div creates a full-width container for the landscape image
    <div className="w-full h-auto bg-gray-900 overflow-hidden shadow-lg">
      <Image
        src={imageSrc}
        alt={altText}
        // These dimensions help Next.js allocate space, reducing layout shift
        width={800}
        height={317}
        // object-cover ensures the image fills the container without distortion
        // max-h-96 limits the height to keep it a strong landscape/banner shape
        className="w-full h-auto max-h-[200px] object-cover"
        // This makes sure the browser treats this as important to load quickly
        priority
      />
    </div>
  );
}
