# pcf-frontend-jh 코드 분석 문서

작성일: 2026-05-04

## 1. 프로젝트 개요

`pcf-frontend-jh`는 제품 탄소발자국(PCF, Product Carbon Footprint) 데이터를 시각화하기 위한 Next.js 기반 프론트엔드 프로젝트입니다. 현재 구현된 화면은 단일 대시보드 페이지이며, 탄소 배출량 요약 카드, 기간/Scope 필터, 월별 배출량 차트, 상세 조건 검색 테이블로 구성되어 있습니다.

현재 데이터 흐름은 실제 API나 데이터베이스와 연결되어 있지 않고, 컴포넌트 내부에 선언된 정적 목업 데이터를 화면에 렌더링하는 단계입니다.

## 2. 주요 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16.2.4, App Router |
| UI 런타임 | React 19.2.4, React DOM 19.2.4 |
| 언어 | TypeScript |
| UI 라이브러리 | Ant Design 6.3.7 |
| 스타일링 | styled-components 6.4.1 |
| 차트 | Recharts 3.8.1 |
| 날짜 처리 | dayjs |
| DB/ORM 준비 | Prisma 7.8.0, PostgreSQL 드라이버 `pg` |
| API 문서화 준비 | swagger-jsdoc, swagger-ui-react |
| 검증 라이브러리 준비 | zod |
| 패키지 매니저 | Yarn Classic |

## 3. 디렉터리 구조 요약

```text
app/
  layout.tsx        # 전역 HTML 레이아웃, AntD/styled-components Registry 연결
  page.tsx          # 메인 대시보드 페이지
  globals.css       # 전역 CSS 리셋 및 기본 폰트/레이아웃 설정

components/
  Dashboard/
    DashboardPresenter/
      Header.tsx
      FilterBarSection.tsx
      ChartCardSection.tsx
      MonthlyChartSection.tsx
    styles.ts
  DetailSearch/
    DetailSearchPresenter/
      SearchTable.tsx
    styles.ts
  common/
    Button/
      button.ts     # AntD Button 기반 공용 버튼 래퍼
    Input/          # 디렉터리만 존재
    PageLayout/     # 디렉터리만 존재
    SelectBox/      # 디렉터리만 존재

lib/
  registry.tsx      # styled-components SSR Registry

prisma/
  schema.prisma     # Prisma 설정 파일, 모델은 아직 없음
```

## 4. 애플리케이션 흐름

### 4.1 전역 레이아웃

`app/layout.tsx`는 한국어 문서(`lang="ko"`)로 HTML을 설정하고, 페이지 전체를 `AntdRegistry`와 `StyledComponentsRegistry`로 감쌉니다.

- `AntdRegistry`: Next.js App Router 환경에서 Ant Design 스타일을 안정적으로 주입하기 위한 구성입니다.
- `StyledComponentsRegistry`: 서버 렌더링 시 styled-components 스타일을 수집하고 주입하기 위한 커스텀 Registry입니다.
- 메타데이터는 `PCF Carbon Dashboard`와 한국어 설명으로 설정되어 있습니다.

### 4.2 메인 페이지

`app/page.tsx`는 `"use client"`가 선언된 클라이언트 컴포넌트입니다. 이 페이지는 다음 프리젠터 컴포넌트를 순서대로 조합합니다.

1. `DashboardHeader`
2. `FilterBarSection`
3. `ChartCardSection`
4. `MonthlyChartSection`
5. `SearchTable`

현재는 라우트가 `/` 하나만 존재하며, 빌드 결과에서도 `/`와 `/_not-found`만 확인됩니다.

## 5. 주요 컴포넌트 분석

### 5.1 DashboardHeader

파일: `components/Dashboard/DashboardPresenter/Header.tsx`

역할:

- 대시보드 제목과 설명을 표시합니다.
- Excel 가져오기 버튼을 Ant Design `Upload` 컴포넌트로 제공합니다.
- 리포트 다운로드 버튼을 표시합니다.

현재 상태:

