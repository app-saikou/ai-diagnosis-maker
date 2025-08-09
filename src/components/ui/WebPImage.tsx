import React from 'react';

interface WebPImageProps {
  webpSrc: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const WebPImage: React.FC<WebPImageProps> = ({
  webpSrc,
  fallbackSrc,
  alt,
  className,
  width,
  height
}) => {
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading="lazy"
      />
    </picture>
  );
};

export default WebPImage;
