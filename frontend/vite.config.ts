import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // Vite 기본 포트
    host: "0.0.0.0", // 컨테이너 외부에서도 접근 가능하게 설정
    strictPort: true, // 사용 중이면 오류 발생 (다른 포트로 변경 안 함)
    watch: {
      usePolling: true, // 파일 변경 감지 문제 해결 (도커 환경 필수)
    },
  },
  assetsInclude: ['**/*.PNG', '**/*.png'],
});