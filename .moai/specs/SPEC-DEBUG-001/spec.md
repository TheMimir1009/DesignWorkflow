---
id: SPEC-DEBUG-001
version: "1.0.0"
status: "planned"
created: "2026-01-11"
updated: "2026-01-11"
author: "MoAI-ADK"
priority: "high"
---

# SPEC-DEBUG-001: LLM Debug Console

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-11 | MoAI-ADK | 초기 SPEC 작성 |

---

## 1. 개요

### 1.1 기능 설명

LLM API 호출을 실시간으로 모니터링하고 디버깅할 수 있는 개발자 전용 콘솔입니다. 요청/응답 로그, 토큰 사용량, 비용 추적, 재시도 기능을 제공합니다.

### 1.2 사용자 스토리

> "개발자로서, LLM API 호출의 상세 내역을 실시간으로 확인하고 문제를 진단하고 싶습니다."

### 1.3 문제 해결

- LLM API 호출 실패 시 원인 파악의 어려움 해결
- 토큰 사용량 및 비용 추적의 부재 문제 해결
- 프롬프트 디버깅을 위한 요청/응답 검증 지원
- 재시작 없이 실패한 요청 재전송 기능 제공

### 1.4 범위

**포함 범위**:
- 실시간 LLM API 호출 로그 표시
- 요청/응답 상세 보기
- 토큰 사용량 및 비용 계산
- 실패한 요청 재시도 기능
- 필터 및 검색 기능
- 로그 내보내기 (JSON/CSV)

**제외 범위**:
- 프로덕션 환경에서의 UI 표시 (개발 모드 전용)
- 실시간 스트리밍 응답 수정
- 다른 사용자와 로그 공유

---

## 2. 요구사항 (EARS 형식)

### 2.1 Ubiquitous Requirements (항상 적용)

**REQ-U-001**: Debug Console은 개발 모드에서만 접근 가능해야 한다.

**REQ-U-002**: 모든 LLM API 호출 로그는 자동으로 캡처되어야 한다.

**REQ-U-003**: 로그는 최대 1000개까지 메모리에 보관되어야 한다.

**REQ-U-004**: 토큰 사용량은 각 요청마다 자동으로 계산되어야 한다.

**REQ-U-005**: 비용은 각 모델의 가격표에 따라 계산되어야 한다.

### 2.2 Event-Driven Requirements (이벤트 기반)

**REQ-E-001**: 사용자가 Debug Console 메뉴를 클릭하면, 시스템은 Debug Console 뷰를 표시해야 한다.

**REQ-E-002**: 사용자가 로그 항목을 클릭하면, 시스템은 요청/응답 상세 정보를 모달로 표시해야 한다.

**REQ-E-003**: 사용자가 "재시도" 버튼을 클릭하면, 시스템은:
- 선택된 요청의 파라미터로 새로운 API 호출을 생성
- 결과를 새로운 로그 항목으로 기록

**REQ-E-004**: 사용자가 필터를 변경하면, 시스템은:
- 선택된 조건(성공/실패, 모델별)에 맞게 로그 목록을 필터링
- 필터링된 결과를 실시간으로 업데이트

**REQ-E-005**: 사용자가 "내보내기" 버튼을 클릭하면, 시스템은:
- 현재 필터링된 로그를 지정된 형식(JSON/CSV)으로 변환
- 파일을 다운로드

**REQ-E-006**: 사용자가 "지우기" 버튼을 클릭하면, 시스템은:
- 확인 다이얼로그를 표시
- 확인 시 모든 로그를 메모리에서 삭제

### 2.3 Unwanted Behavior Requirements (방지해야 할 동작)

**REQ-W-001**: 시스템은 프로덕션 빌드에서 Debug Console을 표시해서는 안 된다.

**REQ-W-002**: 시스템은 로그 캡처로 인해 API 호출 성능에 영향을 주어서는 안 된다.

**REQ-W-003**: 시스템은 민감한 정보(API 키)를 로그에 포함해서는 안 된다.

**REQ-W-004**: 시스템은 로그가 없을 때 빈 화면만 표시해서는 안 된다 (안내 메시지 표시).

### 2.4 State-Driven Requirements (상태 기반)

**REQ-S-001**: 개발 모드가 비활성화되어 있을 때, 시스템은 Debug Console 메뉴를 숨겨야 한다.

**REQ-S-002**: API 호출이 진행 중일 때, 시스템은 해당 로그 항목을 "pending" 상태로 표시해야 한다.

**REQ-S-003**: API 호출이 성공했을 때, 시스템은 로그를 "success" 상태로 표시하고 녹색 인디케이터를 표시해야 한다.

