/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ինքնուրույն սերվերի/Docker-ի համար՝ .next/standalone (Vercel-ն էլ է աջակցում)
  output: "standalone",
  experimental: {
    // Նկար վերբեռնելու server action-ի համար՝ բարձրացնում ենք չափի սահմանը (կանխ. 1MB)
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
