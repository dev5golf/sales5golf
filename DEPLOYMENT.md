# 배포 가이드

## 🚀 배포 환경 구성

### 환경별 배포 전략
- **개발 (Dev)**: `develop` 브랜치 → Firebase 채널 `dev`
- **스테이징 (Staging)**: `main` 브랜치 PR → Firebase 채널 `staging`
- **프로덕션 (Prod)**: `main` 브랜치 푸시 → Firebase 프로덕션

## 📋 배포 명령어

### 로컬 배포
```bash
# 개발 환경 배포 (빠름)
npm run deploy:dev

# 스테이징 환경 배포
npm run deploy:staging

# 프로덕션 배포
npm run deploy:prod

# 프로덕션 채널 배포 (테스트용)
npm run deploy:prod:channel
```

### 빌드 명령어
```bash
# 개발용 빌드
npm run build:dev

# 프로덕션용 빌드 (최적화)
npm run build:prod

# 빌드 분석
npm run build:analyze

# 빌드 캐시 정리
npm run clean
```

## 🔧 GitHub Actions 설정

### 필요한 Secrets 설정
GitHub 저장소 Settings → Secrets and variables → Actions에서 다음 secrets를 설정하세요:

```
FIREBASE_SERVICE_ACCOUNT_DEV
FIREBASE_SERVICE_ACCOUNT_STAGING
FIREBASE_SERVICE_ACCOUNT_PROD
FIREBASE_PROJECT_ID_DEV
FIREBASE_PROJECT_ID_STAGING
FIREBASE_PROJECT_ID_PROD
```

### 자동 배포 트리거
- **개발**: `develop` 브랜치에 푸시 시 자동 배포
- **스테이징**: `main` 브랜치에 PR 생성 시 자동 배포
- **프로덕션**: `main` 브랜치에 푸시 시 자동 배포

### 수동 배포
GitHub Actions → Quick Deploy 워크플로우에서 환경을 선택하여 수동 배포 가능

## ⚡ 배포 최적화 팁

### 1. 빠른 개발 배포
```bash
# 개발 중 빠른 배포
npm run deploy:dev
```

### 2. 빌드 캐시 활용
```bash
# 빌드 전 캐시 정리 (필요시)
npm run clean
npm run build:dev
```

### 3. 증분 빌드
```bash
# 변경된 파일만 빌드
npm run build:dev -- --incremental
```

## 🔍 문제 해결

### 배포 실패 시
1. Firebase 프로젝트 설정 확인
2. Service Account 권한 확인
3. 빌드 로그 확인
4. 캐시 정리 후 재시도

### 빌드 오류 시
```bash
# 캐시 정리
npm run clean

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 빌드 재시도
npm run build:dev
```

## 📊 배포 상태 확인

### Firebase 콘솔
- [Firebase Console](https://console.firebase.google.com)에서 배포 상태 확인
- 채널별 배포 URL 확인

### GitHub Actions
- Actions 탭에서 배포 로그 확인
- 실패 시 상세 로그 분석

## 🎯 배포 체크리스트

### 배포 전
- [ ] 코드 리뷰 완료
- [ ] 테스트 통과
- [ ] 환경 변수 확인
- [ ] 빌드 성공 확인

### 배포 후
- [ ] 사이트 정상 동작 확인
- [ ] 주요 기능 테스트
- [ ] 성능 확인
- [ ] 에러 로그 모니터링

## 📞 지원

배포 관련 문제가 발생하면 다음을 확인하세요:
1. 이 가이드의 문제 해결 섹션
2. GitHub Actions 로그
3. Firebase 콘솔 에러 메시지
