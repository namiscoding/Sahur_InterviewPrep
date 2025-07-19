import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import 'path' module
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // *** THÊM HOẶC CHỈNH SỬA PHẦN NÀY ***
            "@": path.resolve(__dirname, "./src"), // Cấu hình alias @ để trỏ tới thư mục src
        },
    },
});
