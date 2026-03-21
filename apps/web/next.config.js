/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@metamask/sdk'],
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
      };
      
      // Ignore react-native specific modules that leak into the browser build
      config.module.rules.push({
        test: /@metamask\/sdk/,
        resolve: {
          alias: {
            '@react-native-async-storage/async-storage': false,
            'react-native': false,
          }
        }
      });
    }
    return config;
  },
};

module.exports = nextConfig;
