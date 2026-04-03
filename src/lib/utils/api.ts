// src/lib/utils/api.ts
// Baut API-URLs die sowohl im Web (relativ) als auch in Capacitor Native Builds
// (absolut, mit PUBLIC_API_BASE-Prefix) funktionieren.
//
// Web / Vercel:          PUBLIC_API_BASE nicht gesetzt → '' → relative URLs
// Capacitor native Build: PUBLIC_API_BASE = 'https://austrofit.at'
//
// $env/dynamic/public: wirft keinen Build-Fehler wenn Variable nicht gesetzt ist.
import { env } from '$env/dynamic/public';

export const apiUrl = (path: string): string => `${env.PUBLIC_API_BASE ?? ''}${path}`;
