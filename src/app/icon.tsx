import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#060914',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            border: '28px solid #71dcff',
            borderRadius: '50%',
            boxShadow: '0 0 70px #2b8fc2',
            color: '#f4f7ff',
            display: 'flex',
            fontFamily: 'sans-serif',
            fontSize: 132,
            fontWeight: 900,
            height: 370,
            justifyContent: 'center',
            letterSpacing: '-18px',
            width: 370,
          }}
        >
          CC
        </div>
      </div>
    ),
    size,
  );
}
