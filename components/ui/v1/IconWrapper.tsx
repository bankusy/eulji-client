import Image from "next/image";
import React from "react";

export default function IconWrapper({
    theme,
    name,
    width,
    height,
}: {
    theme: string;
    name: string;
    width: number;
    height: number;
}) {
    return (
        <Image
            src={`/icons/${name}/${theme}.svg`}
            width={width}
            height={height}
            alt={name}
        />
    );
}