- 업로드 대상이 외부 Mock API(`mockapi.io`)로 지정되어 있습니다.
- 업로드 헤더의 authorization 값도 임시 문자열입니다.
- 업로드 상태 변경 시 `console.log`가 남아 있습니다.
- 리포트 다운로드 버튼은 UI만 있고 실제 동작은 연결되어 있지 않습니다.

### 5.2 FilterBarSection

파일: `components/Dashboard/DashboardPresenter/FilterBarSection.tsx`

역할:

- 조회 기간을 선택하는 `RangePicker`를 표시합니다.
- 직접배출, 간접배출, 가치사슬 버튼을 표시합니다.

현재 상태:

- 기본 조회 기간은 `2025-01-01`부터 `2025-12-31`까지입니다.
- 필터 값은 상태로 관리되지 않고, 차트/테이블 데이터와 연결되어 있지 않습니다.
- Scope 버튼은 시각적 버튼만 있으며 선택 상태나 필터링 로직은 없습니다.

### 5.3 ChartCardSection

파일: `components/Dashboard/DashboardPresenter/ChartCardSection.tsx`

역할:

- 총 탄소 배출량, 직접 배출, 간접 배출, 가치 사슬의 요약 카드를 표시합니다.

현재 상태:

- 모든 카드 값이 `2,150.00 톤`으로 하드코딩되어 있습니다.
- 실제 집계 로직, 단위 변환, 필터 연동은 아직 구현되어 있지 않습니다.

### 5.4 MonthlyChartSection

파일: `components/Dashboard/DashboardPresenter/MonthlyChartSection.tsx`

역할:

- Recharts의 `ComposedChart`를 사용해 월별 배출량을 막대와 선 그래프로 표시합니다.

현재 상태:

- 1월부터 8월까지의 정적 데이터만 있습니다.
- `scope1`, `scope2`, `scope3`, `total` 데이터 구조가 있지만, 실제로 렌더링되는 막대는 `scope1`뿐입니다.
- `total`은 선 그래프로 표시됩니다.
- 빌드 시 Recharts 컨테이너 크기와 관련된 경고가 출력됩니다.

### 5.5 SearchTable

파일: `components/DetailSearch/DetailSearchPresenter/SearchTable.tsx`

역할:

- 상세 조건 검색 UI와 결과 테이블을 표시합니다.
- 조건 추가, 조회하기, Excel 다운로드 버튼을 제공합니다.
- Scope별 태그 색상을 다르게 표시합니다.

현재 상태:

- 테이블 데이터는 컴포넌트 내부 `dataSource` 배열에 하드코딩되어 있습니다.
- 페이지네이션 total은 `14`로 설정되어 있지만 실제 데이터는 3건입니다.
- 조건 UI는 표시되지만 실제 검색 조건 상태나 필터링 로직은 없습니다.
- 조건 추가와 다운로드 버튼도 아직 동작이 연결되어 있지 않습니다.

## 6. 스타일 구조

### 6.1 전역 스타일

파일: `app/globals.css`

- 모든 요소에 `box-sizing: border-box`를 적용합니다.
- 기본 margin/padding을 제거합니다.
- `html`, `body`에 가로 오버플로우 방지와 반응형 `font-size`를 적용합니다.
- 기본 폰트는 Arial/Helvetica 계열입니다.

주의할 점:

- `font-size: clamp(10px, calc(10 / 390 * 100vw), 16px)`는 뷰포트 폭에 따라 rem 기준이 크게 변합니다. 모바일 기준 설계에는 유용하지만, 데스크톱에서 컴포넌트 크기가 예상보다 커질 수 있어 실제 디자인 기준과 함께 검토가 필요합니다.

### 6.2 Dashboard styles

파일: `components/Dashboard/styles.ts`

- 대시보드 전체 레이아웃, 헤더, 필터 바, 버튼 영역, 카드, 차트 컨테이너 스타일이 정의되어 있습니다.
- 반응형 분기점은 주로 `768px`, `900px`, `480px`입니다.

주의할 점:

