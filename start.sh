#!/bin/bash
# AI Workflow Kanban - 통합 실행 스크립트
# Frontend (Vite) + Backend (Express) 동시 실행

echo "🚀 AI Workflow Kanban 시작..."
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")"

# 포트 사용 중인 프로세스 종료 함수
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}⚠️  포트 $port 사용 중인 프로세스 종료 (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# 기존 포트 정리
echo -e "${YELLOW}🧹 기존 포트 정리 중...${NC}"
kill_port 3001  # Backend
kill_port 5173  # Frontend
echo -e "${GREEN}✅ 포트 정리 완료${NC}"
echo ""

# node_modules 확인
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 의존성 설치 중...${NC}"
    npm install
fi

echo -e "${BLUE}┌─────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│  🎯 Frontend: http://localhost:5173     │${NC}"
echo -e "${BLUE}│  🔧 Backend:  http://localhost:3001     │${NC}"
echo -e "${BLUE}│  종료: Ctrl+C                           │${NC}"
echo -e "${BLUE}└─────────────────────────────────────────┘${NC}"
echo ""

# Backend를 백그라운드에서 실행
echo -e "${GREEN}🔧 Backend 서버 시작 (포트 3001)...${NC}"
npm run server &
BACKEND_PID=$!

# 잠시 대기 (backend 초기화)
sleep 2

# Frontend 실행
echo -e "${GREEN}🎯 Frontend 서버 시작 (포트 5173)...${NC}"
npm run dev &
FRONTEND_PID=$!

# 종료 시그널 처리
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 서버 종료 중...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    # 추가로 포트도 정리
    kill_port 3001
    kill_port 5173
    echo -e "${GREEN}✅ 종료 완료${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 프로세스 대기
wait
