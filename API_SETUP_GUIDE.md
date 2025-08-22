# ContextCapture API 키 설정 가이드

## 🔑 API 키 설정 방법

### 1. 확장 프로그램 설정 페이지 열기
1. Chrome 브라우저에서 확장 프로그램 아이콘 클릭
2. ContextCapture 확장 프로그램에서 "Settings" 버튼 클릭
3. 또는 `chrome://extensions/`에서 ContextCapture의 "세부정보" → "확장 프로그램 옵션"

### 2. OCR 서비스 설정

#### Google Vision API (권장)
1. **API 키 생성**:
   - [Google Cloud Console](https://console.cloud.google.com/) 접속
   - 프로젝트 생성 또는 선택
   - "API 및 서비스" → "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키"
   - Vision API 활성화: "API 및 서비스" → "라이브러리" → "Cloud Vision API" 검색 후 활성화

2. **설정 페이지에서**:
   - OCR 서비스: "Google Vision API" 선택
   - Google Vision API 키 입력란에 생성한 API 키 입력

#### OCR.Space API (대안)
1. **API 키 생성**:
   - [OCR.Space](https://ocr.space/ocrapi) 접속
   - 무료 계정 가입 (하루 500회 무료)
   - API 키 확인

2. **설정 페이지에서**:
   - OCR 서비스: "OCR.Space" 선택
   - OCR.Space API 키 입력란에 API 키 입력

### 3. LLM 서비스 설정

#### OpenAI GPT (권장)
1. **API 키 생성**:
   - [OpenAI Platform](https://platform.openai.com/api-keys) 접속
   - 계정 생성 또는 로그인
   - "Create new secret key" 클릭
   - API 키 복사 (한 번만 표시됨)

2. **설정 페이지에서**:
   - LLM 서비스: "OpenAI GPT" 선택
   - OpenAI API 키 입력란에 생성한 API 키 입력

#### Google Gemini (대안)
1. **API 키 생성**:
   - [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
   - Google 계정으로 로그인
   - "Create API Key" 클릭
   - API 키 복사

2. **설정 페이지에서**:
   - LLM 서비스: "Google Gemini" 선택
   - Google Gemini API 키 입력란에 생성한 API 키 입력

#### Anthropic Claude (대안)
1. **API 키 생성**:
   - [Anthropic Console](https://console.anthropic.com/) 접속
   - 계정 생성 또는 로그인
   - "Create Key" 클릭
   - API 키 복사

2. **설정 페이지에서**:
   - LLM 서비스: "Anthropic Claude" 선택
   - Anthropic API 키 입력란에 생성한 API 키 입력

### 4. 설정 저장 및 테스트

1. **설정 저장**: "Save Settings" 버튼 클릭
2. **API 테스트**: 
   - "Test OCR API" 버튼으로 OCR 서비스 테스트
   - "Test LLM API" 버튼으로 LLM 서비스 테스트
3. **성공 메시지 확인**: "API test successful" 메시지 표시

### 5. 문제 해결

#### "API key not configured" 오류
1. **확장 프로그램 재로드**:
   - `chrome://extensions/` 접속
   - ContextCapture의 새로고침 버튼 클릭

2. **설정 재확인**:
   - 설정 페이지에서 API 키가 올바르게 입력되었는지 확인
   - 올바른 서비스가 선택되었는지 확인

3. **브라우저 콘솔 확인**:
   - F12 → Console 탭에서 오류 메시지 확인
   - "Background service initialized" 메시지 확인

#### API 키 유효성 검사
- **Google Vision API**: 이미지 파일로 테스트
- **OCR.Space API**: 무료 계정의 일일 한도 확인 (500회)
- **OpenAI API**: 계정 크레딧 확인
- **Gemini API**: 무료 계정의 월간 한도 확인

### 6. 보안 주의사항

⚠️ **중요**: API 키는 민감한 정보입니다.
- API 키를 공개적으로 공유하지 마세요
- GitHub 등에 코드와 함께 업로드하지 마세요
- 정기적으로 API 키를 재생성하세요
- 사용하지 않는 API 키는 삭제하세요

### 7. 비용 정보

#### 무료 티어
- **Google Vision API**: 월 1,000회 무료
- **OCR.Space API**: 일 500회 무료
- **OpenAI API**: 월 $5 크레딧 무료
- **Google Gemini API**: 월 15회 무료 (Pro 모델)
- **Anthropic Claude**: 월 $5 크레딧 무료

#### 유료 요금
- 각 서비스의 공식 가격표 참조
- 사용량에 따라 과금

---

## 🚀 사용 시작

API 키 설정이 완료되면:
1. 웹 페이지에서 텍스트가 포함된 영역 선택
2. "Capture" 버튼 클릭
3. OCR로 텍스트 추출 및 AI 요약 확인
4. "Copy" 버튼으로 결과 복사
