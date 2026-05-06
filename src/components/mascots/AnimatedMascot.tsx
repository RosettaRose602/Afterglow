import { motion, useReducedMotion } from 'framer-motion'
import type { CyclePhaseName } from '@/types'
import type { MoonPhaseName } from '@/lib/moonPhase'
import {
  getCereSrc, getBellaSrc, getHypaSrc,
  getThalmasSrc, getGreliSrc, getOsmaSrc, getDophiSrc,
  type DophiVariant,
} from './mascotRegistry'

type MascotName = 'cere' | 'bella' | 'hypa' | 'thalma' | 'greli' | 'osma' | 'dophi'

type AnimationStyle = 'float' | 'pulse' | 'bounce' | 'breathe' | 'none'

interface AnimatedMascotProps {
  mascot: MascotName
  cyclePhase?: CyclePhaseName
  moonPhase?: MoonPhaseName
  dophiVariant?: DophiVariant
  size?: number | string
  animation?: AnimationStyle
  intensity?: 'calm' | 'pulsing' | 'alert'
  className?: string
  alt?: string
}

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
}

const pulseVariants = {
  calm: {
    filter: ['drop-shadow(0 0 8px rgba(248,216,96,0.4))', 'drop-shadow(0 0 16px rgba(248,216,96,0.6))', 'drop-shadow(0 0 8px rgba(248,216,96,0.4))'],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  pulsing: {
    filter: ['drop-shadow(0 0 12px rgba(240,160,48,0.6))', 'drop-shadow(0 0 24px rgba(240,160,48,0.9))', 'drop-shadow(0 0 12px rgba(240,160,48,0.6))'],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
  alert: {
    filter: ['drop-shadow(0 0 16px rgba(224,90,90,0.7))', 'drop-shadow(0 0 32px rgba(224,90,90,1.0))', 'drop-shadow(0 0 16px rgba(224,90,90,0.7))'],
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
  },
}

const breatheVariants = {
  animate: {
    scale: [1, 1.015, 1],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
}

const bounceVariants = {
  animate: {
    y: [0, -7, 0],
    rotate: [-1, 1, -1],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
}

function getSrc(props: AnimatedMascotProps): string {
  const { mascot, cyclePhase, moonPhase, dophiVariant } = props
  switch (mascot) {
    case 'cere':   return getCereSrc()
    case 'bella':  return getBellaSrc()
    case 'hypa':   return getHypaSrc(cyclePhase ?? 'follicular')
    case 'thalma': return getThalmasSrc(moonPhase ?? 'new-moon')
    case 'greli':  return getGreliSrc()
    case 'osma':   return getOsmaSrc()
    case 'dophi':  return getDophiSrc(dophiVariant ?? 'front')
  }
}

export function AnimatedMascot({
  mascot,
  cyclePhase,
  moonPhase,
  dophiVariant,
  size = 200,
  animation = 'float',
  intensity = 'calm',
  className = '',
  alt,
}: AnimatedMascotProps) {
  const prefersReduced = useReducedMotion()

  const src = getSrc({ mascot, cyclePhase, moonPhase, dophiVariant })

  const imgStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    objectFit: 'contain',
  }

  if (prefersReduced || animation === 'none') {
    return (
      <img
        src={src}
        alt={alt ?? mascot}
        style={imgStyle}
        className={className}
        draggable={false}
      />
    )
  }

  if (mascot === 'cere' && animation === 'pulse') {
    return (
      <motion.img
        src={src}
        alt={alt ?? mascot}
        style={imgStyle}
        className={className}
        draggable={false}
        animate={pulseVariants[intensity]}
      />
    )
  }

  if (animation === 'breathe') {
    return (
      <motion.img
        src={src}
        alt={alt ?? 'mascot'}
        style={imgStyle}
        className={className}
        draggable={false}
        variants={breatheVariants}
        animate="animate"
      />
    )
  }

  if (animation === 'bounce') {
    return (
      <motion.img
        src={src}
        alt={alt ?? 'mascot'}
        style={imgStyle}
        className={className}
        draggable={false}
        variants={bounceVariants}
        animate="animate"
      />
    )
  }

  return (
    <motion.img
      src={src}
      alt={alt ?? 'mascot'}
      style={imgStyle}
      className={className}
      draggable={false}
      variants={floatVariants}
      animate="animate"
    />
  )
}

export default AnimatedMascot
