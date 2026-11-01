import React from 'react';
// 1. Import the Next.js Image component
import Image, { StaticImageData } from 'next/image';

interface RightAjPicProps {
  imageSrc: string | StaticImageData;
}

export default function RightAjPic({ imageSrc }: RightAjPicProps) {
  return (
    // UPDATED CLASSES:
    // - md:w-5/8: Keeps the width at 62.5%
    // - md:ml-auto: Pushes the component to the RIGHT side
    // - md:mr-0: Ensures it touches the right edge
    <div className="w-full mx-auto md:w-5/8 md:ml-auto md:mr-0">
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-2xl">

        <Image
          src={imageSrc}
          alt="Community landscape"
          fill
          className="object-cover"
        />

      </div>
    </div>
  );
}
