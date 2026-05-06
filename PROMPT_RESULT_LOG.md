# 프롬프트 수행 내역 및 결과 보고서

작성일: 2026-05-05

## 1. 문서 목적

본 문서는 `pcf-frontend-jh` 프로젝트에서 AI 도구를 활용해 수행한 주요 작업 요청과 결과를 정리한 보고서입니다. 각 항목은 실제 개발 요청의 의도를 기준으로 정리했으며, 회사 제출용 문서에 적합하도록 요청 배경, 수행 내용, 산출물, 검증 결과 중심으로 작성했습니다.

## 2. 프로젝트 전체 코드 분석 문서 작성

### 2.1 요청 프롬프트 요약

프로젝트 루트 경로의 전체 코드를 분석하고, 분석 결과를 한국어 Markdown 문서로 작성하도록 요청했습니다.

### 2.2 수행 내용

`pcf-frontend-jh` 프로젝트의 주요 디렉터리와 파일을 분석했습니다.

분석 범위는 다음과 같습니다.

- Next.js App Router 기반 구조
- `app/layout.tsx`, `app/page.tsx`의 페이지 구성
- Dashboard 관련 Presenter 컴포넌트
- DetailSearch 관련 검색 테이블 컴포넌트
- styled-components 기반 스타일 파일
- Ant Design, Recharts, Prisma 등 주요 의존성
- Prisma 및 PostgreSQL 연동 준비 상태
- 린트, 타입체크, 빌드 가능 여부

### 2.3 산출물

루트 경로에 다음 문서를 생성했습니다.

```text
CODEBASE_ANALYSIS.md
```

해당 문서에는 다음 내용이 포함되었습니다.

- 프로젝트 개요
- 주요 기술 스택
- 디렉터리 구조 요약
- 애플리케이션 렌더링 흐름
- 주요 컴포넌트별 역할 분석
- 전역 스타일 및 styled-components 구조 분석
- 데이터베이스 및 백엔드 연동 상태
- 현재 구현 완성도 평가
- 개선 필요 항목
- 향후 개발 권장 순서

### 2.4 결과

프로젝트가 현재 PCF 대시보드의 초기 화면 구현 단계이며, 주요 데이터와 기능은 정적 목업 중심으로 구성되어 있음을 문서화했습니다. 또한 실제 서비스 수준으로 확장하기 위해 필요한 API 연동, Prisma 모델 설계, 필터 상태 관리, 업로드/다운로드 기능 구현 등의 개선 방향을 정리했습니다.

### 2.5 검증

다음 명령을 실행하여 프로젝트 상태를 확인했습니다.

```bash
yarn lint
yarn tsc --noEmit
yarn build
```

검증 결과 ESLint, TypeScript 타입체크, Next.js 빌드는 통과했습니다. 빌드 중 기존 프로젝트 상태와 관련된 Next.js workspace root 추론 경고와 Recharts 컨테이너 크기 경고가 확인되었습니다.

## 3. Ant Design 컴포넌트 공용화 및 스타일 모듈화

### 3.1 요청 프롬프트 요약

프로젝트 내에서 직접 사용 중인 Ant Design 컴포넌트를 `components/common` 하위의 커스텀 컴포넌트로 분리하고, 기존 사용처를 공용 컴포넌트 기반으로 교체하도록 요청했습니다.

추가로, 기존 `components/common/Button/button.ts`에 작성된 Button 커스텀 스타일 방식을 참고하여 이를 기준으로 프로젝트의 코드 스타일을 유지하면서 모듈화하도록 요청했습니다.

이후 `components/Dashboard/styles.ts`에 정의된 레이아웃 및 화면 스타일도 재사용 가능한 구조로 분리하여 파일 구조만 모듈화하는 방향으로 조정했습니다.

### 3.2 수행 내용

Ant Design 컴포넌트를 직접 import하던 구조를 줄이고, 공용 컴포넌트 계층을 구성했습니다.

생성 및 정리한 공용 컴포넌트 파일은 다음과 같습니다.

