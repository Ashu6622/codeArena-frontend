import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#20231e',
        color: '#d1f85c',
        fontSize: 21,
        fontWeight: 700,
        borderRadius: 4,
      }}
    >
      {'>_'}
    </div>,
    size,
  );
}
