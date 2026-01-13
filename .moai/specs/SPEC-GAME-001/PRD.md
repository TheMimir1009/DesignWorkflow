# PRD (Product Requirements Document)
## Test Task Action RPG - Development Specification

---

## 문서 정보 (Document Information)
- **프로젝트 명:** Test Task Action RPG
- **문서 유형:** 개발 요구사항 명세서 (PRD)
- **버전:** 1.0
- **작성일:** 2026-01-11
- **기반 문서:** GDD-TestTask-Final.md

---

## 1. Executive Summary (개요)

### 1.1 Development Objectives (개발 목표)
탐험-전투-전리품 수집의 핵심 루프를 구현하는 액션 RPG 게임을 개발합니다. 플레이어는 다양한 적과 전투를 벌이고, 전리품을 수집하여 성장하며, 최종적으로 보스를 격파하는 것을 목표로 합니다.

주요 개발 목표:
- 핵심 게임 루프(탐험-전투-전리품-성장) 구현
- PC 및 모바일 플랫폼 지원
- 실시간 전투 시스템과 피드백 시스템 구현
- 캐릭터 성장 시스템(레벨업, 장비, 스킬) 구현
- 다양한 지역과 난이도 곡선 구현

### 1.2 Scope and Boundaries (범위 및 경계)

#### In Scope (포함 범위)
- 싱글 플레이어 액션 RPG 코어 게임플레이
- 3개 캐릭터 클래스 (검사, 마법사, 도적)
- 5개 지역 스테이지 (초원, 숲, 동굴, 화산, 성채)
- 전투 시스템 (기본 공격, 스킬, 회피)
- 성장 시스템 (레벨업, 장비, 스킬 트리)
- 경제 시스템 (골드, 상점, 아이템)
- 인벤토리 및 장비 관리
- PC (Windows/macOS) 및 모바일 (iOS/Android) 지원

#### Out of Scope (제외 범위)
- 멀티플레이어 기능 (추후 고려)
- 길드 시스템
- PvP 컨텐츠
- 실시간 이벤트 던전
- VR 지원

### 1.3 Key Deliverables (주요 산출물)
- 실행 가능한 게임 클라이언트 (PC 및 모바일)
- 게임 서버 (계정, 저장, 리더보드)
- API 명세서
- 데이터베이스 스키마
- 테스트 suites
- 배포 파이프라인

---

## 2. Technical Stack & Architecture (기술 스택 및 아키텍처)

### 2.1 Frontend Technology (프론트엔드 기술)

#### PC Version
- **게임 엔진:** Unity 2022.3 LTS 또는 Unreal Engine 5.3
- **프로그래밍 언어:** C# (Unity) 또는 C++ (Unreal)
- **UI 프레임워크:** Unity UI Toolkit / UMG
- **빌드 타겟:** Windows x64, macOS x64/ARM64

#### Mobile Version
- **게임 엔진:** Unity 2022.3 LTS (모바일 최적화)
- **프로그래밍 언어:** C#
- **빌드 타겟:** iOS (ARM64), Android (ARM64)
- **필요 라이브러리:**
  - Firebase Analytics
  - AdMob (선택적 광고)
  - Unity In-App Purchasing

#### 공통 UI/UX
- **가상 조이스틱:** 조이스틱 패키지 (Joystick Pack)
- **입력 시스템:** Unity Input System 또는 Enhanced Input System
- **옵션 관리:** PlayerPrefs 클라우드 동기화

### 2.2 Backend Technology (백엔드 기술)

#### 게임 서버
- **프레임워크:** Node.js 22 LTS + Express.js 또는 Go 1.23+ + Gin
- **아키텍처:** 마이크로서비스 (분리된 서비스)
  - Auth Service (인증)
  - Game Service (게임 데이터)
  - Leaderboard Service (리더보드)
  - Inventory Service (인벤토리)

#### API 통신
- **프로토콜:** HTTPS REST API
- **실시간 통신:** WebSocket (추후 멀티플레이어 대비)
- **데이터 포맷:** JSON

#### 인증 및 보안
- **인증:** JWT (JSON Web Token)
- **OAuth:** Google, Apple 로그인 지원
- **암호화:** TLS 1.3
- **API 보안:** Rate Limiting, CORS 설정

### 2.3 Database Selection (데이터베이스)

