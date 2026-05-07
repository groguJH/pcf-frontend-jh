# PCF Carbon Dashboard

제품 탄소발자국(PCF) 활동 데이터를 업로드하고, Scope별 배출량을 조회/관리하는 Next.js 기반 대시보드입니다.

## 개발환경 구성

저장소를 pull 받은 뒤 의존성을 설치하고 PostgreSQL 컨테이너를 실행합니다.

```bash
yarn install
docker compose up -d
```

그 다음 아래 명령어 하나로 로컬 개발환경 구성을 마무리합니다.

```bash
yarn setup:dev
```

`yarn setup:dev`는 다음 작업을 순서대로 실행합니다.

- Prisma client 생성
- PostgreSQL 접속 대기
- Prisma schema를 DB에 반영
- 배출원 카테고리와 배출계수 초기 데이터 등록
- Next.js 앱 빌드

## 실행

개발 서버 실행:

```bash
yarn dev
```

프로덕션 빌드 실행:

```bash
yarn start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속하면 화면을 확인할 수 있습니다.

## DB 초기 데이터

초기 설정 명령은 활동 내역 데이터를 넣지 않습니다. 활동 내역은 관리자 화면의 엑셀 업로드 기능으로 등록합니다.

초기 설정에 포함되는 데이터:

- 배출원 카테고리
- 배출계수

초기 데이터만 다시 등록해야 하는 경우:

```bash
yarn db:seed:carbon
```

## 주요 명령어

```bash
yarn lint
yarn tsc --noEmit
yarn build
```

## 환경 변수

DB 접속 정보는 `.env`에서 관리합니다. Docker Compose와 애플리케이션이 같은 값을 사용합니다.

필요한 주요 값:

```env
DB_USER="myuser"
DB_PASSWORD="mypassword"
DB_NAME="pcf_db"
DB_PORT="5432"
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/pcf_db?schema=public"
```
