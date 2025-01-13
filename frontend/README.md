# 웹 디자인 Frontend

## 소개
웹 디자인 프로젝트의 Frontend 코드

## 기술스택 및 라이브러리

| Project | Version | Description |
| ------- | ------- | ----------- |
| Vue.js | 3.5.13 | JavaScript Framework |
| Pinia | 2.3.0 | State Management Library |
| Vue-router | 4.5.0 | Vue Router |
| Vite | 6.0.5 | Build Tool |
| Sass | 1.71.0 | CSS Preprocessor |

## 개발 환경 구성

1. 프로젝트 다운로드
    ```bash
    git clone <repo URL> <folder-name>
    ```

2. frontend 폴더로 이동
    ```bash
    cd frontend
    ```

3. 패키지 설치
    ```bash
    npm install
    ```

4. 프로젝트 실행
    ```bash
    npm run dev
    ```

## 디렉토리 구조

```
.
└─src
    ├─api         /* API 관련 파일 */
    ├─assets      /* image, css, js 등의 리소스 */
    ├─components  /* 컴포넌트 단위의 Vue 파일 */
    ├─router      /* Vue Router 설정 */
    ├─stores      /* Pinia 스토어 */
    └─views       /* 페이지 단위의 Vue 파일 */
```

## 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션용 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview

# 린트 실행 및 수정
npm run lint

# 코드 포맷팅
npm run format
```

## 추가 설정 파일

- `vite.config.js`: Vite 설정
- `eslint.config.js`: ESLint 설정
- `jsconfig.json`: JavaScript 설정