#### 주 데이터베이스
- **PostgreSQL 16:** 구조화된 데이터 저장
  - 사용자 계정
  - 캐릭터 정보
  - 게임 진행 상황
  - 리더보드

#### 캐시 데이터베이스
- **Redis 7:** 빠른 접근이 필요한 데이터
  - 세션 정보
  - 실시간 리더보드
  - Rate Limiting 카운터

#### 데이터 저장소
- **AWS S3 또는 Cloudflare R2:** 아이템 이미지, 리소스

### 2.4 Infrastructure Requirements (인프라 요구사항)

#### 클라우드 제공자
- **주요:** AWS (Amazon Web Services)
- **대안:** Google Cloud Platform 또는 Cloudflare

#### 서비스 구성
- **컴퓨팅:**
  - AWS EC2 또는 ECS (Fargate)
  - Auto Scaling Group (부하 분산)
- **데이터베이스:**
  - AWS RDS PostgreSQL 16 (Multi-AZ)
  - AWS ElastiCache Redis
- **스토리지:**
  - AWS S3 (아이템 이미지, 리소스)
- **CDN:**
  - CloudFront (글로벌 컨텐츠 배포)
- **DNS:**
  - Route 53

#### 모니터링 및 로깅
- **APM:** Datadog 또는 New Relic
- **로깅:** CloudWatch Logs 또는 ELK Stack
- **에러 트래킹:** Sentry
- **메트릭:** Prometheus + Grafana

---

## 3. System Architecture (시스템 아키텍처)

