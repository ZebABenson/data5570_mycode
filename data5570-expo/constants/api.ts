// Backend base URL. The Django API is tunneled over HTTPS with cloudflared
// (see the project README / assignment instructions) since the EC2
// instance's IP changes between sessions and Expo needs a stable HTTPS
// origin to fetch from both natively and from the EAS-hosted web build.
//
// Override at build/dev time with EXPO_PUBLIC_API_BASE_URL if the tunnel
// URL changes (cloudflared's free quick tunnels get a new random subdomain
// each time they're restarted).
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://decreased-warrior-hindu-lessons.trycloudflare.com';