- `background-color: blue/red/green/yellow`처럼 디버깅용으로 보이는 색상이 남아 있습니다.
- `ChartSection`은 현재 사용처가 확인되지 않습니다.
- 카드와 차트 컨테이너의 border-radius가 1.6rem으로 비교적 큽니다. 향후 디자인 시스템이 정해지면 토큰화하는 편이 좋습니다.

### 6.3 DetailSearch styles

파일: `components/DetailSearch/styles.ts`

- 상세 검색 영역, 액션 버튼 그룹, 조건 필터 바, AntD Table 커스터마이징, Scope 태그 스타일이 정의되어 있습니다.
- Scope 값에 따라 태그 색상을 분기합니다.

주의할 점:

- `StyledTable = styled(Table)` 형태라 AntD Table 제네릭 타입은 구체화되어 있지 않습니다.
- 검색 영역은 데스크톱 중심의 가로 배치이며, 모바일 대응 스타일이 아직 부족합니다.

## 7. 데이터베이스 및 백엔드 연동 상태

### 7.1 Prisma

파일:

- `prisma/schema.prisma`
- `prisma.config.ts`

현재 상태:

- PostgreSQL datasource가 설정되어 있습니다.
- `DATABASE_URL`은 `.env`에서 읽도록 구성되어 있습니다.
- Prisma Client 출력 경로는 `lib/generated/prisma`입니다.
- Prisma 모델은 아직 정의되어 있지 않습니다.
- 마이그레이션 디렉터리(`prisma/migrations`)는 설정되어 있지만 현재 파일 목록에서는 확인되지 않습니다.

### 7.2 API 레이어

현재 `app/api` 또는 별도 API 클라이언트/서비스 계층은 확인되지 않습니다.

설치된 의존성 중 `pg`, `zod`, `swagger-jsdoc`, `swagger-ui-react`가 있지만 현재 애플리케이션 코드에서는 사용되지 않고 있습니다. 향후 서버 API, 입력 검증, Swagger 문서화를 염두에 두고 추가된 것으로 보입니다.

## 8. 현재 검증 결과

아래 명령을 실행해 현재 상태를 확인했습니다.

```bash
yarn lint
yarn tsc --noEmit
yarn build
```

결과:

- ESLint 통과
- TypeScript 타입체크 통과
- Next.js 프로덕션 빌드 통과

빌드 중 확인된 경고:

- 상위 경로에 다른 lockfile(`C:\Users\rkdww\package-lock.json`)이 있어 Next.js가 workspace root를 추론했다는 경고가 출력됩니다.
- Recharts 차트 컨테이너의 width/height가 `-1`로 계산될 수 있다는 경고가 출력됩니다. `ResponsiveContainer`의 부모 높이 계산 또는 SSR/프리렌더링 시점의 크기 측정 문제를 점검할 필요가 있습니다.

## 9. 구현 완성도 평가

현재 프로젝트는 PCF 대시보드의 화면 뼈대와 주요 UI 컴포넌트가 빠르게 구성된 초기 단계로 보입니다.

잘 되어 있는 부분:

- Next.js App Router, TypeScript, AntD, styled-components, Recharts 조합이 기본적으로 동작합니다.
- AntD와 styled-components를 App Router 환경에서 사용하기 위한 Registry 구성이 들어가 있습니다.
- 대시보드, 필터, 차트, 상세 테이블 영역이 컴포넌트 단위로 분리되어 있습니다.
- 린트, 타입체크, 빌드가 모두 통과합니다.

아직 목업 또는 미구현인 부분:

- 실제 API/DB 데이터 연동이 없습니다.
- 업로드, 다운로드, 조건 추가, 검색 버튼의 실제 비즈니스 로직이 없습니다.
- 필터 값이 상태로 관리되지 않고 차트/테이블과 연결되어 있지 않습니다.
- Prisma 스키마에 도메인 모델이 없습니다.
- 공용 컴포넌트 디렉터리는 `Button` 외에는 대부분 비어 있습니다.
- README는 create-next-app 기본 문서 상태입니다.

