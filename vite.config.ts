/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from 'rollup-plugin-visualizer'
import Sitemap from 'vite-plugin-sitemap'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    // Generate sitemap.xml and robots.txt
    Sitemap({
      hostname: 'https://puffpuff.dev',
      dynamicRoutes: ['/'],
      changefreq: 'monthly',
      priority: 1.0,
      lastmod: new Date().toISOString().split('T')[0],
      generateRobotsTxt: true,
      robots: [
        {
          userAgent: '*',
          allow: '/',
        }
      ]
    }),
    // Brotli compression (primary)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
      compressionOptions: {
        level: 11
      }
    }),
    // Gzip compression (fallback)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false
    })
  ],
  // base: '/romatroskin.github.io',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts', 'vite.config.ts']
    },
    // Ensure test files can use path aliases from tsconfig.test.json
    alias: {
      '@': '/src'
    }
  }
})
