import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile the parent library
  transpilePackages: ['riffscore'],
  // Disable turbopack for webpack config
  webpack: (config) => {
    const srcPath = path.resolve(__dirname, '../src');

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
      '@context': path.resolve(srcPath, 'context'),
      '@hooks': path.resolve(srcPath, 'hooks'),
      '@components': path.resolve(srcPath, 'components'),
      '@utils': path.resolve(srcPath, 'utils'),
      '@commands': path.resolve(srcPath, 'commands'),
      '@engines': path.resolve(srcPath, 'engines'),
      '@assets': path.resolve(srcPath, 'components/Assets'),
      '@services': path.resolve(srcPath, 'services'),
      '@config': path.resolve(srcPath, 'config'),
      '@types': path.resolve(srcPath, 'types'),
      '@constants': path.resolve(srcPath, 'constants'),
    };
    return config;
  },
};

export default nextConfig;