### 3.1 High-Level Architecture (시스템 구조)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   PC Client  │  │ iOS Client   │  │ Android Cl.  │          │
│  │  (Unity/C#)  │  │  (Unity/C#)  │  │  (Unity/C#)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │  CloudFront CDN │
                    └────────┬────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                     API Gateway / Load Balancer                  │
└────────────────────────────┼────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  Auth Service  │  │  Game Service   │  │ Leaderboard   │
│  (Node.js/Go)  │  │  (Node.js/Go)   │  │   Service     │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   PostgreSQL   │  │     Redis       │  │       S3       │
│    (RDS)       │  │  (ElastiCache)  │  │    (Storage)   │
└────────────────┘  └─────────────────┘  └────────────────┘
```

### 3.2 Component Breakdown (컴포넌트 분해)

#### Client Components (클라이언트 컴포넌트)
1. **GameEngineCore:** Unity/Unreal 엔진 초기화 및 라이프사이클 관리
2. **InputManager:** 키보드, 마우스, 터치 입력 처리
3. **NetworkManager:** API 요청, WebSocket 연결
4. **SceneManager:** 씬 전환, 로딩 화면
5. **UIManager:** UI 렌더링, 이벤트 처리
6. **AudioManager:** BGM, 효과음 재생
7. **CombatSystem:** 전투 로직, 충돌 감지
8. **CharacterController:** 캐릭터 이동, 애니메이션
9. **InventoryManager:** 아이템 관리, 장비 장착
10. **SaveManager:** 로컬 저장, 클라우드 동기화

#### Server Components (서버 컴포넌트)
1. **AuthService:** 사용자 인증, JWT 발급, OAuth
2. **GameService:** 캐릭터 데이터, 진행 상황, 저장/로드
3. **InventoryService:** 인벤토리, 아이템 획득/소모
4. **LeaderboardService:** 랭킹 계산, 정렬
5. **MatchService:** (추후) 매칭 시스템

### 3.3 Data Flow (데이터 흐름)

#### 게임 시작 및 로그인 흐름
```
1. 클라이언트 실행 → 로컬 저장 확인
2. 로그인 요청 → AuthService
3. 인증 성공 → JWT 토큰 발급
4. 캐릭터 데이터 요청 → GameService
5. 데이터 로드 → 게임 시작
```

#### 전투 및 보상 흐름
```
1. 전투 시작 → 로컬 계산 (클라이언트)
2. 적 처치 → 경험치, 골드 획득 (로컬)
3. 전투 종료 → 결과 전송 → GameService
4. 서버 검증 → 데이터 저장
5. 리더보드 업데이트 (신기록 시)
```

#### 아이템 획득 흐름
```
1. 아이템 드롭 → 로컬 생성
2. 인벤토리 추가 요청 → InventoryService
3. 서버 검증 (용량, 중복)
4. 저장 성공 → 클라이언트 반영
```

### 3.4 External Service Integrations (외부 서비스 연동)

#### 인증 서비스
- **Google OAuth 2.0:** 구글 계정 로그인
- **Sign in with Apple:** 애플 계정 로그인
- **Facebook Login (선택적):** 페이스북 계정 로그인

#### 분석 서비스
- **Firebase Analytics:** 사용자 행동 추적
- **Google Analytics 4:** 이벤트 추적

#### 수익화 서비스 (모바일)
- **Unity IAP:** 인앱 결제
- **AdMob:** 보상형 광고

#### 푸시 알림 (선택적)
- **Firebase Cloud Messaging:** 이벤트 알림

---

## 4. API Design (API 설계)

### 4.1 API Endpoints List (API 엔드포인트 목록)

#### Authentication API (/api/v1/auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /register | 신규 계정 생성 |
| POST | /login | 이메일/비밀번호 로그인 |
| POST | /oauth/google | 구글 OAuth 로그인 |
| POST | /oauth/apple | 애플 OAuth 로그인 |
| POST | /refresh | JWT 토큰 갱신 |
| POST | /logout | 로그아웃 |

#### Character API (/api/v1/characters)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | 캐릭터 목록 조회 |
| POST | / | 신규 캐릭터 생성 |
| GET | /:id | 캐릭터 상세 조회 |
| PUT | /:id | 캐릭터 정보 수정 |
| DELETE | /:id | 캐릭터 삭제 |

#### Game Progress API (/api/v1/progress)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /:characterId | 진행 상황 조회 |
| POST | /:characterId/save | 진행 상황 저장 |
| POST | /:characterId/complete-stage | 스테이지 완료 |

#### Inventory API (/api/v1/inventory)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /:characterId | 인벤토리 조회 |
| POST | /:characterId/items | 아이템 획득 |
| PUT | /:characterId/items/:itemId | 아이템 수정 |
| DELETE | /:characterId/items/:itemId | 아이템 삭제 |
| POST | /:characterId/equip | 장비 장착 |

#### Leaderboard API (/api/v1/leaderboard)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /global | 전체 랭킹 |
| GET | /:stageId | 스테이지별 랭킹 |
| GET | /:characterId/rank | 내 랭킹 |

#### Shop API (/api/v1/shop)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /items | 상점 아이템 목록 |
| POST | /buy | 아이템 구매 |
| POST | /sell | 아이템 판매 |

### 4.2 Request/Response Format (요청/응답 형식)

#### 공통 응답 형식
```json
{
  "success": true,
  "data": { /* 데이터 */ },
  "error": null,
  "timestamp": "2026-01-11T00:00:00Z"
}
```

#### 에러 응답 형식
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {}
  },
  "timestamp": "2026-01-11T00:00:00Z"
}
```

#### 예시: 로그인 요청/응답
**Request:**
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "Player1"
    }
  },
  "error": null
}
```

#### 예시: 캐릭터 생성 요청/응답
**Request:**
```json
POST /api/v1/characters
{
  "name": "MyWarrior",
  "class": "warrior",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "char_456",
    "name": "MyWarrior",
    "class": "warrior",
    "level": 1,
    "stats": {
      "hp": 100,
      "mp": 50,
      "attack": 15,
      "defense": 10
    },
    "createdAt": "2026-01-11T00:00:00Z"
  },
  "error": null
}
```

### 4.3 Authentication Requirements (인증 요구사항)

#### JWT Token 구조
- **Access Token:** 15분 유효, API 요청에 사용
- **Refresh Token:** 30일 유효, 토큰 갱신에 사용

#### 인증 헤더
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 보안 요구사항
- 비밀번호: 최소 8자, 영문+숫자+특수문자 조합
- bcrypt 해싱 (cost factor 12)
- 로그인 실패 시 5회 연속 실패 시 15분 계정 잠금
- IP 기반 Rate Limiting (분당 100회 요청)

### 4.4 Rate Limiting and Security (보안 요구사항)

#### Rate Limiting
- **인증 없는 요청:** IP당 분당 20회
- **인증된 요청:** 사용자당 분당 100회
- **특별 엔드포인트 (저장/로드):** 사용자당 분당 10회

#### CORS 설정
- 허용된 도메인: 게임 클라이언트 도메인만
- 허용된 메서드: GET, POST, PUT, DELETE
- 허용된 헤더: Authorization, Content-Type

#### 데이터 검증
- 모든 입력값 sanitize 및 validation
- SQL Injection 방지 (Prepared Statements)
- XSS 방지 (입력값 이스케이프)

---

## 5. Database Schema (데이터베이스 스키마)

### 5.1 Entity Definitions (엔티티 정의)

#### users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  oauth_provider VARCHAR(20),
  oauth_id VARCHAR(255)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### characters 테이블
```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  class VARCHAR(20) NOT NULL, -- 'warrior', 'mage', 'rogue'
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  current_hp INTEGER DEFAULT 100,
  max_hp INTEGER DEFAULT 100,
  current_mp INTEGER DEFAULT 50,
  max_mp INTEGER DEFAULT 50,
  gold INTEGER DEFAULT 0,
  skill_points INTEGER DEFAULT 0,
  current_stage_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_level ON characters(level DESC);