```text
components/common/
  Button/button.ts
  Card/card.ts
  DatePicker/datePicker.ts
  Input/input.ts
  Message/message.ts
  PageLayout/pageLayout.ts
  SelectBox/selectBox.ts
  Table/table.ts
  Tag/tag.ts
  Upload/upload.ts
  index.ts
```

`components/common/index.ts`는 공용 컴포넌트 re-export 진입점으로 구성했습니다. 이를 통해 외부 컴포넌트는 하위 파일 경로를 직접 참조하지 않고 다음 방식으로 import할 수 있게 정리했습니다.

```ts
import { Button, Input, Select, RangePicker, Table } from "@/components/common";
```

### 3.3 주요 변경 파일

공용 컴포넌트 적용을 위해 다음 파일의 import 경로와 사용 컴포넌트를 정리했습니다.

- `app/page.tsx`
- `components/Dashboard/DashboardPresenter/Header.tsx`
- `components/Dashboard/DashboardPresenter/FilterBarSection.tsx`
- `components/DetailSearch/DetailSearchPresenter/SearchTable.tsx`
- `components/Dashboard/styles.ts`
- `components/DetailSearch/styles.ts`

### 3.4 Button 공용화 결과

`components/common/Button/button.ts`는 Ant Design Button을 styled-components로 감싼 공용 버튼 컴포넌트로 정리했습니다.

주요 결과는 다음과 같습니다.

- `Button`, `CustomButton` export 제공
- `CustomButtonProps`, `CustomColor` 타입 export 제공
- `customColor` prop을 통한 프로젝트 색상 선택 구조 유지
- 기존 코드 스타일에 맞춰 styled-components 기반 래퍼 구조 유지
- 외부 사용처는 `@/components/common`에서 import하도록 정리

### 3.5 Table 공용화 결과

상세검색 화면에서 사용하던 테이블 스타일을 업무용 기본 테이블로 분리했습니다.

적용 기준은 다음과 같습니다.

- 기존 `components/DetailSearch/styles.ts`에 정의되어 있던 Table 스타일 값 유지
- 임의의 hover, border, pagination 스타일 추가 없이 기존 디자인만 공용화
- `components/common/Table/table.ts`에서 공용 Table로 export
- `components/DetailSearch/styles.ts`에서는 공용 Table을 참조하도록 정리

### 3.6 Dashboard 스타일 모듈화 결과

`components/Dashboard/styles.ts`에 정의되어 있던 레이아웃, 카드, 차트 관련 styled-components를 공용 파일로 분리했습니다.

적용 기준은 다음과 같습니다.

- 기존 export 변수명 유지
- 기존 CSS 속성값 유지
- 기존 화면 컴포넌트의 사용 방식 유지
- 실제 스타일 정의만 `components/common/PageLayout/pageLayout.ts`, `components/common/Card/card.ts` 등으로 이동

따라서 `components/Dashboard/styles.ts`는 대시보드 화면에서 사용하는 의미 있는 스타일 이름을 유지하면서, 내부적으로는 공용 스타일 모듈을 참조하는 구조가 되었습니다.

### 3.7 결과

Ant Design 컴포넌트와 주요 styled-components를 재사용 가능한 공용 구조로 분리했습니다. 화면 컴포넌트는 AntD 하위 경로를 직접 참조하지 않고 `components/common`을 통해 공용 컴포넌트를 사용할 수 있게 되었습니다.

또한 기존 UI 속성값과 변수명을 유지하여, 기존 화면 구조와 스타일 의미가 크게 바뀌지 않도록 조정했습니다.

### 3.8 검증

다음 명령을 실행하여 변경사항을 검증했습니다.

```bash
yarn tsc --noEmit
yarn lint
yarn build
```

검증 결과 TypeScript 타입체크, ESLint, Next.js 빌드는 통과했습니다. 빌드 중 남은 경고는 기존과 동일한 Next.js workspace root 추론 경고와 Recharts 컨테이너 크기 경고입니다.

## 4. API 코드 생성 프롬프트 작성 의도 분석

### 4.1 요청 프롬프트 요약

현재 API 코드는 다음 구조를 기준으로 작성되었습니다.

