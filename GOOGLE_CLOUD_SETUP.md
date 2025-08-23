# Google Cloud API 설정 가이드

## 🔧 Google Vision API 및 Gemini API 설정

### 1. Google Cloud Console 접속
- [Google Cloud Console](https://console.cloud.google.com/) 접속
- Google 계정으로 로그인

### 2. 프로젝트 생성 또는 선택
- 새 프로젝트 생성 또는 기존 프로젝트 선택
- 프로젝트 ID: `349640186262` (오류 메시지에서 확인됨)

### 3. 결제 계정 설정 (필수)
⚠️ **중요**: Google Vision API와 Gemini API는 결제 계정이 필요합니다.

#### 결제 계정 활성화:
1. [Google Cloud Billing](https://console.cloud.google.com/billing) 접속
2. "결제 계정 연결" 또는 "결제 사용 설정" 클릭
3. 결제 방법 추가 (신용카드, 직불카드 등)
4. 프로젝트에 결제 계정 연결

#### 무료 티어 정보:
- **Google Vision API**: 월 1,000회 무료
- **Google Gemini API**: 월 15회 무료 (Pro 모델)

### 4. API 활성화

#### Google Vision API 활성화:
1. [API 및 서비스](https://console.cloud.google.com/apis) 접속
2. "라이브러리" 탭 클릭
3. "Cloud Vision API" 검색
4. "사용 설정" 클릭

#### Google Gemini API 활성화:
1. [API 및 서비스](https://console.cloud.google.com/apis) 접속
2. "라이브러리" 탭 클릭
3. "Generative Language API" 검색
4. "사용 설정" 클릭

### 5. API 키 생성

#### 사용자 인증 정보 생성:
1. [사용자 인증 정보](https://console.cloud.google.com/apis/credentials) 접속
2. "사용자 인증 정보 만들기" → "API 키" 클릭
3. 생성된 API 키 복사

#### API 키 제한 설정 (권장):
1. 생성된 API 키 클릭
2. "애플리케이션 제한사항" 설정
3. "HTTP 리퍼러" 선택하고 도메인 제한
4. "API 제한사항" 설정
   - Google Vision API 선택
   - Generative Language API 선택

### 6. ContextCapture 확장 프로그램 설정

#### OCR 서비스 설정:
1. 확장 프로그램 아이콘 클릭 → "Settings"
2. OCR 서비스: "Google Vision API" 선택
3. Google Vision API 키 입력란에 생성한 API 키 입력

#### LLM 서비스 설정:
1. LLM 서비스: "Google Gemini" 선택
2. Google Gemini API 키 입력란에 생성한 API 키 입력
3. "Save Settings" 클릭

### 7. 테스트 및 확인

#### API 테스트:
1. "Test OCR API" 버튼 클릭
2. "Test LLM API" 버튼 클릭
3. 성공 메시지 확인

#### 브라우저 콘솔 확인:
- F12 → Console 탭
- `"Google Vision API: Starting API call"` 메시지 확인
- `"Gemini API: Starting API call"` 메시지 확인

### 8. 문제 해결

#### "BILLING_DISABLED" 오류:
- [결제 설정 페이지](https://console.developers.google.com/billing/enable?project=349640186262) 접속
- 결제 계정 활성화
- 몇 분 대기 후 재시도

#### "API_NOT_ENABLED" 오류:
- 해당 API가 활성화되지 않음
- API 및 서비스 라이브러리에서 API 활성화

#### "INVALID_API_KEY" 오류:
- API 키가 올바르지 않음
- 새 API 키 생성 및 설정

#### "QUOTA_EXCEEDED" 오류:
- 무료 티어 한도 초과
- 결제 계정에서 사용량 확인

### 9. 비용 관리

#### 사용량 모니터링:
- [결제](https://console.cloud.google.com/billing) 페이지에서 사용량 확인
- [API 및 서비스 대시보드](https://console.cloud.google.com/apis/dashboard)에서 API 사용량 확인

#### 예산 알림 설정:
1. 결제 계정 설정
2. "예산 및 알림" 설정
3. 월별 예산 설정 및 알림 구성

#### 무료 티어 최적화:
- 이미지 크기 최적화 (1024px 이하)
- 불필요한 API 호출 방지
- 캐싱 활용

---

## 🚀 대안 OCR/LLM 서비스

### 무료 OCR 서비스:
- **OCR.Space**: 일 500회 무료
- **Tesseract.js**: 로컬 처리 (무료)

### 무료 LLM 서비스:
- **OpenAI**: 월 $5 크레딧 무료
- **Anthropic**: 월 $5 크레딧 무료

### 설정 방법:
1. 확장 프로그램 설정에서 다른 서비스 선택
2. 해당 서비스의 API 키 설정
3. "Save Settings" 클릭

---

## 📞 지원

문제가 지속되면:
1. Google Cloud Console의 오류 메시지 확인
2. API 사용량 및 할당량 확인
3. 결제 계정 상태 확인
4. Google Cloud 지원팀 문의
