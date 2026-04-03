// src/lib/utils/api.ts
// Baut API-URLs die sowohl im Web (relativ) als auch in Capacitor Native Builds
// (absolut, mit PUBLIC_API_BASE-Prefix) funktionieren.
//
// Web / Vercel:          PUBLIC_API_BASE = ''  → relative URLs bleiben relativ
// Capacitor native Build: PUBLIC_API_BASE = 'https://austrofit.at'
//
// $env/static/public: Wert wird zur Build-Zeit eingebettet (nötig für adapter-static,
// da es zur Laufzeit keinen Server gibt der dynamic env vars injizieren könnte).
import { PUBLIC_API_BASE } from '$env/static/public';

export const apiUrl = (path: string): string => `${PUBLIC_API_BASE}${path}`;
