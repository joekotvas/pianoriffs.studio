/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile the parent library
  transpilePackages: ['riffscore'],
  // Disable turbopack for webpack config
  turbopack: {},
};

export default nextConfig;
