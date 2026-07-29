import { ImageResponse } from 'next/og';

export const alt = 'Circle Clash Ultimate — browser-based 3D anime fighting';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #050814 0%, #10263a 58%, #44162a 100%)',
          color: '#f4f7ff',
          display: 'flex',
          fontFamily: 'sans-serif',
          height: '100%',
          justifyContent: 'space-between',
          padding: '76px 84px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: 740 }}>
          <span style={{ color: '#71dcff', fontSize: 28, fontWeight: 700, letterSpacing: 8 }}>
            BROWSER-BASED 3D ANIME FIGHTER
          </span>
          <span style={{ fontSize: 82, fontWeight: 900, letterSpacing: -5, lineHeight: 0.95, marginTop: 34 }}>
            CIRCLE CLASH
          </span>
          <span style={{ color: '#ff6d93', fontSize: 82, fontWeight: 900, letterSpacing: -5, lineHeight: 0.95 }}>
            ULTIMATE
          </span>
          <span style={{ color: '#b9c9df', fontSize: 28, marginTop: 38 }}>
            Cel-shaded combat. Cinematic impact. Built for 60 FPS.
          </span>
        </div>
        <div
          style={{
            border: '18px solid #71dcff',
            borderRadius: '50%',
            boxShadow: '0 0 80px #2b8fc2',
            display: 'flex',
            height: 250,
            width: 250,
          }}
        />
      </div>
    ),
    size,
  );
}
