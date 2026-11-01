import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  compress: true,
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  env: {
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ?? process.env.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL
      ?? process.env.VITE_SUPABASE_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  reactStrictMode: true,
  webpack(config) {
    // The postprocessing barrel imports N8AO even when no AO pass is mounted.
    // Its package omits sideEffects metadata; allow unused AO code to drop.
    config.module.rules.push({
      test: /node_modules[\\/]n8ao[\\/]dist[\\/]N8AO\.js$/,
      sideEffects: false,
    });
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
