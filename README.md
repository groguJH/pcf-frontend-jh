# PCF Carbon Dashboard

제품 탄소발자국(PCF) 활동 데이터를 업로드하고, Scope별 배출량을 조회/관리하는 Next.js 기반 대시보드입니다.
<img width="995" height="799" alt="홈화면" src="https://github.com/user-attachments/assets/288dd5b0-d086-4fc5-a958-8c599e0f829c" />


## 목차

- [프로젝트 개요](#프로젝트-개요)
- [로컬 실행 방법](#로컬-실행-방법)
- [기술 스택](#기술-스택)
- [설계 구조](#설계-구조)
- [기술 선택 이유](#기술-선택-이유)
- [ERD 다이어그램](#erd-다이어그램)
- [스키마 다이어그램](#스키마-다이어그램)
- [주요 라이브러리](#주요-라이브러리)
- [주요 명령어](#주요-명령어)
- [환경 변수](#환경-변수)

## 프로젝트 개요

- 이 프로젝트는 제품 탄소발자국 관리를 위한 업무형 대시보드입니다.
- 비전문가도 직관적으로 데이터를 입력하고 결과를 확인할 수 있도록 데이터를 차트 및 테이블로 시각화하였습니다.
- 모바일 환경에도 대응할 수 있도록 주로 레이아웃은 반응형으로 작성했으며
  미디어쿼리를 적용했습니다. 데이터 테이블은 컬럼수가 많아 모바일에서는 고정레이아웃과 말줄임처리를 적용했습니다.
- 활동 데이터는 엑셀 업로드로 등록하고, 배출원 카테고리와 배출계수는 관리자 화면에서 수정/관리합니다.

주요 기능:

- Scope별 월간 배출량 추이 및 비율 대시보드
- 활동 내역 상세 조건 조회 및 Excel 다운로드
- 활동 데이터 Excel 업로드 및 업로드 전 검증
- 배출원 카테고리 관리
- 배출계수 버전 등록 및 소급 정정
- 배출계수 변경 시 관련 활동 내역 재계산



## 로컬 실행 방법

아래 순서대로 실행하면 `yarn start`까지 오류 없이 실행할 수 있습니다.

1. 의존성을 설치합니다.

```bash
yarn install
```

2. PostgreSQL 컨테이너를 실행합니다.

```bash
docker compose up -d
```

3. 개발환경을 구성합니다.

```bash
yarn setup:dev
```

`yarn setup:dev`는 PostgreSQL 접속 대기, Prisma client 생성, DB schema 반영, carbon master data seed, Next.js build를 순서대로 수행합니다.

4. 앱을 실행합니다.

```bash
yarn start
```

5. 브라우저에서 접속합니다.

```text
http://localhost:3000
```

## 기술 스택

### 프론트엔드

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=000000)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-6.3.7-1677FF?style=for-the-badge&logo=antdesign&logoColor=white)
![Styled Components](https://img.shields.io/badge/styled--components-6.4.1-DB7093?style=for-the-badge&logo=styledcomponents&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3.8.1-22B5BF?style=for-the-badge)

### 백엔드

![Next.js API Routes](https://img.shields.io/badge/Next.js%20Route%20Handler-16.2.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

### 데이터베이스

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### 개발 및 실행 환경

![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Yarn](https://img.shields.io/badge/Yarn-1.22-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white)

## 설계 구조

```text
app/
  page.tsx                         # 메인 대시보드
  admin/                           # 관리자 화면
    carbon-activities/import/      # 활동 데이터 Excel 업로드
    emission-categories/           # 배출원 카테고리 관리
    emission-factors/              # 배출계수 관리
  api/                             # Next.js Route Handler API
    carbon-activities/
    carbon-dashboard/summary/
    emission-categories/
    emission-factors/
  lib/                             # 클라이언트 공통 타입/유틸
  server/                          # 서버 전용 서비스와 DB 접근

components/
  common/                          # 공용 UI 컴포넌트
  Dashboard/                       # 대시보드 UI
  DetailSearch/                    # 상세 조건 조회 UI
  Carbon/                          # 탄소 도메인 UI

prisma/
  schema.prisma                    # DB schema

scripts/
  setup-dev.ts                     # 로컬 환경 구성 자동화
  seed-carbon-master-data.ts       # 카테고리/배출계수 초기 데이터
```

전체 흐름:

```mermaid
flowchart LR
  User[사용자] --> UI[Next.js 화면]
  UI --> ApiClient[공통 API Client]
  ApiClient --> API[Route Handler API]
  API --> Service[서버 서비스]
  Service --> Repository[Repository]
  Repository --> Prisma[Prisma Client]
  Prisma --> DB[(PostgreSQL)]

  Excel[Excel 파일] --> Upload[활동 데이터 업로드 화면]
  Upload --> Validate[카테고리/배출계수 검증]
  Validate --> API
```

## 다음의 기술을 선택한 이유

- Next.js App Router : 화면과 API Route Handler를 같은 프로젝트에서 관리하며 향상된 렌더링 최적화를 보여줍니다.
- React 19 : 대시보드, 관리자 화면, 업로드 미리보기처럼 상태 기반 및 메타데이터 지원으로 인해 UI를 컴포넌트 단위로 구성하기 좋습니다.
- TypeScript : API 응답, 업로드 row, 필터 조건, DB 모델 매핑의 타입 안정성을 확보합니다.
- Ant Design : 테이블, 모달, 폼, 업로드, 메시지 등 관리자성 UI를 빠르게 일관된 형태로 구성할 수 있습니다.
- styled-components : 컴포넌트 중심의 스타일관리로, 공용 컴포넌트와 도메인별 화면 스타일을 가까운 위치에서 관리합니다.
- Prisma : PostgreSQL schema와 타입 안전한 DB 접근 코드를 함께 관리할 수 있습니다.
- PostgreSQL : 활동 내역, 배출계수 이력, 카테고리 관계처럼 정형 데이터를 안정적으로 저장합니다.
- Recharts : 월별 Scope 배출량과 비율을 React 컴포넌트 방식으로 빠르게 시각화해줍니다.
- xlsx: 브라우저에서 Excel/CSV 파일을 파싱하고 내보내는 기능에 사용합니다.
- Docker Compose : 로컬 PostgreSQL 환경을 동일한 설정으로 재현합니다.

## ERD 다이어그램

```mermaid
erDiagram
  EMISSION_CATEGORIES ||--o{ ACTIVITIES : "type, scope"

  EMISSION_CATEGORIES {
    varchar type PK
    varchar scope PK
  }

  EMISSION_FACTORS {
    int id PK
    varchar type
    varchar description
    varchar unit
    decimal factor_value
    date valid_from
    date valid_to
  }

  ACTIVITIES {
    int id PK
    date activity_date
    varchar scope FK
    varchar type FK
    varchar description
    decimal amount
    varchar unit
    decimal applied_factor
    decimal emission
  }
```

참고:

- `activities.type + activities.scope`는 `emission_categories.type + emission_categories.scope`를 참조합니다.
- `emission_factors`는 활동 데이터 업로드와 배출량 재계산 시 `type`, `description`, `unit`, `valid_from`, `valid_to` 조건으로 논리 매칭합니다.
- 활동 내역은 계산 시점의 배출계수를 `applied_factor`로 스냅샷 저장합니다.

## 스키마 다이어그램

```mermaid
classDiagram
  class EmissionCategory {
    +String type
    +String scope
    +Activity[] activities
  }

  class EmissionFactor {
    +Int id
    +String type
    +String description
    +String unit
    +Decimal factorValue
    +DateTime validFrom
    +DateTime? validTo
  }

  class Activity {
    +Int id
    +DateTime activityDate
    +String scope
    +String type
    +String description
    +Decimal amount
    +String unit
    +Decimal appliedFactor
    +Decimal emission
  }

  EmissionCategory "1" --> "0..*" Activity : category
```

DB 테이블 매핑:

| Prisma Model       | DB Table              | 설명                                     |
| ------------------ | --------------------- | ---------------------------------------- |
| `EmissionCategory` | `emission_categories` | 배출원 유형과 Scope 분류 마스터          |
| `EmissionFactor`   | `emission_factors`    | 배출원/상세내역/단위/유효기간별 배출계수 |
| `Activity`         | `activities`          | 업로드된 활동 내역과 계산 결과           |

다음과 같이 설계한 이유:

- 화면, API, 서버 서비스, DB 접근 계층을 분리해 UI 변경과 데이터 처리 로직 변경의 영향을 줄였습니다.
- 활동 데이터 업로드 전 검증은 클라이언트에서 미리 수행하고, 최종 저장은 API에서 다시 검증해 사용자 피드백과 데이터 무결성을 함께 확보했습니다.
- 배출계수는 버전 이력을 유지하고, 활동 내역에는 계산 시점의 계수 값을 `applied_factor`로 스냅샷 저장했습니다.
- 현재 요구사항은 대용량 트랜잭션 처리보다 관리자 조회/업로드 중심의 소규모 데이터에 가깝기 때문에, 일부 반정규화를 선택해 조회와 재계산 로직을 단순화했습니다.

데이터 일부 반정규화 trade-off:

```
model Activity {
  activityDate   DateTime
  scope          String
  type           String
  description    String
  amount         Decimal
  unit           String
  appliedFactor  Decimal
  emission       Decimal
  category       EmissionCategory @relation(fields: [type, scope], references: [type, scope])
}

```

활동 내역에는 `type`, `description`, `unit`, `scope`, `applied_factor`, `emission` 값을 함께 저장했습니다. 데이터 양이 크지 않고, 화면에서 바로 조회하거나 엑셀로 내려받는 일이 많아서 매번 여러 테이블을 조인하는 구조보다 단순한 쪽을 선택했습니다.

대신 단점도 있습니다. 마스터 데이터의 이름이나 기준이 바뀌어도 이미 저장된 활동 내역의 텍스트 값은 자동으로 바뀌지 않습니다. 또 배출계수를 소급 정정하면 기존 활동 내역의 `applied_factor`, `emission`도 다시 계산해야 합니다. 그래서 배출계수 정정 API에서 관련 활동 데이터를 같이 갱신하도록 처리했습니다.

현재 규모에서는 이 방식이 구현과 조회가 단순해서 적합하다고 판단했습니다. 다만 데이터가 많아지거나 마스터 변경 이력이 더 중요해지면, 활동 내역과 마스터 데이터를 더 정규화하거나 별도 집계 테이블을 두는 방식으로 바꿀 수 있습니다.

## 주요 라이브러리

| 라이브러리                     | 용도                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| `next`                         | App Router, page routing, API Route Handler                    |
| `react`, `react-dom`           | 화면 컴포넌트 렌더링                                           |
| `antd`                         | Table, Modal, Button, Upload, DatePicker, Empty 등 UI 컴포넌트 |
| `@ant-design/icons`            | 버튼과 메뉴 아이콘                                             |
| `@ant-design/nextjs-registry`  | Next.js 환경에서 Ant Design style registry 처리                |
| `styled-components`            | 공용 스타일 컴포넌트와 화면별 스타일                           |
| `recharts`                     | 월별 배출량 차트                                               |
| `xlsx`                         | Excel/CSV 업로드 파싱 및 Excel 다운로드                        |
| `dayjs`                        | 날짜 선택/포맷 처리                                            |
| `prisma`, `@prisma/client`     | DB schema 관리와 Prisma Client 생성                            |
| `@prisma/adapter-pg`, `pg`     | Prisma PostgreSQL adapter 및 DB 접속                           |
| `tsx`                          | TypeScript 기반 setup/seed 스크립트 실행                       |
| `dotenv`                       | `.env` 환경 변수 로딩                                          |
| `eslint`, `eslint-config-next` | 코드 정적 검사                                                 |

## 주요 명령어

| 명령어                | 설명                                                 |
| --------------------- | ---------------------------------------------------- |
| `yarn setup:dev`      | 로컬 DB 대기, Prisma 생성/반영, seed, build까지 수행 |
| `yarn dev`            | 개발 서버 실행                                       |
| `yarn start`          | 빌드된 앱 실행                                       |
| `yarn build`          | Next.js 프로덕션 빌드                                |
| `yarn lint`           | ESLint 검사                                          |
| `yarn tsc --noEmit`   | TypeScript 타입 검사                                 |
| `yarn db:seed:carbon` | 배출원 카테고리와 배출계수 초기 데이터 등록          |

## 환경 변수

DB 접속 정보는 `.env`에서 관리합니다. Docker Compose와 애플리케이션이 같은 값을 사용합니다.

```env
DB_USER="myuser"
DB_PASSWORD="mypassword"
DB_NAME="pcf_db"
DB_PORT="5432"
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/pcf_db?schema=public"
```

## 초기 데이터 정책

`yarn setup:dev`와 `yarn db:seed:carbon`은 활동 내역 데이터를 넣지 않습니다.

초기 등록 대상:

- 배출원 카테고리
- 배출계수

활동 내역은 관리자 화면의 Excel 업로드 기능으로 등록합니다.
