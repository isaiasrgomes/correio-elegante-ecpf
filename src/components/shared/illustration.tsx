import Image from "next/image";
import { cn } from "@/lib/utils";

export const ILLUSTRATION_SIZE = 112;

interface IllustrationProps {
  src: string;
  alt: string;
  size?: number;
  imageScale?: number;
  className?: string;
  imageClassName?: string;
  hoverScale?: boolean;
}

export function Illustration({
  src,
  alt,
  size = ILLUSTRATION_SIZE,
  imageScale = 1,
  className,
  imageClassName,
  hoverScale = false,
}: IllustrationProps) {
  const imageClasses = cn(
    "pointer-events-none h-full w-full max-h-full max-w-full select-none object-contain object-center origin-center",
    hoverScale && "scale-[0.92] transition-transform duration-300 group-hover:scale-100",
    imageClassName
  );

  const imageStyle = { width: size, height: size, maxWidth: size, maxHeight: size };

  const image =
    src.endsWith(".svg") ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={size} height={size} className={imageClasses} style={imageStyle} />
    ) : (
      <Image src={src} alt={alt} width={size} height={size} className={imageClasses} style={imageStyle} />
    );

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {imageScale !== 1 ? (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ transform: `scale(${imageScale})`, transformOrigin: "center" }}
        >
          {image}
        </div>
      ) : (
        image
      )}
    </div>
  );
}
