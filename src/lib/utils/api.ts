// src/lib/utils/api.ts
// Baut API-URLs die sowohl im Web (relativ) als auch in Capacitor Native Builds
// (absolut, mit PUBLIC_API_BASE-Prefix) funktionieren.
//
// Web / Vercel:          PUBLIC_API_BASE = ''  → relative URLs bleiben relativ
// Capacitor native Build: PUBLIC_API_BASE = 'https://austrofit.at'
export const apiUrl = (path: string): string =>
  `${import.meta.env.PUBLIC_API_BASE ?? ''}${path}`;
