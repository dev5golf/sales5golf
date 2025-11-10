# 개발 프로젝트 분리 설정 가이드

이 가이드는 Firebase 개발 프로젝트를 분리하여 프로덕션 데이터를 보호하는 방법을 설명합니다.

## 📋 작업 순서

### 1단계: Firebase Console에서 개발 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `sales5golf-dev` 입력
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

#### 개발 프로젝트 설정

1. **Firestore Database 설정**
   - Firestore Database 생성
   - 테스트 모드로 시작 (개발용이므로)
   - 위치 선택 (프로덕션과 동일한 위치 권장)

2. **Authentication 설정**
   - Authentication 활성화
   - 이메일/비밀번호 로그인 활성화

3. **Storage 설정**
   - Storage 활성화
   - 테스트 모드로 시작

4. **웹 앱 추가**
   - 프로젝트 설정 → 일반 → 웹 앱 추가
   - 앱 닉네임 입력
   - Firebase SDK 설정 값 복사 (나중에 사용)

### 2단계: Service Account 키 다운로드

각 프로젝트별로 Service Account 키가 필요합니다.

#### 프로덕션 프로젝트
1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. `firebase-service-account-prod.json`으로 저장

#### 개발 프로젝트
1. 개발 프로젝트(`sales5golf-dev`) 선택
2. 프로젝트 설정 → 서비스 계정
3. "새 비공개 키 생성" 클릭
4. `firebase-service-account-dev.json`으로 저장

**⚠️ 중요**: 이 파일들은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 3단계: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 개발 프로젝트 설정을 입력하세요:

```env
# 개발 환경 Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sales5golf-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sales5golf-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sales5golf-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_dev_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_dev_measurement_id
```

### Vercel 환경 변수 설정

Vercel에서는 환경별로 다른 환경 변수를 설정할 수 있습니다:

1. **Vercel 대시보드** → 프로젝트 선택 → **Settings** → **Environment Variables**

2. **Development 환경** (개발 브랜치 배포용)
   - Environment: `Development` 선택
   - 다음 변수들을 개발 프로젝트 값으로 설정:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=dev_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sales5golf-dev.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=sales5golf-dev
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sales5golf-dev.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=dev_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=dev_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=dev_measurement_id
   ```

3. **Production 환경** (프로덕션 브랜치 배포용)
   - Environment: `Production` 선택
   - 다음 변수들을 프로덕션 프로젝트 값으로 설정:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=prod_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sales5golf.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=sales5golf
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sales5golf.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=prod_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=prod_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=prod_measurement_id
   ```

4. **Preview 환경** (PR 배포용, 선택사항)
   - Development와 동일하게 설정하거나 Production과 동일하게 설정 가능

**⚠️ 중요**: 
- `NEXT_PUBLIC_` 접두사가 붙은 변수는 빌드 타임에 주입되므로, 환경 변수 변경 후 **재배포**가 필요합니다.
- Vercel은 브랜치별로 자동으로 환경을 선택합니다:
  - `main` 브랜치 → Production 환경 변수 사용
  - `develop` 브랜치 → Development 환경 변수 사용
  - PR → Preview 환경 변수 사용

### 4단계: 의존성 설치

```powershell
npm install
```

`tsx` 패키지가 자동으로 설치됩니다 (TypeScript 스크립트 실행용).

### 5단계: 데이터 동기화 (선택사항)

프로덕션 데이터를 개발 프로젝트로 복사하려면:

#### Firestore 데이터 동기화
```powershell
# 특정 컬렉션만 동기화
npm run sync:firestore -- --from prod --to dev --collections courses,countries

# 전체 데이터 동기화
npm run sync:firestore -- --from prod --to dev --all

# 덮어쓰기 옵션
npm run sync:firestore -- --from prod --to dev --collections courses --overwrite
```

#### 사용자 동기화
```powershell
# 관리자 계정만 동기화
npm run sync:users -- --from prod --to dev --role super_admin,course_admin

# 특정 이메일 동기화
npm run sync:users -- --from prod --to dev --emails admin@example.com

# 전체 사용자 동기화 (신중하게!)
npm run sync:users -- --from prod --to dev --all
```

#### Storage 동기화
```powershell
# 특정 경로만 동기화
npm run sync:storage -- --from prod --to dev --path images

# 전체 Storage 동기화
npm run sync:storage -- --from prod --to dev --all
```

#### 전체 동기화
```powershell
npm run sync:all -- --from prod --to dev --collections courses,countries --role super_admin
```

## 🔧 환경별 프로젝트 선택

`lib/firebase.ts`가 자동으로 환경을 감지합니다:

- **로컬 개발** (`npm run dev`): `.env.local`의 설정 사용 (개발 프로젝트)
- **프로덕션 빌드**: `.env.production` 또는 Vercel 환경 변수 사용 (프로덕션 프로젝트)

환경 변수에 `-dev`가 포함되어 있으면 자동으로 개발 프로젝트를 사용합니다.

## 📝 사용 예시

### 개발 중
```powershell
# 로컬 개발 서버 실행 (자동으로 개발 프로젝트 연결)
npm run dev
```

### 프로덕션 배포 전 데이터 동기화
```powershell
# 번역 작업 전 골프장 데이터 복사
npm run sync:firestore -- --from prod --to dev --collections courses --include-subcollections

# 작업 완료 후 번역 데이터만 프로덕션으로 반영
npm run sync:firestore -- --from dev --to prod --collections courses --overwrite
```

## ⚠️ 주의사항

1. **Service Account 파일 보안**
   - 절대 Git에 커밋하지 마세요
   - `.gitignore`에 포함되어 있습니다

2. **프로덕션 → 개발 동기화는 안전**
   - 개발 프로젝트는 테스트용이므로 자유롭게 사용 가능

3. **개발 → 프로덕션 동기화는 신중하게**
   - `--overwrite` 옵션 사용 시 기존 데이터가 덮어씌워집니다
   - 중요한 데이터는 백업 후 진행하세요

4. **사용자 동기화**
   - 비밀번호는 임시 비밀번호로 생성됩니다
   - 사용자에게 새 비밀번호를 안내해야 합니다

## 🐛 문제 해결

### "프로젝트 초기화 실패" 오류
- Service Account 파일 경로 확인
- 파일 이름이 `firebase-service-account-{env}.json` 형식인지 확인

### "컬렉션을 찾을 수 없음" 오류
- 컬렉션 이름이 정확한지 확인
- 소스 프로젝트에 해당 컬렉션이 존재하는지 확인

### 환경 변수가 적용되지 않음
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- Next.js 서버 재시작 필요

## 📚 추가 리소스

- [Firebase Admin SDK 문서](https://firebase.google.com/docs/admin/setup)
- [Firestore 데이터 내보내기/가져오기](https://firebase.google.com/docs/firestore/manage-data/export-import)