## 10. 우선 개선 제안

1. 목업 데이터를 별도 파일 또는 서비스 계층으로 분리
   - `MonthlyChartSection`과 `SearchTable` 내부의 정적 데이터를 분리하면 실제 API 연동으로 넘어가기 쉬워집니다.

2. 필터 상태 관리 추가
   - 조회 기간과 Scope 선택 값을 `HomePage` 또는 별도 상태 훅에서 관리하고, 카드/차트/테이블에 공통으로 전달하는 구조가 필요합니다.

3. 업로드/다운로드 기능 실제화
   - Mock API 주소와 임시 authorization 값을 제거하고, 프로젝트 내부 API 또는 백엔드 엔드포인트로 연결해야 합니다.
   - `console.log`는 운영 코드에서 제거하는 것이 좋습니다.

4. Prisma 도메인 모델 설계
   - 예: 사업장, 제품, 배출 활동, Scope, 배출계수, 측정 단위, 업로드 이력 등의 모델을 정의할 수 있습니다.

5. 차트 컨테이너 경고 해결
   - `ResponsiveContainer` 부모 요소의 명확한 높이, `min-height`, 클라이언트 렌더링 시점 처리 등을 점검해야 합니다.

6. 디자인 디버그 색상 정리
   - `blue`, `red`, `green`, `yellow` 배경색은 실제 UI 색상 체계로 교체하거나 제거해야 합니다.

7. 공용 컴포넌트 정리
   - `Button` 컴포넌트의 prop 이름과 스타일 적용 방식을 정리하고, 비어 있는 Input/SelectBox/PageLayout 디렉터리는 실제 구현 예정이 아니라면 정리하는 편이 좋습니다.

8. README 갱신
   - 프로젝트 목적, 실행 방법, 환경 변수, 주요 명령어, 폴더 구조, 개발 규칙을 현재 코드에 맞게 갱신하는 것이 좋습니다.

## 11. 권장 다음 작업 순서

1. 실제 PCF 데이터 모델 확정
2. Prisma schema 작성 및 migration 생성
3. 대시보드 조회 API 설계
4. 현재 목업 데이터를 API 응답 형태로 교체
5. 필터/검색 상태 관리 구현
6. Excel 업로드/다운로드 플로우 구현
7. UI 디버그 스타일 제거 및 반응형 보완
8. 핵심 로직 단위 테스트 추가

## 12. common/Button/button.ts 상세 분석

파일: `components/common/Button/button.ts`

### 12.1 현재 코드 역할

이 파일은 Ant Design의 `Button` 컴포넌트를 프로젝트 공용 버튼으로 감싸는 래퍼입니다. 외부에서는 `Button` 함수를 import해서 사용하고, 내부에서는 styled-components로 감싼 `CustomButton`이 실제 렌더링을 담당합니다.

핵심 구성:

- `CustomColor`: 사용할 수 있는 프로젝트 버튼 색상 이름을 제한하는 union 타입입니다.
- `CustomButtonProps`: AntD `ButtonProps`에서 `type`, `variant`, `color`를 제외한 뒤 프로젝트용 prop을 다시 정의한 인터페이스입니다.
- `Button`: 기본값을 적용하고 `React.createElement`로 `CustomButton`을 생성하는 래퍼 함수입니다.
- `CustomButton`: AntD Button에 공통 정렬 스타일과 색상 오버라이드를 추가한 styled-components 컴포넌트입니다.

### 12.2 props 설계

`variant`는 프로젝트 컴포넌트에서는 별도 prop처럼 보이지만, 내부적으로는 AntD Button의 `type` prop으로 전달됩니다.

지원하는 `variant` 값:

- `primary`
- `default`
- `dashed`
- `text`
- `link`
- `filled`

지원하는 `customColor` 값:

- `mainBlue`: `#1890ff`
- `mainGreen`: `#52c41a`
- `subGray`: `#8c8c8c`
- `danger-red`: `#ff4d4f`

