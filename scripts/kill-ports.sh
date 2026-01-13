#!/bin/bash
# 포트 종료 스크립트

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}⚠️  포트 $port 종료 (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
    else
        echo -e "${GREEN}✅ 포트 $port 사용 안 함${NC}"
    fi
}

echo "🧹 개발 서버 포트 정리..."
kill_port 3001  # Backend
kill_port 5173  # Frontend
echo -e "${GREEN}✅ 완료${NC}"
