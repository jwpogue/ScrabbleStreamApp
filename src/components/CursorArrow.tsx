// import React from 'react'
import { ArrowRight, ArrowDown } from 'lucide-react'
import type { Arrow } from '../types/Frame'

type CursorArrowProps = {
  arrow: Arrow;
}

export default function CursorArrow({ arrow }: CursorArrowProps) {

  if (arrow.direction === 'horizontal') {
    return (
      <ArrowRight 
      style={{
        position: 'absolute',
        inset: 0,
        margin: 'auto',
        width: '16px',
        height: '16px',
        color: '#007bff',
      }}
      />
    )
  } else {
    return (
      <ArrowDown
        style={{
          position: 'absolute',
          inset: 0,
          margin: 'auto',
          width: '16px',
          height: '16px',
          color: '#007bff',
        }}
      />
    )
  }
}
