/** @type {import('next').NextConfig} */

// Where the ADK FastAPI backend lives.
//   - Local dev: http://127.0.0.1:8000 (run `agents-cli playground` or `uvicorn app.fast_api_app:app`)
//   - Production: set AGENT_URL on Vercel to your Railway URL, e.g.
//     https://agency-2026-backend.up.railway.app
const AGENT_URL = process.env.AGENT_URL || 'http://127.0.0.1:8000';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/adk/:path*',
        destination: `${AGENT_URL}/:path*`,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

module.exports = nextConfig;
