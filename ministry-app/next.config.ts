/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Keep trailing slash for consistency with existing routing style.
  trailingSlash: true,
};

export default nextConfig;