- `app/api/.../route.ts`는 HTTP 요청과 응답만 담당
- `app/server/carbon/service.ts`는 필터링, 페이지네이션, 정규화, 요약 계산 같은 비즈니스 로직 담당
- `app/server/carbon/repository.ts`는 활동 데이터 조회 담당
- `app/lib/carbon-api.ts`는 API 요청/응답 타입 담당
- `app/lib/carbon-data.ts`는 샘플 데이터, 배출계수 매칭, 배출량 계산 담당

이 구조에서 중요한 작성 의도는 route 파일을 얇게 유지하고, 실제 계산과 조회 책임을 service, repository, lib 레이어드 아키텍쳐 계층으로 나누어야합니다.

또한 각 endpoint가 필요로 하는 기능만 포함하도록 범위를 제한했습니다. 예를 들어 활동 목록 API에는 활동 조회와 정규화 로직만 포함하고, 대시보드 요약 API에는 Scope별 합계와 월별 집계 로직만 포함하는 방식입니다.

### 4.3 프롬프트에 포함해야 하는 핵심 조건

- 생성할 API endpoint를 명확히 지정
- `route.ts`는 요청 파싱, service 호출, 성공/오류 응답만 담당하도록 요청
- 비즈니스 로직은 `app/server/carbon/service.ts`로 분리하도록 요청
- 데이터 조회 로직은 `app/server/carbon/repository.ts`로 분리하도록 요청
- API 요청/응답 타입은 `app/lib/carbon-api.ts`로 분리하도록 요청
- 탄소 활동 데이터, 배출계수 매칭, 배출량 계산 로직은 `app/lib/carbon-data.ts`로 분리하도록 요청
- 현재 endpoint에서 직접 사용하지 않는 다른 API용 함수는 포함하지 않도록 명시
- import 경로는 프로젝트 alias인 `@/app/...`를 사용하도록 명시
- 완료 후 타입체크, 린트, 빌드로 검증
- 생성 또는 수정된 파일 목록을 제시

### 4.4 권장 프롬프트 형식

다음 형식으로 요청하면 지금까지 만든 코드와 같은 방식의 결과를 얻을 수 있습니다.

```text
[대상 API 경로]에 해당하는 Next.js App Router API 코드를 작성해줘.

요구사항:
- app/api/[대상 경로]/route.ts를 만들고, route 파일은 HTTP 요청/응답 처리만 담당하게 해줘.
- 실제 비즈니스 로직은 app/server/carbon/service.ts에 함수로 분리해줘.
- 데이터 조회 로직은 app/server/carbon/repository.ts로 분리해줘.
- API 요청/응답 타입은 app/lib/carbon-api.ts에 정의해줘.
- 탄소 활동 데이터, 배출계수 매칭, 배출량 계산은 app/lib/carbon-data.ts에 정의해줘.
- import 경로는 @/app/... alias를 사용해줘.
- 이 endpoint에서 직접 쓰지 않는 다른 API용 함수는 추가하지 마.

기능 요구사항:
- [GET/POST 등 HTTP method]를 구현해줘.
- [query parameter 또는 request body]를 검증해줘.
- 성공 응답과 오류 응답은 Response.json()으로 반환해줘.
- 서버 API로 동작하도록 runtime = "nodejs", dynamic = "force-dynamic"을 명시해줘.

완료 후 다음을 확인해줘.
- endpoint에 필요한 로직만 포함됐는지
- 다른 API 전용 함수가 섞이지 않았는지
- yarn tsc --noEmit 통과 여부
- yarn lint 통과 여부
- yarn build 통과 여부
- 생성 또는 수정된 파일 목록
```

### 4.5 원인과 결과 분석

#### 원인 1. route 파일은 얇은 컨트롤러 역할로 작성되어 있음

`app/api/carbon-activities/route.ts`와 `app/api/carbon-dashboard/summary/route.ts`는 요청 객체에서 필요한 값만 꺼내 service 함수를 호출하고, 결과를 `Response.json()`으로 반환합니다.

이런 구조를 얻기 위해서는 프롬프트에서 route 파일에 계산 로직을 직접 넣지 말고 service 계층으로 분리하라고 요청해야 합니다.

