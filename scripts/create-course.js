// 골프장 데이터 생성 스크립트
// 사용법: node scripts/create-course.js

require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDocs, collection, query, orderBy, limit, serverTimestamp } = require('firebase/firestore');
const readline = require('readline');

// Firebase 설정
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// readline 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 사용자 입력을 받는 함수
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// 기존 국가 데이터를 가져오는 함수
async function getCountries() {
    try {
        const countriesRef = collection(db, 'countries');
        const q = query(countriesRef, orderBy('name'));
        const snapshot = await getDocs(q);

        const countries = [];
        snapshot.forEach((doc) => {
            countries.push({ id: doc.id, ...doc.data() });
        });

        return countries;
    } catch (error) {
        console.error('❌ 국가 데이터 조회 실패:', error);
        return [];
    }
}

// 특정 국가의 provinces에서 마지막 코드를 가져오는 함수
async function getLastProvinceCodeByCountry(countryCode) {
    try {
        const provincesRef = collection(db, 'provinces');
        const q = query(provincesRef, orderBy('code', 'desc'));
        const snapshot = await getDocs(q);

        let lastCode = '000';

        // 해당 국가의 provinces만 필터링하여 마지막 코드 찾기
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.countryCode === countryCode) {
                const provinceCode = data.code;
                // 마지막 3자리 숫자 추출
                const match = provinceCode.match(/(\d{3})$/);
                if (match) {
                    lastCode = match[1];
                }
                break; // 첫 번째 매칭되는 것이 가장 큰 코드
            }
        }

        return lastCode;
    } catch (error) {
        console.error('❌ provinces 데이터 조회 실패:', error);
        return '000';
    }
}

// provinces 등록 함수
async function createProvince() {
    try {
        console.log('\n🌍 Provinces 등록을 시작합니다...\n');

        // 기존 국가 목록 가져오기
        const countries = await getCountries();

        if (countries.length === 0) {
            console.log('❌ 등록된 국가가 없습니다. 먼저 국가를 등록해주세요.');
            return;
        }

        // 국가 목록 표시
        console.log('📋 등록된 국가 목록:');
        countries.forEach((country, index) => {
            console.log(`${index + 1}. ${country.name} (${country.code})`);
        });

        // 국가 선택
        const countryChoice = await askQuestion('\n국가를 선택하세요 (번호 입력): ');
        const countryIndex = parseInt(countryChoice) - 1;

        if (countryIndex < 0 || countryIndex >= countries.length) {
            console.log('❌ 잘못된 선택입니다.');
            return;
        }

        const selectedCountry = countries[countryIndex];
        console.log(`✅ 선택된 국가: ${selectedCountry.name} (${selectedCountry.code})\n`);

        // 지방명 입력
        const provinceName = await askQuestion('지방명을 입력하세요: ');

        if (!provinceName) {
            console.log('❌ 지방명을 입력해주세요.');
            return;
        }

        // 기존 provinces에서 마지막 코드 가져오기
        const lastCode = await getLastProvinceCodeByCountry(selectedCountry.code);
        const nextCodeNumber = (parseInt(lastCode) + 1).toString().padStart(3, '0');
        const provinceCode = `${selectedCountry.code}_${nextCodeNumber}`;

        // provinces 데이터 생성
        const provinceData = {
            id: `province_${provinceCode}`,
            code: provinceCode,
            name: provinceName,
            countryCode: selectedCountry.code,
            countryName: selectedCountry.name,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Firestore에 저장
        await setDoc(doc(db, 'provinces', provinceData.id), provinceData);

        console.log(`✅ Province 등록 완료!`);
        console.log(`   - 코드: ${provinceCode}`);
        console.log(`   - 이름: ${provinceName}`);
        console.log(`   - 국가: ${selectedCountry.name}`);

        // 메인 메뉴로 돌아가기
        await showMainMenu();

    } catch (error) {
        console.error('❌ Province 등록 실패:', error);
        await showMainMenu();
    }
}

// 메인 메뉴 함수
async function showMainMenu() {
    console.log('\n🏌️ 골프장 관리 시스템');
    console.log('========================');
    console.log('1. 골프장 데이터 생성');
    console.log('2. Province 등록');
    console.log('3. 종료');
    console.log('========================');

    const choice = await askQuestion('선택하세요 (1-3): ');

    switch (choice) {
        case '1':
            await createCourses();
            break;
        case '2':
            await createProvince();
            break;
        case '3':
            console.log('👋 프로그램을 종료합니다.');
            rl.close();
            process.exit(0);
            break;
        default:
            console.log('❌ 잘못된 선택입니다. 1-3 중에서 선택해주세요.');
            await showMainMenu();
            break;
    }
}

async function createCourses() {
    try {
        console.log('\n🏌️ 골프장 데이터 생성 시작...');

        // 테스트 골프장들
        const courses = [
            {
                id: 'course_0001',
                name: '테스트 골프장',
                address: '경기도 성남시 분당구',
                countryCode: 'KR',
                provinceCode: 'KR_41', // 경기도
                cityCode: 'KR_41_4113', // 성남시
                phone: '031-123-4567',
                description: '테스트용 골프장입니다.',
                images: [],
                adminIds: [], // 나중에 관리자 ID 추가
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            },
            {
                id: 'course_0002',
                name: '샘플 골프클럽',
                address: '서울시 강남구',
                countryCode: 'KR',
                provinceCode: 'KR_11', // 서울특별시
                cityCode: 'KR_11_1123', // 강남구
                phone: '02-123-4567',
                description: '샘플 골프클럽입니다.',
                images: [],
                adminIds: [],
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }
        ];

        // 각 골프장 데이터 저장
        for (const course of courses) {
            await setDoc(doc(db, 'courses', course.id), course);
            console.log(`✅ 골프장 생성 완료: ${course.name} (${course.id})`);
        }

        console.log('🎉 모든 골프장 데이터 생성 완료!');

        // 메인 메뉴로 돌아가기
        await showMainMenu();

    } catch (error) {
        console.error('❌ 골프장 데이터 생성 실패:', error);
        await showMainMenu();
    }
}

// 프로그램 시작
async function main() {
    try {
        await showMainMenu();
    } catch (error) {
        console.error('❌ 프로그램 실행 중 오류 발생:', error);
        rl.close();
        process.exit(1);
    }
}

// 스크립트 실행
main();