기본값:

- `variant = "primary"`
- `customColor = "mainBlue"`

### 12.3 스타일 동작

현재 `CustomButton`은 기본적으로 다음 스타일을 적용합니다.

- `border-radius: 4px`
- `display: inline-flex`
- `align-items: center`
- `justify-content: center`

색상은 `props.customColor` 값을 기준으로 `switch`문에서 선택됩니다. 선택된 색상은 `&&` selector 내부에서 다음 속성에 적용됩니다.

- `background-color`
- `border-color`
- `color: white`

즉, 현재 구현은 `primary`, `default`, `dashed`, `text`, `link`를 타입별로 다르게 스타일링하지 않고, `CustomButton`에 동일한 배경색과 흰색 글자를 강하게 적용하는 구조입니다. 마우스 hover 시에는 `filter: brightness(1.1)`과 `border-color: transparent`가 적용됩니다.

### 12.4 좋은 점

- AntD Button을 직접 반복 사용하지 않고 공용 컴포넌트로 감싸려는 구조는 좋습니다.
- 프로젝트에서 허용할 색상 이름을 타입으로 제한해 오타를 줄일 수 있습니다.
- AntD `ButtonProps`를 재사용하므로 `disabled`, `loading`, `htmlType`, `icon`, 이벤트 핸들러 같은 기본 기능을 계속 사용할 수 있습니다.
- `customColor` prop 이름이 camelCase로 정리되어 React prop 관례에 더 가까워졌습니다.
- 실제 CSS 속성인 `background-color`, `border-color`, `color`에 색상 값을 적용하고 있어 색상 반영 자체는 이전보다 명확해졌습니다.

### 12.5 주의할 점

1. `filled`를 AntD `type`으로 넘기는 구조가 위험합니다.
   - 코드에서는 `variant` 값에 `filled`를 허용합니다.
   - 하지만 `Button` 함수는 `variant`를 `type: variant`로 넘깁니다.
   - AntD Button의 `type`은 일반적으로 `primary`, `default`, `dashed`, `link`, `text` 계열이고, `filled`는 `variant` 쪽 개념입니다.
   - 따라서 `filled`를 사용하려면 `type`이 아니라 AntD의 `variant` prop으로 매핑하는 구조가 필요합니다.

2. 주석과 실제 구현이 다릅니다.
   - 코드 주석에는 `$` 기법으로 HTML 태그에 `CustomColor`가 전달되는 것을 막는다고 적혀 있습니다.
   - 하지만 실제 styled prop은 `$customColor`가 아니라 `customColor`입니다.
   - 현재 API도 `customColor`이므로, 주석을 수정하거나 실제 구현을 `$customColor` 방식으로 바꿔야 합니다.

3. 사용처와 prop 이름이 맞지 않을 수 있습니다.
   - 현재 타입체크 결과 `app/page.tsx`에서 `$customColor`를 넘기고 있어 오류가 발생했습니다.
   - 현재 `button.ts`가 받는 prop 이름은 `$customColor`가 아니라 `customColor`입니다.
   - 사용처와 컴포넌트 API 중 하나로 통일해야 합니다.

4. 스타일 전용 prop이 DOM 또는 AntD 내부로 전달될 수 있습니다.
   - styled-components에서 `$customColor`를 쓰면 DOM 전달을 막는 transient prop으로 동작합니다.
   - 현재 `customColor`는 styled-components에서 AntD Button 쪽으로 전달될 수 있으므로, 최종 DOM에 불필요한 속성이 내려가는지 확인이 필요합니다.

5. `children`이 필수입니다.
   - 아이콘만 있는 버튼이나 로딩 상태만 표시하는 버튼을 고려하면 `children?: React.ReactNode`가 더 유연합니다.

6. 제네릭 사용 이점이 크지 않습니다.
   - `Button<T extends CustomButtonProps>`는 현재 코드에서 특별한 타입 확장 효과가 크지 않습니다.
   - `Button(props: CustomButtonProps)`처럼 단순하게 작성해도 충분해 보입니다.