**REQ-S-004**: API 호출이 실패했을 때, 시스템은 로그를 "error" 상태로 표시하고 적색 인디케이터를 표시해야 한다.

**REQ-S-005**: 로그가 1000개를 초과할 때, 시스템은 가장 오래된 로그부터 자동으로 삭제해야 한다.

### 2.5 Optional Features (선택적 기능)

**REQ-O-001**: 시스템은 특정 프롬프트를 템플릿으로 저장하는 기능을 제공할 수 있다.

**REQ-O-002**: 시스템은 로그 데이터를 로컬 스토리지에 영구 저장하는 기능을 제공할 수 있다.

**REQ-O-003**: 시스템은 여러 로그 항목을 비교하는 기능을 제공할 수 있다.

---

## 3. UI/UX 명세

### 3.1 Debug Console 레이아웃

```
+-----------------------------------------------------------------------+
| Debug Console                                    [Clear] [Export v]   |
+-----------------------------------------------------------------------+
| Filters: [All Status v] [All Models v] [Search...]                  |
+-----------------------------------------------------------------------+
| Statistics: 245 Requests | 231 Success | 14 Failed | 52.4K Tokens   |
+-----------------------------------------------------------------------+
| Log List:                                                              |
|                                                                       |
| +------------------+---------------------+----------+--------+-----+|
| | Time             | Model               | Status   | Tokens | Cost||
| +------------------+---------------------+----------+--------+-----+|
| | 14:32:15         | claude-opus-4-5     | [SUCCESS]| 1,245  | $0.02||
| | 14:32:10         | claude-opus-4-5     | [ERROR]  | 0      | $0  ||
| | 14:31:58         | gpt-4o              | [SUCCESS]| 3,102  | $0.05||
| | ...              | ...                 | ...      | ...    | ... ||
| +------------------+---------------------+----------+--------+-----+|
+-----------------------------------------------------------------------+
|                            [Load More]                                |
+-----------------------------------------------------------------------+
```

### 3.2 로그 상세 모달

```
+-----------------------------------------------------------------------+
| Request Details                                          [Close] [Retry]|
+-----------------------------------------------------------------------+
|                                                                       |
| Request:                                                              |
| +-------------------------------------------------------------------+|
| | Model: claude-opus-4-5                                            ||
| | Endpoint: https://api.anthropic.com/v1/messages                   ||
| | Method: POST                                                      ||
| |                                                                   ||
| | Headers:                                                          ||
| |   x-api-key: sk-ant-****...**** (hidden)                          ||
| |   anthropic-version: 2023-06-01                                   ||
| |                                                                   ||
| | Body:                                                             ||
| | {                                                                 ||
| |   "model": "claude-opus-4-5",                                     ||
| |   "messages": [...],                                              ||
| |   "max_tokens": 4096                                              ||
| | }                                                                 ||
| +-------------------------------------------------------------------+|
|                                                                       |
| Response:                                                             |
| +-------------------------------------------------------------------+|
| | Status: 200 OK                                                    ||
| | Duration: 1.24s                                                   ||
| |                                                                   ||
| | Headers:                                                          ||
| |   request-id: req_abc123...                                       ||
| |                                                                   ||
| | Body:                                                             ||
| | {                                                                 ||
| |   "id": "msg_abc123...",                                          ||
| |   "type": "message",                                              ||
| |   "content": [...]                                                ||
| | }                                                                 ||
| +-------------------------------------------------------------------+|
|                                                                       |
| Usage:                                                                |
|   Input Tokens: 845    Output Tokens: 400                            |
|   Total Tokens: 1,245    Cost: $0.0186                                |
+-----------------------------------------------------------------------+
```

### 3.3 상태 인디케이터

- **SUCCESS**: 녹색 체크마크 아이콘
- **ERROR**: 적색 X 아이콘
- **PENDING**: 파란색 로딩 스피너

### 3.4 반응형 브레이크포인트

- **Desktop (>=1024px)**: 전체 테이블 표시
- **Tablet (768-1023px)**: 축소된 테이블
- **Mobile (<768px)**: 카드 뷰로 변환

---

## 4. 기술 아키텍처

### 4.1 컴포넌트 구조

```
/src/components/debug/
├── DebugConsole.tsx              # Debug Console 메인 컴포넌트
├── DebugHeader.tsx               # 헤더 (지우기, 내보내기 버튼)
├── DebugFilters.tsx              # 필터 컨트롤
├── DebugStats.tsx                # 통계 요약
├── LogList.tsx                   # 로그 목록
├── LogItem.tsx                   # 개별 로그 항목
├── LogDetailModal.tsx            # 상세 보기 모달
├── EmptyDebugState.tsx           # 빈 상태 컴포넌트
└── DebugStatusIcon.tsx           # 상태 인디케이터

/src/store/
└── debugStore.ts                 # Zustand Debug 상태 관리

/src/services/
└── debugService.ts               # Debug API 서비스

/src/utils/
└── llmLogger.ts                  # LLM API 로깅 유틸리티
```