```

#### character_stats 테이블
```sql
CREATE TABLE character_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  strength INTEGER DEFAULT 10,
  agility INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  vitality INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_character_stats_character_id ON character_stats(character_id);
```

#### items 테이블 (아이템 마스터)
```sql
CREATE TABLE items (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'weapon', 'armor', 'consumable', 'accessory'
  rarity VARCHAR(20) NOT NULL, -- 'common', 'magic', 'rare', 'epic', 'legendary'
  base_price INTEGER NOT NULL,
  base_stats JSONB,
  description TEXT,
  icon_url VARCHAR(255),
  is_stackable BOOLEAN DEFAULT false,
  max_stack INTEGER DEFAULT 1
);

CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_rarity ON items(rarity);
```

#### inventory 테이블
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id VARCHAR(50) NOT NULL REFERENCES items(id),
  quantity INTEGER DEFAULT 1,
  slot_index INTEGER,
  is_equipped BOOLEAN DEFAULT false,
  enchant_level INTEGER DEFAULT 0,
  custom_stats JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_character_id ON inventory(character_id);
CREATE INDEX idx_inventory_is_equipped ON inventory(character_id, is_equipped);
```

#### skills 테이블 (스킬 마스터)
```sql
CREATE TABLE skills (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  class VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'attack', 'defense', 'utility'
  description TEXT,
  icon_url VARCHAR(255),
  unlock_level INTEGER NOT NULL,
  max_level INTEGER DEFAULT 5,
  base_damage INTEGER,
  base_cost INTEGER,
  cooldown INTEGER,
  stats_per_level JSONB
);

CREATE INDEX idx_skills_class ON skills(class);
```

#### character_skills 테이블
```sql
CREATE TABLE character_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  skill_id VARCHAR(50) NOT NULL REFERENCES skills(id),
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(character_id, skill_id)
);

CREATE INDEX idx_character_skills_character_id ON character_skills(character_id);
```

#### stage_progress 테이블
```sql
CREATE TABLE stage_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  stage_id VARCHAR(50) NOT NULL,
  best_time_seconds INTEGER,
  best_score INTEGER,
  completion_count INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  first_completed_at TIMESTAMP,
  last_completed_at TIMESTAMP,
  UNIQUE(character_id, stage_id)
);

CREATE INDEX idx_stage_progress_character_id ON stage_progress(character_id);
CREATE INDEX idx_stage_progress_best_score ON stage_progress(stage_id, best_score DESC NULLS LAST);
```

#### leaderboards 테이블
```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  stage_id VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  clear_time_seconds INTEGER NOT NULL,
  class VARCHAR(20) NOT NULL,
  level INTEGER NOT NULL,
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leaderboards_stage_score ON leaderboards(stage_id, score DESC);
CREATE INDEX idx_leaderboards_stage_time ON leaderboards(stage_id, clear_time_seconds ASC);
```

### 5.2 Relationships (관계)

- **users → characters:** 1:N (한 사용자는 여러 캐릭터 보유 가능)
- **characters → character_stats:** 1:1 (캐릭터별 스테이터스)
- **characters → inventory:** 1:N (캐릭터별 인벤토리)
- **characters → character_skills:** 1:N (캐릭터별 스킬)
- **characters → stage_progress:** 1:N (캐릭터별 스테이지 진행상황)
- **items → inventory:** 1:N (아이템별 인벤토리 아이템)
- **skills → character_skills:** 1:N (스킬별 캐릭터 스킬)