결과적으로 route 파일은 작고 읽기 쉬우며, 오류 처리 방식도 일관되게 유지됩니다.

#### 원인 2. 활동 목록 조회는 필터링과 페이지네이션이 필요함

`GET /api/carbon-activities`는 단순 목록 반환이 아니라 `startDate`, `endDate`, `scopes`, `rules`, `page`, `pageSize`를 처리합니다.

이 결과를 얻기 위해서는 프롬프트에 기간 필터, Scope 필터, 상세 조건 필터, 페이지네이션을 명시해야 합니다.

결과적으로 `parseActivityQuery`, `filterByBase`, `applyRules`, `evaluateSingleRule`, `listCarbonActivities` 같은 service 함수가 생성됩니다.

#### 원인 3. 업로드 rows 정규화는 배출계수 계산 로직이 필요함

`POST /api/carbon-activities`는 rows 배열을 받아 필수 컬럼을 검증하고, 활동 유형과 단위에 맞는 배출계수를 찾아 탄소 배출량을 계산합니다.

이 결과를 얻기 위해서는 프롬프트에 원본 row 타입, 필수 컬럼 검증, 배출계수 매칭, accepted/rejected 분리 응답을 명시해야 합니다.

결과적으로 `SourceActivityRow`, `EmissionFactor`, `calculateCarbonActivity`, `resolveEmissionFactor`, `normalizeImportedRows` 같은 타입과 함수가 생성됩니다.

#### 원인 4. 대시보드 요약은 활동 목록 데이터를 재사용함

`GET /api/carbon-dashboard/summary`는 별도의 원천 데이터를 만들지 않고, 활동 목록 데이터를 기준으로 요약 값을 계산합니다.

이 결과를 얻기 위해서는 프롬프트에 기존 활동 데이터 조회 함수를 재사용하고, Scope별 KPI와 월별 배출량을 계산하라고 요청해야 합니다.

결과적으로 `getCarbonDashboardSummary`, `sumByScope`, `buildMonthlyRows`, `CarbonDashboardSummary`, `MonthlyEmissionRow`가 생성됩니다.

#### 원인 5. API 응답 타입을 명확히 분리해야 함

활동 목록 응답과 대시보드 요약 응답은 서로 다른 구조를 가집니다.

이 결과를 얻기 위해서는 프롬프트에 API 응답 타입을 `app/lib/carbon-api.ts`에 정의하라고 요청해야 합니다.

결과적으로 `CarbonActivityPage`, `CarbonDashboardSummary`, `MonthlyEmissionRow`, `CarbonBaseFilters`, `ActivityFilterRule` 같은 타입이 생성됩니다.

### 4.6 코드 생성 결과

분석 대상 코드에서 확인되는 API endpoint는 다음과 같습니다.

```text
/api/carbon-activities
/api/carbon-dashboard/summary
```

`/api/carbon-activities` 결과는 다음과 같습니다.

- 활동 목록 조회 API 생성
- 기간, Scope, 상세 조건 필터 처리
- 페이지네이션 처리
- 업로드 원본 rows 정규화 처리
- 배출계수 매칭 및 배출량 계산 로직 연결
- route, service, repository, lib 타입 계층 분리

`/api/carbon-dashboard/summary` 결과는 다음과 같습니다.

- 대시보드 요약 API 생성
- 기간 및 Scope 필터 재사용
- Scope별 KPI 합계 계산
- 12개월 월별 배출량 계산
- 기존 activity repository 재사용
- dashboard 응답 타입 분리

### 4.7 검증 결과

API 코드에 대해 다음 명령을 실행했습니다.

```bash
yarn tsc --noEmit
yarn lint
yarn build
```

검증 결과 TypeScript 타입체크, ESLint, Next.js 빌드는 통과했습니다.

Next.js 빌드 결과 API route는 다음과 같이 확인되었습니다.

```text
/api/carbon-activities
/api/carbon-dashboard/summary
```

빌드 중 Next.js workspace root 추론 경고와 Recharts 컨테이너 크기 경고가 표시되었지만, 해당 경고는 API 코드의 실패 원인은 아니었습니다.
