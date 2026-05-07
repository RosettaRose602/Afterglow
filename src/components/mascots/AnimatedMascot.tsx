import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { CyclePhaseName } from '@/types'
import type { MoonPhaseName } from '@/lib/moonPhase'
import {
  getCereSrc, getBellaSrc, getHypaSrc,
  getThalmasSrc, getGreliSrc, getOsmaSrc, getDophiSrc,
  mascotRegistry,
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

// Colored circle placeholder shown while PNGs are missing
function MascotPlaceholder({ mascot, size }: { mascot: MascotName; size: number | string }) {
  const meta = mascotRegistry[mascot].meta
  const px = typeof size === 'number' ? `${size}px` : size
  const initials = meta.label[0]
  return (
    <div
      style={{
        width: px, height: px,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${meta.accentColor}, ${meta.primaryColor})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        opacity: 0.85,
      }}
    >
      <span style={{ fontSize: typeof size === 'number' ? size * 0.38 : 40, lineHeight: 1 }}>
        {initials}
      </span>
    </div>
  )
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
  const [imgError, setImgError] = useState(false)

  const src = getSrc({ mascot, cyclePhase, moonPhase, dophiVariant })

  const imgStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    objectFit: 'contain',
  }

  if (imgError) {
    return <MascotPlaceholder mascot={mascot} size={size} />
  }

  const onError = () => setImgError(true)

  if (prefersReduced || animation === 'none') {
    return (
      <img
        src={src} alt={alt ?? mascot}
        style={imgStyle} className={className}
        draggable={false} onError={onError}
      />
    )
  }

  if (mascot === 'cere' && animation === 'pulse') {
    return (
      <motion.img
        src={src} alt={alt ?? mascot}
        style={imgStyle} className={className}
        draggable={false} onError={onError}
        animate={pulseVariants[intensity]}
      />
    )
  }

  if (animation === 'breathe') {
    return (
      <motion.img
        src={src} alt={alt ?? 'mascot'}
        style={imgStyle} className={className}
        draggable={false} onError={onError}
        variants={breatheVariants} animate="animate"
      />
    )
  }

  if (animation === 'bounce') {
    return (
      <motion.img
        src={src} alt={alt ?? 'mascot'}
        style={imgStyle} className={className}
        draggable={false} onError={onError}
        variants={bounceVariants} animate="animate"
      />
    )
  }

  return (
    <motion.img
      src={src} alt={alt ?? 'mascot'}
      style={imgStyle} className={className}
      draggable={false} onError={onError}
      variants={floatVariants} animate="animate"
    />
  )
}

export default AnimatedMascot
