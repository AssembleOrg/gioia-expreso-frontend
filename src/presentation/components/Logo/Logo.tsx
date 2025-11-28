'use client';

import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 200, height = 80, className }: LogoProps) {
  return (
    <Image
      src="/Logo Gioia e hijos srl V2.png"
      alt="Transporte Gioia e Hijos SRL"
      width={width}
      height={height}
      priority
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}

