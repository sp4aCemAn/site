import React from "react";
import Mdfield from '@/components/text/mdfield';
import { PublicImage } from '@/utils/getImage';

interface AboutPageProps {
  title: string;
  content: string[];
  imageSrc: string;
}

export default function AboutMeEditorial({
  title,
  content,
  imageSrc,
}: AboutPageProps) {
  return (
    <main className="flex-grow bg-black">
      {/* Background decoration */}
      <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Grid Layout */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">

            {/* TEXT COLUMN (Spans 7 columns) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl pb-2 mb-6 border-b-2 border-inferno">
                  {title}
                </h1>
              </div>

              {/* Content Text - Now uniform weight */}
              <div className="prose prose-lg text-white">

                <Mdfield content={content} />
              </div>
            </div>

            {/* IMAGE COLUMN (Spans 5 columns) */}
            <div className="lg:col-span-5 mt-12 lg:mt-0 relative">
              {/* Decorative colored box behind image */}
              <div className="hidden lg:block absolute top-4 left-4 w-full h-full border border-white/30 rounded-lg -z-10 transform translate-x-2 translate-y-2" />

              <div className="relative rounded-lg shadow-2xl overflow-hidden aspect-[3/4]">
                <PublicImage
                  src={imageSrc}
                  alt="Portrait"
                  fill
                  sizes="(max-width: 1024px) 90vw, 33vw"
                  className="object-cover"
                />
              </div>

              {/* Campaign Badge / Quick Stat */}

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
