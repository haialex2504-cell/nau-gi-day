import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nấu Gì Đây - AI Cooking Assistant',
    short_name: 'Nấu Gì Đây',
    description: 'Gợi ý món ăn thông minh dựa trên nguyên liệu của bạn',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF9F5',
    theme_color: '#FF4D2D',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
