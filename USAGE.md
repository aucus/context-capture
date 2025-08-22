# ContextCapture 사용 가이드

## 설치 방법

### 개발자 모드로 설치
1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. 우측 상단의 "개발자 모드" 토글 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 버튼 클릭
4. `dist/` 폴더 선택

### Chrome Web Store에서 설치 (배포 후)
1. Chrome Web Store에서 "ContextCapture" 검색
2. "Chrome에 추가" 버튼 클릭

## 초기 설정

### 1. API 키 설정
1. 확장 프로그램 아이콘 클릭
2. "Settings" 버튼 클릭
3. API 키 입력:
   - **OCR.Space API Key**: [OCR.Space](https://ocr.space/ocrapi)에서 무료 키 발급 (일일 500회)
   - **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급
   - **Anthropic API Key**: [Anthropic Console](https://console.anthropic.com/)에서 발급
   - **Google Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급

### 2. 서비스 선택
- **OCR 서비스**: OCR.Space API 또는 Tesseract.js (로컬)
- **LLM 서비스**: OpenAI GPT, Anthropic Claude 또는 Google Gemini

### 3. 테스트
- 각 서비스의 "Test" 버튼을 클릭하여 API 키가 올바른지 확인

## 사용 방법

### 기본 사용법
1. **캡처 시작**: 확장 프로그램 아이콘 클릭 또는 팝업에서 "Capture Region" 버튼 클릭
2. **영역 선택**: 마우스로 드래그하여 텍스트가 포함된 영역 선택
3. **자동 처리**: 
   - 선택한 영역이 자동으로 캡처됨
   - OCR로 텍스트 추출
   - AI로 3줄 요약 생성
4. **결과 확인**: 요약 결과가 팝업으로 표시됨
5. **복사**: "Copy to Clipboard" 버튼으로 요약 복사

### 고급 기능
- **ESC 키**: 선택 모드 취소
- **최소 선택 크기**: 50x50 픽셀 이상
- **자동 숨김**: 결과 팝업은 30초 후 자동으로 사라짐

## 문제 해결

### 일반적인 문제들

#### 1. "Text recognition failed" 오류
- **원인**: OCR API 키가 잘못되었거나 네트워크 문제
- **해결**: 
  - API 키를 다시 확인
  - Tesseract.js (로컬) 옵션으로 변경
  - 네트워크 연결 확인

#### 2. "Summary generation failed" 오류
- **원인**: LLM API 키가 잘못되었거나 네트워크 문제
- **해결**:
  - API 키를 다시 확인
  - 다른 LLM 서비스로 변경
  - 네트워크 연결 확인

#### 3. 영역 선택이 안됨
- **원인**: 페이지에서 스크립트가 차단됨
- **해결**:
  - 페이지 새로고침
  - 다른 웹사이트에서 시도
  - 확장 프로그램 재로드

#### 4. 팝업이 표시되지 않음
- **원인**: 페이지 레이아웃 문제
- **해결**:
  - 다른 위치에서 다시 시도
  - 브라우저 창 크기 조정

### API 키 관리
- API 키는 Chrome 동기화를 통해 다른 기기와 공유됨
- "Clear All Settings" 버튼으로 모든 설정 초기화 가능
- API 키는 안전하게 암호화되어 저장됨

## 성능 최적화

### 이미지 최적화
- 자동으로 이미지 크기 조정 (최대 1024px)
- JPEG 압축으로 파일 크기 최소화
- OCR 정확도 향상을 위한 전처리

### API 사용량 관리
- OCR.Space: 일일 500회 무료 (유료 플랜으로 확장 가능)
- OpenAI: 사용량에 따른 과금
- Anthropic: 사용량에 따른 과금
- Google Gemini: 사용량에 따른 과금 (무료 할당량 포함)

## 지원 및 피드백

### GitHub Issues
- 버그 리포트: [GitHub Issues](https://github.com/aucus/context-capture/issues)
- 기능 요청: GitHub Issues에 "Feature Request" 라벨로 등록

### 개발자 정보
- **Repository**: https://github.com/aucus/context-capture
- **License**: MIT
- **Version**: 1.0.0

## 업데이트

### 자동 업데이트
- Chrome Web Store에서 설치한 경우 자동 업데이트
- 개발자 모드로 설치한 경우 수동 업데이트 필요

### 수동 업데이트
1. 최신 코드 다운로드
2. `npm install && npm run build`
3. Chrome 확장 프로그램 페이지에서 "새로고침" 버튼 클릭

## 보안 및 개인정보

### 데이터 처리
- 선택한 이미지만 처리됨
- 개인 데이터는 저장되지 않음
- API 키는 안전하게 암호화되어 저장

### 권한 설명
- **activeTab**: 현재 탭에만 접근
- **scripting**: 콘텐츠 스크립트 실행
- **storage**: 설정 저장
- **tabs**: 탭 정보 접근

## 기술 스펙

### 지원 브라우저
- Chrome 88+
- Edge 88+ (Chromium 기반)
- 기타 Chromium 기반 브라우저

### 시스템 요구사항
- 최소 4GB RAM
- 안정적인 인터넷 연결
- Chrome 확장 프로그램 지원