### 5.3 Indexing Strategy (인덱싱 전략)

#### 주요 인덱스
1. **사용자 조회:** email, username (UNIQUE)
2. **캐릭터 조회:** user_id, level (정렬용)
3. **인벤토리 조회:** character_id, is_equipped (장착 아이템 빠른 조회)
4. **스테이지 진행상황:** character_id, best_score (순위 계산용)
5. **리더보드:** stage_id, score DESC, clear_time ASC (랭킹용)

#### 컴포지트 인덱스
- (stage_id, score DESC): 스테이지별 랭킹 조회
- (character_id, stage_id): 캐릭터별 스테이지 진행상황
- (character_id, is_equipped): 장착 아이템 조회

### 5.4 Data Migration Considerations (마이그레이션 고려사항)

#### 초기 데이터 마이그레이션
1. **아이템 마스터 데이터:** 게임에 존재하는 모든 아이템 미리 로드
2. **스킬 마스터 데이터:** 모든 스킬 데이터 미리 로드
3. **스테이지 데이터:** 5개 지역, 50개 스테이지 구성 데이터

#### 버전 관리
- 데이터베이스 마이그레이션 스크립트 버전 관리
- 롤백 가능한 마이그레이션
- 마이그레이션 실행 로그 기록

#### 백업 및 복구
- 매일 자정 전체 백업
- 실시간 WAL (Write-Ahead Log) 아카이빙
- 재해 복구 시나리오 테스트 (RTO < 1시간, RPO < 5분)

---

## 6. Frontend Component Structure (프론트엔드 컴포넌트 구조)

### 6.1 Page/View Hierarchy (페이지 구조)

#### 메인 화면 (MainMenu)
- Logo/Banner
- 메뉴 버튼 그룹
  - 새 게임 시작
  - 이어하기
  - 설정
  - 나가기

#### 캐릭터 선택 화면 (CharacterSelect)
- 캐릭터 슬롯 목록 (최대 5개)
- 새 캐릭터 생성 버튼
- 캐릭터 삭제 버튼

#### 게임 플레이 화면 (GamePlay)
- HUD (Head-Up Display)
- 게임 월드 렌더링
- 일시정지 메뉴 (ESC)

#### 인벤토리 화면 (Inventory)
- 캐릭터 모델 뷰
- 장비 슬롯 (무기, 방패, 갑옷, 투구, 장갑, 신발, 장신구)
- 인벤토리 그리드 (6x8 슬롯)
- 아이템 상세 팝업
- 정렬/필터 버튼

#### 스킬 트리 화면 (SkillTree)
- 스킬 트리 다이어그램
- 스킬 포인트 표시
- 스킬 설명 패널
- 스킬 레벨업 버튼

#### 상점 화면 (Shop)
- 카테고리 탭 (무기, 방어구, 소비품)
- 아이템 목록
- 구매/판매 버튼
- 골드 표시

#### 설정 화면 (Settings)
- 볼륨 슬라이더 (마스터, BGM, SFX)
- 그래픽 옵션 (해상도, 품질, VSync)
- 조작 설정
- 계정 정보

### 6.2 Reusable Component List (재사용 컴포넌트)

#### UI 컴포넌트
1. **Button:** 기본 버튼 (호버, 클릭 효과)
2. **IconButton:** 아이콘이 있는 버튼
3. **ProgressBar:** 진행률 바 (HP, MP, 경험치)
4. **FloatingText:** 데미지/회복 플로팅 텍스트
5. **Icon:** 아이템 아이콘, 스킬 아이콘
6. **Tooltip:** 아이템/스킬 설명 툴팁
7. **Modal:** 모달 다이얼로그
8. **Toast:** 알림 메시지
9. **Slider:** 볼륨/옵션 슬라이더
10. **Toggle:** 온/오프 스위치

#### 게임 컴포넌트
1. **Character:** 플레이어 캐릭터
2. **Enemy:** 적 캐릭터 (일반, 엘리트, 보스)
3. **ItemPickup:** 바닥에 떨어진 아이템
4. **Interactable:** 상호작용 가능한 오브젝트
5. **DamageZone:** 지형 데미지 구역
6. **Checkpoint:** 체크포인트

