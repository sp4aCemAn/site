import React from 'react';
import { PublicImage } from '@/utils/getImage';
interface ImageGalleryProps {
  images: { src: string; alt: string }[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-10">
      {images.map((image, index) => (
        <div key={index} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition duration-300 h-48">
          <PublicImage 
            src={image.src} 
            alt={image.alt} 
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]" 
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;