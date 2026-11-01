import React from 'react';
import Button from "@/components/buttons/button";
import { PublicImage } from '@/utils/getImage';
import { StaticImageData } from 'next/image';

interface AboutMeProp {
  moto: string;
  backgroundSrc?: string | StaticImageData;
  imageSrc: string | StaticImageData;
  altText: string;
  emblemSrc: string | StaticImageData;
  emblemAlt: string;
  textunderbutton: string;
  primaryLinkHref: string;
  primaryLinkLabel: string;
  secondaryLinkHref: string;
  secondaryLinkLabel: string;
}

export default function BannerAboutMe({
  moto,
  imageSrc,
  altText,
  emblemSrc,
  emblemAlt,
  textunderbutton,
  primaryLinkHref,
  primaryLinkLabel,
  secondaryLinkHref,
  secondaryLinkLabel
}: AboutMeProp) {

  return (
    <section className="relative h-[calc(90vh-34px)] w-full md:h-[94vh] lg:h-[94.6vh] bg-white flex items-center md:items-end overflow-hidden">
      {/* Background Image */}
      <PublicImage
        src={imageSrc}
        alt={altText}
        fill
        className="object-cover object-center"
        priority
      />

      {/* Subtle Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* =========================================
          MOBILE LAYOUT: Logo, Text, and CTAs 
          ========================================= */}
      <div className="absolute bottom-8 z-10 w-full flex flex-col items-center justify-end md:hidden px-6 gap-2">
        {emblemSrc && (
          <div className="w-[40vh] h-[40vh] relative drop-shadow-xl">
            <PublicImage
              src={emblemSrc}
              alt={emblemAlt}
              fill
              className="object-contain object-center"
              priority
            />
          </div>
        )}

        <div className="flex flex-col items-center w-full max-w-sm gap-1 text-center">
          <div className="flex flex-col w-full gap-4 mt-2">
            <Button
              href={primaryLinkHref}
              className="flex justify-center items-center w-full !py-3 !px-8 !text-md font-bold shadow-xl"
            >
              {primaryLinkLabel}
            </Button>

            <Button
              href={secondaryLinkHref}
              variant="secondary"
              className="flex justify-center items-center w-full !py-3 !px-8 !text-md font-bold  text-white "
            >
              {secondaryLinkLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================
          DESKTOP LAYOUT: Text Left, Emblem/Buttons Right
          ========================================= */}
      <div className="relative z-10 hidden md:flex w-full px-12 lg:px-40 pb-16 md:pb-20 flex-row justify-between items-end">

        {/* Lower Left: Moto and Subtitle */}
        <div className="max-w-2xl text-left text-white pr-8">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-4">
            {moto}
          </h1>
          <p className="text-lg lg:text-xl font-medium opacity-90">
            {textunderbutton}
          </p>
        </div>

        {/* Lower Right: Emblem ABOVE Buttons */}
        <div className="flex flex-col items-center gap-6">
          {emblemSrc && (
            <div className="w-[40vh] h-[40vh] lg:w-[50vh] lg:h-[50vh] mb-[36vh] relative">
              <PublicImage
                src={emblemSrc}
                alt={emblemAlt}
                fill
                className="object-contain object-bottom"
              />
            </div>
          )}

          <div className="flex flex-row gap-4">
            <Button href={primaryLinkHref} className="flex justify-center items-center !px-15 !py-3 !text-md font-bold shadow-xl whitespace-nowrap">
              {primaryLinkLabel}
            </Button>
            <Button href={secondaryLinkHref} variant="secondary" className="flex justify-center items-center !px-15 !py-3 !text-md font-bold whitespace-nowrap">
              {secondaryLinkLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
