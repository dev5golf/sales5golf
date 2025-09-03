// 지역 데이터 생성 스크립트 (국가 > 시도 > 구/군)
// 사용법: node scripts/create-locations.js

require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 한국의 시도 데이터 (행정구역 코드 기준)
const provinces = [
    { code: '11', name: '서울특별시' },
    { code: '26', name: '부산광역시' },
    { code: '27', name: '대구광역시' },
    { code: '28', name: '인천광역시' },
    { code: '29', name: '광주광역시' },
    { code: '30', name: '대전광역시' },
    { code: '31', name: '울산광역시' },
    { code: '36', name: '세종특별자치시' },
    { code: '41', name: '경기도' },
    { code: '42', name: '강원특별자치도' },
    { code: '43', name: '충청북도' },
    { code: '44', name: '충청남도' },
    { code: '45', name: '전북특별자치도' },
    { code: '46', name: '전라남도' },
    { code: '47', name: '경상북도' },
    { code: '48', name: '경상남도' },
    { code: '50', name: '제주특별자치도' }
];

// 주요 구/군 데이터 (일부만 포함)
const cities = [
    // 서울특별시
    { provinceCode: '11', code: '1101', name: '종로구' },
    { provinceCode: '11', code: '1102', name: '중구' },
    { provinceCode: '11', code: '1103', name: '용산구' },
    { provinceCode: '11', code: '1104', name: '성동구' },
    { provinceCode: '11', code: '1105', name: '광진구' },
    { provinceCode: '11', code: '1106', name: '동대문구' },
    { provinceCode: '11', code: '1107', name: '중랑구' },
    { provinceCode: '11', code: '1108', name: '성북구' },
    { provinceCode: '11', code: '1109', name: '강북구' },
    { provinceCode: '11', code: '1110', name: '도봉구' },
    { provinceCode: '11', code: '1111', name: '노원구' },
    { provinceCode: '11', code: '1112', name: '은평구' },
    { provinceCode: '11', code: '1113', name: '서대문구' },
    { provinceCode: '11', code: '1114', name: '마포구' },
    { provinceCode: '11', code: '1115', name: '양천구' },
    { provinceCode: '11', code: '1116', name: '강서구' },
    { provinceCode: '11', code: '1117', name: '구로구' },
    { provinceCode: '11', code: '1118', name: '금천구' },
    { provinceCode: '11', code: '1119', name: '영등포구' },
    { provinceCode: '11', code: '1120', name: '동작구' },
    { provinceCode: '11', code: '1121', name: '관악구' },
    { provinceCode: '11', code: '1122', name: '서초구' },
    { provinceCode: '11', code: '1123', name: '강남구' },
    { provinceCode: '11', code: '1124', name: '송파구' },
    { provinceCode: '11', code: '1125', name: '강동구' },

    // 경기도 (주요 지역만)
    { provinceCode: '41', code: '4111', name: '수원시' },
    { provinceCode: '41', code: '4113', name: '성남시' },
    { provinceCode: '41', code: '4115', name: '의정부시' },
    { provinceCode: '41', code: '4117', name: '안양시' },
    { provinceCode: '41', code: '4119', name: '부천시' },
    { provinceCode: '41', code: '4121', name: '광명시' },
    { provinceCode: '41', code: '4122', name: '평택시' },
    { provinceCode: '41', code: '4125', name: '과천시' },
    { provinceCode: '41', code: '4127', name: '오산시' },
    { provinceCode: '41', code: '4128', name: '시흥시' },
    { provinceCode: '41', code: '4129', name: '군포시' },
    { provinceCode: '41', code: '4131', name: '의왕시' },
    { provinceCode: '41', code: '4136', name: '하남시' },
    { provinceCode: '41', code: '4137', name: '용인시' },
    { provinceCode: '41', code: '4141', name: '파주시' },
    { provinceCode: '41', code: '4143', name: '이천시' },
    { provinceCode: '41', code: '4145', name: '안성시' },
    { provinceCode: '41', code: '4146', name: '김포시' },
    { provinceCode: '41', code: '4150', name: '화성시' },
    { provinceCode: '41', code: '4155', name: '광주시' },
    { provinceCode: '41', code: '4157', name: '여주시' },

    // 인천광역시
    { provinceCode: '28', code: '2811', name: '중구' },
    { provinceCode: '28', code: '2814', name: '동구' },
    { provinceCode: '28', code: '2817', name: '미추홀구' },
    { provinceCode: '28', code: '2820', name: '연수구' },
    { provinceCode: '28', code: '2823', name: '남동구' },
    { provinceCode: '28', code: '2826', name: '부평구' },
    { provinceCode: '28', code: '2829', name: '계양구' },
    { provinceCode: '28', code: '2831', name: '서구' },
    { provinceCode: '28', code: '2871', name: '강화군' },
    { provinceCode: '28', code: '2872', name: '옹진군' },

    // 부산광역시
    { provinceCode: '26', code: '2611', name: '중구' },
    { provinceCode: '26', code: '2614', name: '서구' },
    { provinceCode: '26', code: '2617', name: '동구' },
    { provinceCode: '26', code: '2620', name: '영도구' },
    { provinceCode: '26', code: '2623', name: '부산진구' },
    { provinceCode: '26', code: '2626', name: '동래구' },
    { provinceCode: '26', code: '2629', name: '남구' },
    { provinceCode: '26', code: '2632', name: '북구' },
    { provinceCode: '26', code: '2635', name: '해운대구' },
    { provinceCode: '26', code: '2638', name: '사하구' },
    { provinceCode: '26', code: '2641', name: '금정구' },
    { provinceCode: '26', code: '2644', name: '강서구' },
    { provinceCode: '26', code: '2647', name: '연제구' },
    { provinceCode: '26', code: '2650', name: '수영구' },
    { provinceCode: '26', code: '2653', name: '사상구' },
    { provinceCode: '26', code: '2671', name: '기장군' },

    // 강원특별자치도 (주요 지역만)
    { provinceCode: '42', code: '4211', name: '춘천시' },
    { provinceCode: '42', code: '4213', name: '원주시' },
    { provinceCode: '42', code: '4215', name: '강릉시' },
    { provinceCode: '42', code: '4217', name: '동해시' },
    { provinceCode: '42', code: '4219', name: '태백시' },
    { provinceCode: '42', code: '4221', name: '속초시' },
    { provinceCode: '42', code: '4223', name: '삼척시' },
    { provinceCode: '42', code: '4272', name: '홍천군' },
    { provinceCode: '42', code: '4273', name: '횡성군' },
    { provinceCode: '42', code: '4275', name: '영월군' },
    { provinceCode: '42', code: '4276', name: '평창군' },
    { provinceCode: '42', code: '4277', name: '정선군' },
    { provinceCode: '42', code: '4278', name: '철원군' },
    { provinceCode: '42', code: '4279', name: '화천군' },
    { provinceCode: '42', code: '4280', name: '양구군' },
    { provinceCode: '42', code: '4281', name: '인제군' },
    { provinceCode: '42', code: '4282', name: '고성군' },
    { provinceCode: '42', code: '4283', name: '양양군' },

    // 제주특별자치도
    { provinceCode: '50', code: '5011', name: '제주시' },
    { provinceCode: '50', code: '5013', name: '서귀포시' }
];