#### 시스템 컴포넌트
1. **GameManager:** 게임 상태 관리
2. **SaveManager:** 저장/로드
3. **AudioManager:** 오디오 재생
4. **PoolManager:** 오브젝트 풀링
5. **FadeManager:** 페이드 인/아웃

### 6.3 State Management Approach (상태 관리)

#### 로컬 상태 (클라이언트)
- ScriptableObject 기반 데이터 저장
- PlayerPrefs 사용자 설정
- JSON 직렬화 로컬 저장

#### 서버 동기화
- 중요 데이터는 서버 저장
- 낙관적 업데이트 (로컬 즉시 반영, 서버 비동기 전송)
- 충돌 해결: 최신 서버 데이터 우선

#### 상태 카테고리
1. **PersistentState:** 캐릭터, 인벤토리, 진행상황 (서버 저장)
2. **SessionState:** 현재 게임 세션, 전투 상태 (임시)
3. **SettingsState:** 사용자 설정 (로컬 저장)

### 6.4 Routing Structure (라우팅 구조)

#### 씬 구조 (Unity SceneManager)
```
Scenes/
├── Boot.unity                  # 초기 로딩
├── MainMenu.unity              # 메인 메뉴
├── CharacterSelect.unity       # 캐릭터 선택
├── CharacterCreation.unity     # 캐릭터 생성
├── GameLoading.unity           # 게임 로딩
├── GamePlay.unity              # 게임 플레이
│   ├── World1_Grassland.unity  # 초원 지역
│   ├── World2_Forest.unity     # 숲 지역
│   ├── World3_Cave.unity       # 동굴 지역
│   ├── World4_Volcano.unity    # 화산 지역
│   └── World5_Fortress.unity   # 성채 지역
├── Inventory.unity             # 인벤토리
├── SkillTree.unity             # 스킬 트리
├── Shop.unity                  # 상점
└── Settings.unity              # 설정
```

#### 씬 전환 로직
1. 비동기 씬 로드 (LoadSceneAsync)
2. 로딩 화면 표시 (진행률 바)
3. 리소스 프리로딩 (에셋 번들)
4. 메모리 관리 (사용하지 않는 씬 언로드)

---

## 7. Implementation Requirements (구현 요구사항)

### 7.1 Feature-by-Feature Requirements (기능별 구현 요구사항)

#### Phase 1: Core Foundation (핵심 기초)

##### 1.1 프로젝트 초기화
- Unity/Unreal 프로젝트 설정
- 빌드 파이프라인 구축
- 버전 관리 설정
- CI/CD 구성

##### 1.2 기본 시스템
- 입력 시스템 (키보드, 마우스, 터치)
- 오디오 시스템 (BGM, 효과음)
- UI 프레임워크 설정
- 씬 관리 시스템

#### Phase 2: Authentication & Character (인증 및 캐릭터)

##### 2.1 인증 시스템
- 이메일/비밀번호 회원가입
- 로그인/로그아웃
- OAuth (Google, Apple)
- JWT 토큰 관리
- 세션 유지

##### 2.2 캐릭터 시스템
- 캐릭터 생성 (검사, 마법사, 도적)
- 캐릭터 선택/삭제
- 캐릭터 스테이터스 (HP, MP, 공격력, 방어력)
- 캐릭터 저장/로드

#### Phase 3: Movement & Basic Combat (이동 및 기본 전투)

##### 3.1 이동 시스템
- 8방향 이동 (WASD/조이스틱)
- 대시 (회피)
- 충돌 감지
- 카메라 추적

##### 3.2 기본 전투
- 기본 공격 (3콤보)
- 적 AI (추적, 공격)
- 데미지 계산
- HP 바 표시
- 피격 효과

#### Phase 4: Skills & Combat Mechanics (스킬 및 전투 메커닉)

##### 4.1 스킬 시스템
- 스킬 트리 UI
- 스킬 레벨업
- 스킬 사용 (마나 소비)
- 쿨다운 시스템
- 스킬 이펙트

##### 4.2 전투 메커닉
- 회피 (롤링, 무적 시간)
- 치명타 시스템
- 상태 이상 (선택적)
- 보스 패턴

#### Phase 5: Progression Systems (성장 시스템)

##### 5.1 레벨업 시스템
- 경험치 획득
- 레벨업
- 능력치 포인트 배분
- 스테이터스 증가

