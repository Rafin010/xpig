import { ImageResponse } from 'next/og'



export const alt = 'XPIG - Premium Content Platform'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #000000, #180010)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <img
            src="https://xpig.me/pig-logo.png"
            width="250"
            height="250"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div
          style={{
            fontSize: 100,
            fontFamily: 'sans-serif',
            fontWeight: '900',
            color: '#ec4899',
            marginBottom: 20,
            textShadow: '0 0 30px rgba(236, 72, 153, 0.4)',
            letterSpacing: '-0.05em'
          }}
        >
          XPIG
        </div>
        <div
          style={{
            fontSize: 40,
            fontFamily: 'sans-serif',
            fontWeight: '600',
            color: '#a1a1aa',
            letterSpacing: '0.02em'
          }}
        >
          Premium Creator Content Platform
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
