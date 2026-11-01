import React from 'react';
import { PublicImage } from '@/utils/getImage';

interface HeroBannerImageProps {
  src: string;
  alt: string;
  heightClass?: string; // Allows specifying a specific height class (e.g., "h-96")
}

const HeroBannerImage = ({ src, alt, heightClass = 'h-[500px]' }: HeroBannerImageProps) => {
  return (
    <div className={`relative overflow-hidden rounded-lg shadow-xl ${heightClass}`}>
      <PublicImage 
        src={src} 
        alt={alt} 
        fill
        className="object-cover transition duration-500 transform hover:scale-[1.03] cursor-pointer"
      />
    </div>
  );
};

export default HeroBannerImage;