##### 5.2 장비 시스템
- 인벤토리 UI
- 장비 장착/해제
- 장비 등급 (일반~전설)
- 장비 강화 (+1~+15)

##### 5.3 스킬 성장
- 스킬 포인트 획득
- 스킬 레벨업
- 새로운 스킬 슬롯 해금

#### Phase 6: Economy & Items (경제 및 아이템)

##### 6.1 경제 시스템
- 골드 획득/소비
- 상점 UI
- 구매/판매
- 가격 계산

##### 6.2 아이템 시스템
- 소비 아이템 (포션)
- 아이템 드롭
- 아이템 획득 이펙트
- 아이템 정렬/필터

#### Phase 7: Content & Progress (콘텐츠 및 진행)

##### 7.1 스테이지 진행
- 5개 지역 구현
- 50개 스테이지
- 체크포인트 시스템
- 난이도 곡선

##### 7.2 보스 시스템
- 보스 전투
- 보스 패턴
- 페이즈 전환
- 보상

#### Phase 8: UI/UX Polish (UI/UX 마무리)

##### 8.1 HUD 개선
- 미니맵
- 퀘스트 추적
- 스킬 바
- 버프/디버프 표시

##### 8.2 메뉴 시스템
- 일시정지 메뉴
- 설정 화면
- 인벤토리 정리

#### Phase 9: Social & Extras (소셜 및 추가 기능)

##### 9.1 리더보드
- 스테이지별 랭킹
- 전체 랭킹
- 내 랭킹 표시

##### 9.2 튜토리얼
- 튜토리얼 씬
- 가이드 텍스트
- 조작법 설명

#### Phase 10: Optimization & Release (최적화 및 출시)

##### 10.1 최적화
- 프레임 개선
- 메모리 최적화
- 에셋 번들
- LOD 구현

##### 10.2 출시 준비
- 버그 수정
- 테스트
- 배포
- 마케팅 자료

### 7.2 Priority Order (우선순위)

#### P0 (최우선) - MVP 릴리스 필수
1. 인증 시스템 (로그인/회원가입)
2. 캐릭터 생성/선택
3. 기본 이동
4. 기본 공격
5. 간단한 적 AI
6. 인벤토리 (기본)
7. 1개 지역 완성

#### P1 (높음) - 핵심 게임플레이
1. 스킬 시스템
2. 레벨업 시스템
3. 장비 장착
4. 보스 전투
5. 3개 지역
6. 경제 시스템 (상점)

#### P2 (중간) - 풍부한 경험
1. 스킬 트리
2. 장비 강화
3. 5개 지역 모두
4. 난이도 모드
5. 리더보드
6. 튜토리얼

#### P3 (낮음) - 추가 기능
1. 하드코어 모드
2. 무한 던전
3. 업적 시스템
4. 코스메틱 아이템

### 7.3 Dependencies Between Features (기능간 의존성)

```
[인증] ← 필수 → [캐릭터] ← 필수 → [이동] ← 필수 → [전투]
                                              ↓
                                         [스킬] ← 의존 → [레벨업]
                                              ↓
                                         [장비] ← 의존 → [경제]
                                              ↓
                                         [스테이지] ← 의존 → [보스]
                                              ↓
                                         [리더보드] ← 의존 → [소셜]
```

### 7.4 Estimated Complexity (복잡도 추정)

| 기능 | 복잡도 | 예상 작업량 |
|------|--------|-------------|
| 인증 시스템 | 중간 | 3-5일 |
| 캐릭터 시스템 | 중간 | 5-7일 |
| 이동 시스템 | 낮음 | 2-3일 |
| 기본 전투 | 높음 | 7-10일 |
| 스킬 시스템 | 높음 | 10-14일 |
| 레벨업 시스템 | 중간 | 5-7일 |
| 인벤토리 | 중간 | 5-7일 |
| 장비 시스템 | 높음 | 10-14일 |
| 경제 시스템 | 중간 | 5-7일 |
| 스테이지 디자인 | 매우 높음 | 20-30일 |
| 보스 시스템 | 높음 | 10-14일 |
| 리더보드 | 낮음 | 3-5일 |
| UI/UX | 중간 | 10-14일 |
| 최적화 | 높음 | 7-10일 |

---

## 8. Acceptance Criteria (검증 기준)

