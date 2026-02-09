# LIVE-rary Backend 외부 서비스 연동 문서

## 1. 외부/서드파티 API
### 1.1 알라딘 Open API
- 목적: 도서 검색/상세 정보 조회
- 호출 방식: HTTP GET (RestTemplate)
- 주요 엔드포인트: `${ALADIN_API_URL}`
- 인증 키: `ALADIN_API_KEY`
- 설정 위치:
  - `.env.backend` (키/URL)

### 1.2 Gmail API (Google API)
- 목적: 회원 인증/알림 메일 발송
- 호출 방식: Google API Client + OAuth2
- 권한 범위: `GmailScopes.GMAIL_SEND`
- 인증 키: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- 발신자 주소: `ADMIN_MAIL`
- 토큰 저장 위치: `tokens/` (런타임 생성)
- 설정 위치:
  - `.env.backend` (클라이언트/메일)

## 2. 외부 연동 인프라(자체 호스팅)
### 2.1 Kurento Media Server (KMS)
- 목적: WebRTC 미디어 처리
- 접속 URL: `KMS_URL` (예: `ws://localhost:8888/kurento`)
- 설정 위치:
  - `.env` 또는 `.env.backend` (`KMS_URL`)
  - `src/main/resources/application-test.yml` (`kms.url`)
- 관련 코드: `src/main/java/com/liverary/backend/config/WebRtcConfig.java`
- 컨테이너: `kurento/kurento-media-server:latest`

### 2.2 Coturn (TURN/STUN)
- 목적: NAT 환경 중계
- 설정 파일: `.coturn/turnserver.conf`
- 환경 변수: `KMS_TURN_USER`, `KMS_TURN_PASSWORD`, `KMS_SERVER_NAME`, `KMS_SERVER_PORT`
- 컨테이너: `coturn/coturn:latest`

## 3. 외부 서비스 관련 설정 파일 목록
- `.env.backend`
- `.coturn/turnserver.conf`

## 4. 체크리스트
- 알라딘 API 키/URL 유효 여부 확인
- Gmail API OAuth 클라이언트 ID/시크릿 및 발신 계정 확인
- `tokens/` 디렉토리 권한/존재 여부 확인
- AI 서버 주소(`ai.server.url`) 주입 여부 확인
- KMS/Coturn 컨테이너 기동 및 포트 개방 확인
