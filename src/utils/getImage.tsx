import Image, { ImageProps, StaticImageData } from 'next/image';
import { getPublicPath } from '@/utils/paths';

interface PublicImageProps extends Omit<ImageProps, 'src'> {
  src: string | StaticImageData;
}

export const PublicImage = ({ src, alt = "", ...props }: PublicImageProps) => {
  // If src is StaticImageData (local import), Next.js handles the path automatically.
  // If src is a string, we apply the getPublicPath logic.
  const finalSrc = typeof src === 'string' ? getPublicPath(src) : src;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      {...props}
    />
  );
};
