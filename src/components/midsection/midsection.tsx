"use client";

import Textfield from '@/components/text/mdfield';
import MapEmbed from '@/components/mapEmbed/mapEmbed';

export interface MidsectionProps {
  mapSrc: string;
  content: string | string[]; // TODO: clean up this 
}

export default function Midsection({
  mapSrc,
  content
}: MidsectionProps) {
  return (
    <div className="w-full">
      <section className="relative w-full md:min-h-[75vh] flex flex-col bg-brand-color2">
        {/* flex-col (Mobile): Stacks elements vertically
          md:flex-row (Desktop): Places them side-by-side 
        */}
        <div className="flex flex-col md:flex-row items-stretch">
          {mapSrc ? (
            <>
              <div className="w-full h-[35vh] md:w-1/2 md:h-[75vh]">
                <MapEmbed embedSrc={mapSrc} />
              </div>
              <div className="flex items-center justify-center w-full md:w-1/2 px-5">
                <Textfield className='' content={content} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full px-5 py-16">
              <Textfield className='' content={content} />
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