### 8.1 Functional Acceptance Criteria (기능적 검증 기준)

#### 인증 시스템
- [ ] 이메일/비밀번호로 회원가입 가능
- [ ] 잘못된 자격증명으로 로그인 시 적절한 에러 메시지 표시
- [ ] Google OAuth로 로그인 가능
- [ ] 로그인 상태가 15분간 유지됨 (access token)
- [ ] 토큰 만료 시 자동 갱신됨

#### 캐릭터 시스템
- [ ] 3개 클래스 중 하나로 캐릭터 생성 가능
- [ ] 캐릭터 이름이 중복되지 않음
- [ ] 캐릭터 삭제 시 연관된 모든 데이터 삭제
- [ ] 최대 5개 캐릭터 생성 가능

#### 전투 시스템
- [ ] 기본 공격이 적에게 데미지 입힘
- [ ] 3콤보가 정상 작동함
- [ ] 회피 시 0.5초간 무적 상태
- [ ] 적이 플레이어를 추적함
- [ ] 적의 공격이 플레이어에게 데미지 입힘
- [ ] HP가 0이 되면 사망 처리

#### 스킬 시스템
- [ ] 스킬 사용 시 마나 소비됨
- [ ] 쿨다운이 정상 작동함
- [ ] 스킬 레벨업 시 데미지 증가
- [ ] 스킬 포인트가 정상 소비됨

#### 인벤토리
- [ ] 아이템 획득 시 인벤토리에 추가됨
- [ ] 장비 장착 시 스테이터스 반영됨
- [ ] 인벤토리가 가득 차면 아이템 획득 불가
- [ ] 소비 아이템 사용 시 소모됨

#### 경제 시스템
- [ ] 몬스터 처치 시 골드 획득
- [ ] 상점에서 아이템 구매 가능
- [ ] 골드가 부족하면 구매 불가
- [ ] 아이템 판매 시 골드 획득

### 8.2 Performance Criteria (성능 기준)

#### 프레임 레이트
- [ ] PC: 최소 60 FPS (권장 120 FPS)
- [ ] 모바일: 최소 30 FPS (권장 60 FPS)

#### 로딩 시간
- [ ] 씬 전환: 3초 이내
- [ ] 게임 시작: 5초 이내
- [ ] 저장/로드: 1초 이내

#### 네트워크
- [ ] API 응답 시간: 200ms 이하 (평균)
- [ ] 로그인: 1초 이내
- [ ] 저장: 500ms 이하

#### 메모리
- [ ] PC: 2GB 이하
- [ ] 모바일: 1GB 이하

### 8.3 Security Criteria (보안 기준)

#### 클라이언트 보안
- [ ] 치터 방지 (서버 검증)
- [ ] 데이터 위변조 방지 (서버 저장)
- [ ] API 키가 노출되지 않음

#### 서버 보안
- [ ] 비밀번호가 bcrypt로 해싱됨
- [ ] SQL Injection 방지
- [ ] XSS 방지
- [ ] Rate Limiting 적용
- [ ] HTTPS 통신만 허용

#### 계정 보안
- [ ] 비밀번호: 최소 8자, 영문+숫자+특수문자
- [ ] 5회 연속 실패 시 15분 계정 잠금
- [ ] 세션 타임아웃 (30일)

### 8.4 User Experience Criteria (UX 기준)

#### 접근성
- [ ] 처음 플레이어가 5분 내에 조작법 이해 가능
- [ ] 튜토리얼이 명확하게 제공됨
- [ ] 모든 버튼에 툴팁 제공

#### 일관성
- [ ] 모든 메뉴에서 ESC로 뒤로가기 가능
- [ ] 일관된 UI 스타일
- [ ] 일관된 단축키

#### 피드백
- [ ] 모든 버튼 클릭에 시각적 피드백
- [ ] 데미지가 플로팅 텍스트로 표시됨
- [ ] 레벨업 시 특수 효과

#### 오류 처리
- [ ] 네트워크 오류 시 친절한 메시지
- [ ] 저장 실패 시 재시도 옵션
- [ ] 충돌 시 자동 복구

---

## 문서 끝

**버전:** 1.0
**작성일:** 2026-01-11
**기반 문서:** GDD-TestTask-Final.md
**문서 상태:** 개발 요구사항 명세 완료
