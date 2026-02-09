# LIVE-rary Backend 빌드/배포

## 1. 사용 제품/버전/설정
### 1.1 JVM / 빌드 도구
- JVM: Java 17
- JRE 이미지: `eclipse-temurin:17-jre` (Docker 기준)
- Gradle: 9.2.1
- Spring Boot: 4.0.1

### 1.2 웹서버 / WAS
- WAS: Spring Boot (내장 서버 `Tomcat`)

### 1.3 인프라 구성 요소 (Docker)
- MySQL: 8.0 (`mysql:8.0`)
- Redis: 7-alpine (`redis:7-alpine`)
- Kurento Media Server: latest (`kurento/kurento-media-server:latest`)
- Coturn (TURN/STUN): latest (`coturn/coturn:latest`)

### 1.4 기타 설정
- 타임존: `Asia/Seoul`
- IDE 버전: IntelliJ 21.0.9

## 2. 빌드 환경 변수/프로퍼티
### 2.1 로컬/런타임 .env
파일: `.env.backend`
- DB 관련: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
- 공통: `TZ`
- KMS/TURN: `KMS_TURN_USER`, `KMS_TURN_PASSWORD`, `KMS_SERVER_NAME`, `KMS_SERVER_PORT`, `KMS_URL`
- JWT: `JWT_SECRET_KEY`, `JWT_ISSUER`
- 메일: `ADMIN_MAIL`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- 외부 API: `ALADIN_API_KEY`, `ALADIN_API_URL`

### 2.2 docker-compose 환경 변수 주입
파일: `docker-compose.yml`
- MySQL 서비스: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `TZ`
- KMS 서비스: `KMS_STUN_IP`, `KMS_STUN_PORT`, `KMS_TURN_URL`

### 2.3 GitLab CI/CD 변수
파일: `.gitlab-ci.yml`
- 일반 변수: `DOCKER_TLS_CERTDIR`, `DOCKER_DRIVER`, `IMAGE_NAME`, `IMAGE_TAG`, `TAR_NAME`, `EC2_PORT`
- 시크릿/런타임 변수(주입 필요): `SSH_PRIVATE_KEY_B64`, `EC2_HOST`, `EC2_USER`, `DEPLOY_DIR`

## 3. 빌드 절차
### 3.1 로컬 빌드
1) Gradle 빌드
- `./gradlew bootJar`

2) 도커 이미지 빌드
- `docker build -t spring-app:<tag> .`

### 3.2 GitLab CI 빌드 요약
- `./gradlew bootJar`
- `docker build -t $IMAGE_NAME:$IMAGE_TAG .`
- `docker save ... -o ../$TAR_NAME`
- EC2로 tar 전송 후 배포 단계에서 사용

## 4. 배포 시 특이사항
- 배포는 EC2에서 docker compose 실행으로 진행됨.
- CI 배포 단계에서 `docker load` 후 `spring-app:1.0`으로 tag 생성.
- EC2에 `compose.yml`이 존재해야 하며, 저장소에는 포함되어 있지 않음.
- 서비스 포트
  - App: 8080
  - MySQL: 3307:3306
  - Redis: 6379
  - Kurento KMS: 8888
  - Coturn: 3478/5349 및 49160-49200(udp)
- `.env`, `.coturn/turnserver.conf`, `.kms/WebRtcEndpoint.conf.ini`는 배포 환경에 존재해야 함.

## 5. 참고 파일
- `Dockerfile`, `.gitlab-ci.yml`


# LIVE-rary Frontend 빌드/배포

## 1. 사용 제품/버전/설정
### 1.1 Node / 빌드 도구
- Node: 20-alpine (`node:20-alpine`, Docker 기준)
- 패키지 매니저: npm (`package-lock.json`)
- 빌드 도구: Vite (React + TypeScript)

### 1.2 웹서버 / 정적 호스팅
- 런타임 이미지: `nginx:1.27-alpine` (Docker 기준)
- 정적 파일 경로: `/usr/share/nginx/html`
- SPA 라우팅: `try_files ... /index.html`

### 1.3 인프라 구성 요소 (Docker)
- Frontend 컨테이너: nginx 기반
- HTTPS 인증서: `/etc/letsencrypt` 볼륨 마운트

### 1.4 기타 설정
- 타임존: 명시 없음
- IDE 버전: 저장소에 명시 없음

## 2. 빌드 환경 변수/프로퍼티
### 2.1 로컬/런타임 .env
파일: `.env.frontend` 에 기술
- API: `VITE_API_URL`, `VITE_API_TARGET_URL`
- 소켓: `VITE_SOCKET_URL`
- STUN/TURN: `VITE_STUN_SERVER`, `VITE_TURN_SERVER_UDP`, `VITE_TURN_SERVER_TCP`
- TURN 계정: `VITE_TURN_USERNAME`, `VITE_TURN_PASSWORD`

### 2.2 docker-compose 빌드 인자
파일: `compose.yml`
- Frontend 서비스: `VITE_API_URL`, `VITE_SOCKET_URL`

### 2.3 GitLab CI/CD 변수
- 프런트 저장소에 `.gitlab-ci.yml` 없음 (TBD)

## 3. 빌드 절차
### 3.1 로컬 빌드

1) 정적 빌드
- `npm run build`

2) 도커 이미지 빌드
- `docker build -t live-rary-fe:<tag> .`

### 3.2 원격
이 과정은 백엔드와 동일

## 4. 배포 시 특이사항
- Dockerfile은 멀티 스테이지로 빌드하며, 빌드 결과(`dist`)를 nginx 이미지에 복사한다.
- HTTPS는 `/etc/letsencrypt` 인증서가 필요하며, compose에서 읽기 전용으로 마운트된다.
- nginx에서 `/api`, `/wss` 요청을 `spring:8080`으로 프록시한다(동일 네트워크 필요).
- SPA 라우팅을 위해 `/index.html`로 폴백된다.
- 서비스 포트
  - Frontend: 80/443

## 5. 참고 파일
- `Dockerfile`, `nginx/default.conf`
