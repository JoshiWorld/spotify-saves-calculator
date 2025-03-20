"use client";

import dynamic from "next/dynamic";

const DynamicImage = dynamic(() => import("next/image"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export function LinkBackgroundImage({ image }: { image: string }) {
    return (
      <div className="absolute inset-0 hidden md:block">
        <DynamicImage
          src={image}
          alt="Background"
          fill
          objectFit="cover"
          className="blur-md"
          priority
        />
      </div>
    );
}