7. `.ts` 파일에서 React 컴포넌트를 만들기 위해 `React.createElement`를 사용하고 있습니다.
   - 동작은 가능하지만, 컴포넌트 파일은 `.tsx`로 바꾸고 JSX를 사용하는 편이 유지보수에 더 익숙합니다.

8. `!important` 사용이 많습니다.
   - AntD 스타일을 덮기 위해 사용한 것으로 보이지만, 장기적으로는 테마 토큰, ConfigProvider, 더 명확한 selector 우선순위로 조정하는 편이 좋습니다.

9. 색상 선택 로직이 중복되어 있습니다.
   - `background-color`와 `border-color`에서 같은 `switch`문이 반복됩니다.
   - 색상 매핑 객체나 헬퍼 함수로 분리하면 유지보수가 쉬워집니다.

### 12.6 개선 방향

우선순위가 높은 개선은 다음과 같습니다.

1. prop 이름과 주석 일치
   - 외부 API를 `customColor`로 유지할지, styled-components 내부 prop을 `$customColor`로 바꿀지 정합니다.
   - 주석도 실제 구현에 맞게 수정합니다.

2. DOM 전달 방지 구조 적용
   - styled-components 내부 스타일 전용 prop은 `$customColor`를 사용합니다.
   - 외부에서 받은 `customColor`를 내부 `CustomButton`에는 `$customColor`로 넘기는 구조가 안전합니다.

3. `type`과 `variant` 매핑 정리
   - `primary`, `default`, `dashed`, `text`, `link`는 AntD `type`으로 넘길 수 있습니다.
   - `filled`는 AntD `variant`로 넘기거나, 프로젝트 전용 variant 체계를 별도로 설계해야 합니다.

4. 지원 variant별 스타일 완성
   - 모든 variant에 동일한 배경색을 입힐지, `text/link`는 글자색만 바꿀지 디자인 규칙을 명확히 해야 합니다.

5. 컴포넌트 문법 단순화
   - 파일을 `button.tsx`로 변경하고 JSX로 작성합니다.
   - 불필요한 제네릭을 제거합니다.

6. 색상 매핑 중복 제거
   - `getButtonColor(customColor)` 또는 `BUTTON_COLOR_MAP` 형태로 색상 선택 로직을 분리하는 것이 좋습니다.

7. AntD 테마 방식 검토
   - 버튼 색상이 프로젝트 전반의 디자인 시스템이라면 개별 styled override보다 AntD `ConfigProvider` theme token으로 관리하는 방법도 고려할 수 있습니다.

### 12.7 현재 영향도

현재 코드 기준으로 `customColor`를 넘기는 경우 버튼 배경색과 테두리색은 적용될 가능성이 높습니다. 다만 `filled`를 `type`으로 넘기는 설계, `$customColor` 관련 주석과 실제 구현의 불일치, 사용처에서 `$customColor`를 넘기는 문제 때문에 타입 안정성이 흔들리고 있습니다.

검증 결과:

- `yarn tsc --noEmit` 실행 시 현재 `app/page.tsx`에서 `$customColor` prop이 존재하지 않는다는 타입 오류가 발생했습니다.
- 현재 `button.ts`의 공식 prop은 `customColor`입니다.

결론적으로 이 파일은 “AntD Button을 프로젝트 공용 버튼으로 감싸는 초기 구현”이며, 실제 재사용 전에 `customColor`와 `$customColor` 중 어떤 API를 쓸지, `filled`를 어떻게 처리할지 먼저 정리하는 것이 중요합니다.

## 13. 한 줄 결론

이 프로젝트는 PCF 대시보드의 프론트엔드 화면 구조가 잡힌 초기 구현본이며, 현재는 정적 목업 UI 단계입니다. 다음 개발의 핵심은 데이터 모델, API 연동, 필터 상태 관리, 업로드/다운로드 실제 동작을 연결해 대시보드를 “보이는 화면”에서 “사용 가능한 업무 도구”로 전환하는 것입니다.
