import {defineConfig} from 'vitest/config'
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react()],
    test: {
        include: ['**/*.test.tsx'],
        globals: true,
        setupFiles: './src/setupTests.ts',
        environment: 'jsdom',
    },
})