async function createLocations() {
    try {
        console.log('🌍 지역 데이터 생성 시작...');

        // 1. 국가 데이터 생성
        console.log('📌 국가 데이터 생성 중...');
        const countryData = {
            name: '대한민국',
            code: 'KR',
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'countries', 'KR'), countryData);
        console.log('✅ 국가 데이터 생성 완료: 대한민국 (KR)');

        // 2. 시도 데이터 생성
        console.log('📌 시도 데이터 생성 중...');
        for (const province of provinces) {
            const provinceData = {
                name: province.name,
                countryCode: 'KR',
                code: province.code,
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const provinceId = `KR_${province.code}`;
            await setDoc(doc(db, 'provinces', provinceId), provinceData);
            console.log(`✅ 시도 생성 완료: ${province.name} (${provinceId})`);
        }

        // 3. 구/군 데이터 생성
        console.log('📌 구/군 데이터 생성 중...');
        for (const city of cities) {
            const cityData = {
                name: city.name,
                provinceCode: `KR_${city.provinceCode}`,
                code: city.code,
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const cityId = `KR_${city.provinceCode}_${city.code}`;
            await setDoc(doc(db, 'cities', cityId), cityData);
            console.log(`✅ 구/군 생성 완료: ${city.name} (${cityId})`);
        }

        console.log('🎉 모든 지역 데이터 생성 완료!');
        console.log(`📊 생성된 데이터:`);
        console.log(`   - 국가: 1개 (대한민국)`);
        console.log(`   - 시도: ${provinces.length}개`);
        console.log(`   - 구/군: ${cities.length}개`);

    } catch (error) {
        console.error('❌ 지역 데이터 생성 실패:', error.message);
    }
    process.exit(); // 스크립트 종료
}

createLocations();

