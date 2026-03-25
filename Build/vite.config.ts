import { defineConfig } from 'vite';
import path from 'path';
import autoprefixer from 'autoprefixer';

export default defineConfig({
    root: path.resolve(__dirname, 'Src'),

    build: {
        outDir: path.resolve(__dirname, '../Resources/Public'),
        emptyOutDir: false,
        sourcemap: true,
        rollupOptions: {
            input: {
                'JavaScript/Supi': path.resolve(__dirname, 'Src/JavaScript/main.ts'),
                'Css/Supi': path.resolve(__dirname, 'Src/Scss/Supi.scss'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'JavaScript/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const assetName = assetInfo.names && assetInfo.names.length > 0 ? assetInfo.names[0] : '';

                    if (assetName.endsWith('.css')) {
                        return '[name].[ext]';
                    }

                    return 'Assets/[name]-[hash].[ext]';
                },
            },
        },
        target: 'es2015',
        cssMinify: true,
    },
    css: {
        postcss: {
            plugins: [
                autoprefixer({
                    overrideBrowserslist: ['last 4 versions'],
                }),
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'Src'),
        },
    },
});
