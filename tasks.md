# Context Capture 개발 작업 목록

## 1. 프로젝트 초기 설정

### 1.1 기본 구조 생성
- [x] package.json 생성 (TypeScript, Chrome extension 빌드 도구)
- [x] tsconfig.json 설정
- [x] webpack/rollup 빌드 설정
- [x] src/ 디렉토리 구조 생성
- [x] .gitignore 설정 (node_modules, dist, API keys)

### 1.2 Chrome Extension 설정
- [x] manifest.json 생성 (Manifest V3)
  - [x] permissions 설정 (activeTab, scripting, storage)
  - [x] content_scripts 등록
  - [x] background service worker 설정
  - [x] web_accessible_resources 설정

## 2. 핵심 기능 개발

### 2.1 화면 영역 선택 (Content Script)
- [x] 선택 오버레이 UI 구현 (`src/content-script/selector.ts`)
  - [x] 마우스 드래그로 영역 선택
  - [x] 선택 영역 시각적 표시
  - [x] 선택 완료 후 캡처 버튼 표시
- [x] 화면 캡처 로직 (`src/content-script/capture.ts`)
  - [x] Chrome tabs.captureVisibleTab API 사용
  - [x] 선택 영역 좌표 계산
  - [x] 이미지 크롭 처리

### 2.2 OCR 텍스트 추출 (Background Script)
- [x] OCR 서비스 통합 (`src/background/ocr.ts`)
  - [x] OCR.Space API 연동 (1차 옵션)
  - [x] Tesseract.js 연동 (2차 옵션)
  - [x] API 키 관리 및 저장
  - [x] 오류 처리 및 재시도 로직

### 2.3 LLM 요약 기능 (Background Script)
- [x] LLM 서비스 통합 (`src/background/llm.ts`)
  - [x] OpenAI GPT API 연동
  - [x] Anthropic Claude API 연동 (선택사항)
  - [x] 3줄 요약 프롬프트 최적화
  - [x] 토큰 제한 및 텍스트 분할 처리

### 2.4 결과 표시 UI (Content Script)
- [x] 요약 결과 팝업 (`src/content-script/ui.ts`)
  - [x] macOS 스타일 카드 디자인
  - [x] 둥근 모서리, 그림자 효과
  - [x] 3줄 요약 텍스트 표시
  - [x] 복사 버튼 구현
- [x] 클립보드 복사 기능
- [ ] Notion 연동 (선택사항)

## 3. 설정 및 관리

### 3.1 Options 페이지
- [x] 설정 페이지 UI (`src/options/`)
  - [x] options.html 레이아웃
  - [x] API 키 입력 폼
  - [x] OCR/LLM 서비스 선택
  - [x] 테스트 기능 버튼
- [x] 설정 저장/로드 (`src/background/storage.ts`)
  - [x] Chrome storage.sync 사용
  - [x] API 키 암호화 저장
  - [x] 기본값 설정

### 3.2 Extension Popup
- [x] 빠른 접근 팝업 (`src/popup/`)
  - [x] 확장 프로그램 상태 표시
  - [x] 설정 바로가기
  - [ ] 사용 통계 (선택사항)

## 4. 예외 처리 및 에러 관리

### 4.1 사용자 에러 처리
- [x] 선택 영역 없음 → 안내 메시지
- [x] OCR 실패 → 재시도 옵션 제공
- [x] LLM API 실패 → 네트워크/API 키 확인 안내
- [x] 권한 부족 → 권한 요청 가이드

### 4.2 개발자 에러 처리
- [x] API 응답 검증
- [x] 네트워크 타임아웃 설정
- [x] 로그 시스템 구현
- [ ] 에러 리포팅 (선택사항)

## 5. 테스트 및 검증

### 5.1 단위 테스트
- [x] OCR 서비스 테스트
- [x] LLM 서비스 테스트
- [ ] 유틸리티 함수 테스트
- [x] 설정 저장/로드 테스트

### 5.2 통합 테스트
- [ ] 전체 워크플로우 테스트
- [ ] 다양한 웹사이트에서 테스트
- [ ] 다양한 텍스트 타입 테스트
- [ ] API 장애 시나리오 테스트

### 5.3 사용성 테스트
- [ ] 선택 영역 UI/UX 검증
- [ ] 결과 팝업 위치 최적화
- [ ] 로딩 상태 표시 개선
- [ ] 에러 메시지 명확성 검증

## 6. 최적화 및 배포

### 6.1 성능 최적화
- [x] 이미지 압축 최적화
- [x] API 호출 최적화
- [x] 메모리 사용량 최적화
- [x] 번들 사이즈 최적화

### 6.2 보안 강화
- [x] API 키 보안 검토
- [x] Content Security Policy 설정
- [x] 권한 최소화 검토
- [ ] 코드 난독화 (선택사항)

### 6.3 배포 준비
- [x] 확장 프로그램 아이콘 제작
- [x] 스토어 설명 작성
- [ ] 스크린샷 및 데모 준비
- [x] 개인정보 처리방침 작성

## 7. 고급 기능 (MVP 이후)

### 7.1 기능 확장
- [ ] 다국어 텍스트 지원
- [ ] 손글씨 인식 지원
- [ ] 요약 길이 조정 옵션
- [ ] 다양한 내보내기 형식

### 7.2 사용자 경험 개선
- [ ] 키보드 단축키 지원
- [ ] 히스토리 기능
- [ ] 즐겨찾기 기능
- [ ] 팀 공유 기능

## 개발 우선순위

**Phase 1 (MVP 핵심)**
1. 화면 영역 선택 (2.1)
2. OCR 텍스트 추출 (2.2)
3. LLM 요약 기능 (2.3)
4. 결과 표시 UI (2.4)

**Phase 2 (안정성)**
1. 예외 처리 (4.1, 4.2)
2. 설정 관리 (3.1)
3. 기본 테스트 (5.1, 5.2)

**Phase 3 (배포 준비)**
1. 성능 최적화 (6.1)
2. 보안 강화 (6.2)
3. 배포 준비 (6.3)

## 예상 개발 시간

- **Phase 1**: 2-3주
- **Phase 2**: 1-2주  
- **Phase 3**: 1주
- **총 예상 시간**: 4-6주