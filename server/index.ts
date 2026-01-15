import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// __dirname 구성 (ESM)
const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT ?? 3001;

// TASK-013: CORS 및 JSON 미들웨어
app.use(cors());
app.use(express.json());

// TASK-014: 정적 파일 제공 (workspace/)
app.use('/workspace', express.static(join(_dirname, '../workspace')));

// TASK-015: API 라우트 마운트 (/api)
const apiRouter = express.Router();

// TASK-017: /api/health 엔드포인트
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

// API 기본 라우트
apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Design Workflow API',
    version: '0.1.0',
    endpoints: {
      health: '/api/health',
    },
  });
});

app.use('/api', apiRouter);

// TASK-016: 에러 처리 미들웨어
interface ErrorResponse {
  status: number;
  message: string;
  stack?: string;
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const errorResponse: ErrorResponse = {
    status: 500,
    message: err.message ?? 'Internal Server Error',
  };

  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  console.error('Server error:', err);
  res.status(500).json(errorResponse);
});

// 404 처리
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// 서버 시작 (테스트 환경에서는 실행하지 않음)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