### 4.2 데이터 모델

```typescript
// LLM 호출 로그
interface LLMCallLog {
  id: string;
  timestamp: string;              // ISO 8601
  model: string;                  // e.g., "claude-opus-4-5"
  provider: string;               // e.g., "anthropic", "openai"
  endpoint: string;
  method: string;
  status: "pending" | "success" | "error";
  statusCode?: number;            // HTTP status code
  duration?: number;              // ms
  error?: string;                 // Error message

  // Request
  requestHeaders: Record<string, string>;
  requestBody: unknown;

  // Response
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;

  // Usage
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;                  // USD
}

// 필터 상태
interface DebugFilters {
  status: "all" | "success" | "error" | "pending";
  model: string;                  // "all" 또는 특정 모델
  search: string;                 // 검색어
}

// Debug Store 상태
interface DebugState {
  logs: LLMCallLog[];
  filters: DebugFilters;
  isDetailModalOpen: boolean;
  selectedLog: LLMCallLog | null;
  stats: {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    totalTokens: number;
    totalCost: number;
  };

  // Actions
  addLog: (log: LLMCallLog) => void;
  updateLog: (id: string, updates: Partial<LLMCallLog>) => void;
  setFilters: (filters: Partial<DebugFilters>) => void;
  setSelectedLog: (log: LLMCallLog | null) => void;
  clearLogs: () => void;
  exportLogs: (format: "json" | "csv") => void;
  retryRequest: (id: string) => Promise<void>;
}
```

### 4.3 모델 가격표

```typescript
interface ModelPricing {
  model: string;
  inputPricePer1K: number;    // USD
  outputPricePer1K: number;   // USD
}

const MODEL_PRICING: ModelPricing[] = [
  { model: "claude-opus-4-5", inputPricePer1K: 3.0, outputPricePer1K: 15.0 },
  { model: "claude-sonnet-4-5", inputPricePer1K: 1.5, outputPricePer1K: 7.5 },
  { model: "gpt-4o", inputPricePer1K: 2.5, outputPricePer1K: 10.0 },
  { model: "gpt-4o-mini", inputPricePer1K: 0.15, outputPricePer1K: 0.6 },
];
```

### 4.4 LLM Logger 인터셉터

```typescript
// llmLogger.ts - API 호출 자동 로깅
class LLMLogger {
  private store: DebugStore;

  logRequest(config: LLMRequestConfig): string {
    const logId = generateId();
    const log: LLMCallLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      status: "pending",
      model: config.model,
      provider: config.provider,
      endpoint: config.endpoint,
      method: config.method || "POST",
      requestHeaders: this.sanitizeHeaders(config.headers),
      requestBody: config.body,
    };
    this.store.addLog(log);
    return logId;
  }

  logResponse(logId: string, response: LLMResponse): void {
    const usage = this.extractUsage(response);
    this.store.updateLog(logId, {
      status: "success",
      statusCode: response.status,
      duration: response.duration,
      responseHeaders: response.headers,
      responseBody: response.body,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      cost: this.calculateCost(usage),
    });
  }

  logError(logId: string, error: Error): void {
    this.store.updateLog(logId, {
      status: "error",
      error: error.message,
    });
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    // API 키 및 민감 정보 마스킹
    const sanitized = { ...headers };
    if (sanitized["x-api-key"]) {
      sanitized["x-api-key"] = this.maskApiKey(sanitized["x-api-key"]);
    }
    if (sanitized["authorization"]) {
      sanitized["authorization"] = this.maskApiKey(sanitized["authorization"]);
    }
    return sanitized;
  }
}
```

---

## 5. 비기능 요구사항

### 5.1 성능

- 로그 추가 오버헤드: 10ms 이내
- 로그 목록 렌더링: 100개 항목 100ms 이내
- 필터 적용: 50ms 이내
- 내보내기 (1000개 로그): 1초 이내

### 5.2 보안

- API 키는 항상 마스킹되어 표시
- 로그는 메모리에만 저장 (영구 저장X)
- 개발 모드에서만 접근 가능

### 5.3 접근성

- 키보드 네비게이션 지원
- 상태 인디케이터는 색상 + 아이콘 이중 표현
- 고대비 모드 지원

---

## 6. 관련 문서

- [프로젝트 구조](../../project/structure.md)
- [기술 스택](../../project/tech.md)
- [SPEC-CLAUDE-001: Claude 통합](../SPEC-CLAUDE-001/spec.md)
- [LLM Provider 설정](../llm-settings.md)
