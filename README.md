# 5MGOLF - 골프 티타임 관리 시스템

Next.js와 Firebase를 사용한 골프 티타임 관리 및 예약 시스템입니다.

## 🏌️ 프로젝트 개요

이 프로젝트는 골프장 관리자와 사용자를 위한 티타임 관리 시스템입니다. 관리자는 티타임을 등록하고 관리할 수 있으며, 사용자는 등록된 티타임을 조회할 수 있습니다.

## ✨ 주요 기능

### 관리자 기능
- **사용자 관리**: 사용자 생성, 수정, 삭제
- **골프장 관리**: 골프장 정보 관리
- **티타임 관리**: 캘린더 기반 티타임 등록/수정/삭제
- **지역 관리**: 국가, 도/시, 지역 정보 관리
- **권한 관리**: 수퍼관리자, 골프장 관리자, 일반 사용자

### 사용자 기능
- **티타임 조회**: 등록된 티타임 목록 확인
- **골프장 정보**: 골프장 상세 정보 조회

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: CSS3, Font Awesome
- **Deployment**: Static Export

## 📁 프로젝트 구조

```
├── app/                          # Next.js App Router
│   ├── (admin)/                  # 관리자 페이지
│   │   └── admin/               # 관리자 대시보드
│   │       ├── (dashboard)/     # 대시보드 컴포넌트
│   │       ├── courses/         # 골프장 관리
│   │       ├── users/           # 사용자 관리
│   │       ├── tee-times/       # 티타임 관리
│   │       └── countries/       # 지역 관리
│   └── (user)/                  # 사용자 페이지
│       ├── list/               # 티타임 목록
│       └── detail/             # 골프장 상세
├── contexts/                    # React Context
├── lib/                        # Firebase 설정
├── types/                      # TypeScript 타입 정의
└── scripts/                    # 유틸리티 스크립트
```

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. Firebase 설정
1. Firebase 프로젝트 생성
2. Firestore Database 설정
3. Authentication 설정
4. `.env.local` 파일에 Firebase 환경 변수 설정:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드 및 배포
```bash
# 개발 서버 배포 (팀 내부 테스트용)
npm run deploy:dev

# 스테이징 서버 배포 (최종 테스트용)
npm run deploy:staging

# 프로덕션 서버 배포 (실서버)
npm run deploy:prod
```

## 🔧 스크립트

### 개발 스크립트
- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 빌드된 앱 실행

### 배포 스크립트
- `npm run deploy:dev`: 개발 서버 배포
- `npm run deploy:staging`: 스테이징 서버 배포
- `npm run deploy:prod`: 프로덕션 서버 배포

### 유틸리티 스크립트
- `npm run create-user`: 사용자 생성 스크립트
- `npm run create-course`: 골프장 생성 스크립트
- `npm run create-locations`: 지역 데이터 생성 스크립트

## 👥 사용자 역할

### 수퍼관리자 (super_admin)
- 모든 기능 접근 가능
- 모든 골프장 관리 가능
- 사용자 및 골프장 생성/수정/삭제

### 골프장 관리자 (course_admin)
- 할당된 골프장의 티타임만 관리 가능
- 사용자 조회 가능

### 일반 사용자 (user)
- 티타임 조회만 가능

## 🎨 주요 컴포넌트

### 캘린더 컴포넌트
- 월별 티타임 표시
- 지나간 날짜 제한
- 티타임 등록/수정/삭제

### 티타임 모달
- 티타임 등록/수정 폼
- 기존 티타임 목록 표시
- 지나간 날짜 제한

### 관리자 대시보드
- 사용자 관리
- 골프장 관리
- 티타임 관리
- 지역 관리

## 🔒 보안 기능

- Firebase Authentication 기반 인증
- 역할 기반 접근 제어
- 지나간 날짜 수정 제한
- 입력 데이터 검증

## 📱 반응형 디자인

- 모바일, 태블릿, 데스크톱 지원
- CSS Grid 및 Flexbox 활용
- 터치 친화적 인터페이스

## 🚧 향후 개선 사항

- [ ] 실시간 티타임 예약 시스템
- [ ] 결제 시스템 통합
- [ ] 이메일 알림 기능
- [ ] 다국어 지원
- [ ] PWA 지원
- [ ] 모바일 앱 개발

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 🤝 기여하기

버그 리포트나 기능 제안은 이슈를 통해 제출해 주세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 통해 연락해 주세요.