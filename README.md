# 수급경보

첨부된 supply_alert_app_v3.jsx의 목록 → 상세 탭 → 리포트 흐름을 Next.js App Router로 재구성한 웹앱입니다.

## 실행

Node.js 22 LTS 이상을 설치한 후 프로젝트 폴더에서 실행합니다.

```bash
npm ci
npm run dev
```

http://localhost:3000 에서 확인합니다.

## Vercel 배포

1. 이 폴더의 파일을 GitHub 저장소에 올립니다. `.gitignore`도 포함하고 `node_modules`, `.next`는 제외합니다.
2. Vercel에서 Add New → Project → 해당 저장소를 선택합니다.
3. Framework Preset은 Next.js, Root Directory는 이 package.json이 있는 폴더로 지정합니다.
4. 기본 Build Command `npm run build`를 사용하고 Deploy를 누릅니다. 환경변수는 필요하지 않습니다.

로컬 배포 빌드 확인: `npm run build` 후 `npm start`.

## 구성

- app/page.jsx: 종목 목록, 필터, 상세 4개 탭, 리포트 모달
- app/data.js: 원본을 바탕으로 한 결정적 예시 데이터와 규칙 기반 분석
- app/globals.css: 반응형 디자인과 카카오 작은글씨 적용
- public/fonts: 카카오 공식 TTF Regular/Bold 및 OFL 라이선스

## 데이터의 범위

실제 시세와 API는 연결하지 않았습니다. 차트의 D-19~D-0는 실제 날짜가 아닌 예시 시점입니다. 원본 데이터는 순매수 총합의 시장 수급 균형을 보장하지 않는 시연 데이터입니다.
Z-score는 최초 17개 시점을 기준으로 마지막 시점의 기관 유형별 순매수를 평가합니다. 외국인과 개인은 미평가로 표시합니다. 점수는 원본 규칙 기반이며 확률이 아닙니다. 현재 규칙은 정상·주의·위험 세 등급입니다. 향후 실제 모델을 연결할 때 경고 등급과 검증된 임계값을 추가하세요.
XGBoost, EvolveGCN, LLM, DART, 사용자 계정, 실시간 시세는 아직 구현하지 않았습니다.

원본 JSX의 핵심 분석 로직을 app/data.js로 분리했습니다. 실제 데이터 연결 시 동일한 데이터 형태를 유지하거나 이 모듈을 API 조회로 교체할 수 있습니다.

폰트 출처: https://github.com/kakao/kakao-font (수정하지 않은 공식 카카오 작은글씨, OFL 1.1; public/fonts/OFL.txt 참고)

## 실제 시장경보 이력

`/history` 화면은 업로드된 투자주의종목 (1).xls에서 추출한 실제 지정 기록 3,000건(1,029개 종목)을 사용합니다. `app/alerts.json`에 원본 종목코드, 유형, 공시일, 지정일, 번호를 보존했습니다. 지정일 범위는 2026-04-28~2026-09-11이며, 다운로드 한도로 일부 날짜/전체 이력이 불완전할 수 있습니다. 종목·유형·지정일 필터, 25건 단위 페이지, 종목별 전체 이력을 지원합니다. 해당 파일은 HTML 테이블 형식의 EUC-KR .xls 파일입니다.

수급 분석 화면의 예시 데이터와 시장경보 이력의 실제 기록은 별도로 표시합니다. 과거 이력으로 현재 경보 상태나 AI 점수를 추정하지 않습니다. 현재 구현은 파일 스냅샷이며 API/DB/자동 수집은 없습니다.
