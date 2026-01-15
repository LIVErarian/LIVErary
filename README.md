
# 📖 LIVErary (라이브러리)

> **"메타버스 독서 모임 플랫폼"**

## 👥 Team LIVErarian

* **김다희 (Leader)**: 프로젝트 초기 환경 구축, User & Auth 구현
* **양희령 (Backend Leader)**: WebRTC 기반 실시간 통신 및 미디어 서버 구축
* **안수연 (Frontend Leader)**: UI/UX 개발 총괄
* **김도희**: Book 구현 & 도서 정보 API 연동
* **박준아**: Room 기본 기능 & 전체 DB 설계
* **이수인**: Board & Review 구현

---

## 🎯 1차 개발 목표 (MVP)

**기간: 2026.01.15 ~ 2026.01.20**

* **Room**: 실시간 독서 모임 방 생성/참여 및 라이프사이클 관리
* **User**: JWT 기반 인증 시스템 및 사용자 취향 아카이브
* **Book/Board**: 외부 API 연동 도서 등록 및 룸 홍보 커뮤니티

---

## 🌿 Branching Strategy

팀의 모든 작업은 정해진 브랜치 규칙을 엄격히 준수합니다.

### 기본 브랜치 (Base Branches)

* **`master`**: 배포 가능한 상태의 완성된 코드
* **`front/default`**: 프론트엔드 통합 개발 브랜치
* **`back/default`**: 백엔드 통합 개발 브랜치

### 기능 브랜치 규칙 (Feature Branch)

* **형식**: `{part}/{domain}/{ticket_number}`
* **예시**:
* `back/user/S14P11A307-16`
* `back/room/S14P11A307-20`

---

## 💬 Commit Convention

모든 커밋은 추적이 가능하도록 지라(Jira) 티켓 번호를 포함합니다.

### 커밋 메시지 형식

* `type(scope): commit message (ticket_number)`
* **예시**: `feat(room): add room creation API (S14P11A307-20)`

### 사용 가능한 태그 목록

| 태그 | 설명 |
| --- | --- |
| **feat** | 새로운 기능을 추가한 경우 |
| **fix** | 에러를 수정한 경우 |
| **refactor** | 코드를 리팩토링한 경우 |
| **comment** | 주석을 추가하거나 변경한 경우 |
| **docs** | 문서를 수정한 경우 |
| **test** | 테스트 코드를 추가 / 변경 / 리팩토링한 경우 |
| **chore** | 기타 변경 사항 (설정 등) |

---

## 🤝 Merge & Review Process

LIVErary는 코드의 완성도를 위해 **강제적인 리뷰 프로세스**를 거칩니다.

1. **작업**: 로컬에서 작업 후 본인의 기능 브랜치에 `push`
2. **MR 생성**: 작업 완료 후 `back/default` (또는 `front/default`) 방향으로 **Merge Request** 생성
3. **리뷰어 지정**: 모든 PR에는 **최소 1명 이상의 리뷰어** 지정이 필수입니다.
* 각 태스크의 **서브 담당자**가 리뷰어를 맡습니다.


4. **리뷰 방식**: 리뷰어는 단순히 코드만 보는 것이 아니라, **직접 테스트 브랜치를 생성하여 로컬 또는 테스트 환경에서 실행 및 검증**해야 합니다.
5. **머지**: 최소 1개 이상의 승인(Approve)을 받아야 `default` 브랜치에 merge 할 수 있습니다.
6. **최종**: `default` 브랜치에서 검증이 끝난 코드는 최종적으로 `master`에 merge 됩니다.

