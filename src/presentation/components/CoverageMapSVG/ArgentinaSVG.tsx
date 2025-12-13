'use client';

import styles from './CoverageMapSVG.module.css';

interface ArgentinaSVGProps {
  className?: string;
}

export function ArgentinaSVG({ className }: ArgentinaSVGProps) {
  return (
    <svg
      viewBox="0 0 400 600"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Otras provincias (gris claro) */}
      <g className={styles.otherProvinces}>
        {/* Jujuy */}
        <path d="M165 20 L185 20 L190 50 L180 60 L165 55 Z" />
        {/* Salta */}
        <path d="M150 40 L165 55 L180 60 L190 50 L200 55 L210 100 L180 120 L140 100 L130 60 Z" />
        {/* Formosa */}
        <path d="M210 100 L260 95 L280 120 L240 140 L200 130 L180 120 Z" />
        {/* Chaco */}
        <path d="M200 130 L240 140 L260 170 L220 190 L180 170 L180 140 Z" />
        {/* Misiones */}
        <path d="M280 120 L310 100 L330 130 L310 160 L280 150 L260 170 L280 120 Z" />
        {/* Corrientes */}
        <path d="M260 170 L280 150 L310 160 L320 200 L280 230 L250 210 L220 190 Z" />
        {/* Tucuman */}
        <path d="M140 100 L180 120 L175 150 L150 160 L130 140 Z" />
        {/* Santiago del Estero */}
        <path d="M175 150 L180 170 L220 190 L210 240 L170 250 L150 200 L150 160 Z" />
        {/* Catamarca */}
        <path d="M100 120 L140 100 L130 140 L150 160 L150 200 L120 220 L90 180 Z" />
        {/* La Rioja */}
        <path d="M90 180 L120 220 L110 270 L80 280 L60 240 Z" />
        {/* San Juan */}
        <path d="M60 240 L80 280 L70 330 L40 340 L30 290 Z" />
        {/* Mendoza */}
        <path d="M30 290 L40 340 L70 330 L90 380 L60 420 L20 400 L10 340 Z" />
        {/* San Luis */}
        <path d="M90 280 L120 270 L150 300 L140 350 L100 360 L90 320 Z" />
        {/* Cordoba */}
        <path d="M120 220 L150 200 L170 250 L200 270 L190 320 L150 340 L150 300 L120 270 Z" />
        {/* Santa Fe */}
        <path d="M200 270 L210 240 L250 210 L270 250 L260 320 L220 340 L190 320 Z" />
        {/* La Pampa */}
        <path d="M100 360 L140 350 L180 380 L170 440 L120 450 L90 420 Z" />
        {/* Neuquen */}
        <path d="M60 420 L90 420 L120 450 L100 500 L60 490 L40 450 Z" />
        {/* Rio Negro */}
        <path d="M100 500 L120 450 L170 440 L200 470 L180 530 L120 540 L80 520 Z" />
        {/* Chubut */}
        <path d="M80 520 L120 540 L180 530 L190 580 L140 600 L70 590 L50 550 Z" />
        {/* Santa Cruz */}
        <path d="M50 550 L70 590 L140 600 L150 650 L100 680 L40 660 L30 600 Z" />
        {/* Tierra del Fuego */}
        <path d="M100 680 L150 650 L180 690 L150 720 L100 710 Z" />
      </g>

      {/* Buenos Aires - Destacada */}
      <path
        className={styles.buenosAires}
        d="M180 380 L220 340 L260 320 L290 340 L300 390 L280 440 L230 460 L200 470 L170 440 Z"
      />

      {/* Entre Rios - Destacada */}
      <path
        className={styles.entreRios}
        d="M270 250 L280 230 L320 200 L340 240 L330 290 L300 310 L290 340 L260 320 Z"
      />

      {/* Linea de conexion animada */}
      <line
        x1="240"
        y1="390"
        x2="300"
        y2="280"
        className={styles.connectionLine}
      />

      {/* Puntos de origen y destino */}
      <circle cx="240" cy="390" r="8" className={styles.originPoint} />
      <circle cx="300" cy="280" r="8" className={styles.destinationPoint} />

      {/* Labels */}
      <text x="200" y="420" className={styles.provinceLabel}>Buenos Aires</text>
      <text x="290" y="260" className={styles.provinceLabel}>Entre Ríos</text>
    </svg>
  );
}
