/**
 * 골프장 관련 상수 정의
 */

/**
 * 포함사항 번역 맵
 */
export const COURSE_INCLUSIONS = {
    GREEN_FEE: {
        ko: '그린피',
        en: 'Green Fee'
    },
    CADDY_FEE: {
        ko: '캐디피',
        en: 'Caddy Fee'
    },
    CART_FEE: {
        ko: '카트비',
        en: 'Cart Fee'
    }
} as const;

/**
 * 포함사항 키 배열 (DB 저장용)
 */
export const INCLUSION_KEYS = Object.keys(COURSE_INCLUSIONS) as Array<keyof typeof COURSE_INCLUSIONS>;

/**
 * 포함사항 코드 타입
 */
export type InclusionCode = keyof typeof COURSE_INCLUSIONS;

/**
 * 포함사항 번역 가져오기 헬퍼 함수
 * @param code 포함사항 코드
 * @param language 언어 (ko | en)
 * @returns 번역된 포함사항명
 */
export function getInclusionName(code: string, language: 'ko' | 'en' = 'ko'): string {
    const inclusion = COURSE_INCLUSIONS[code as InclusionCode];
    return inclusion ? inclusion[language] : code;
}

/**
 * 선택 가능한 포함사항 목록 (UI용)
 * @param language 언어 (ko | en)
 * @returns { code, label } 배열
 */
export function getInclusionOptions(language: 'ko' | 'en' = 'ko') {
    return INCLUSION_KEYS.map(key => ({
        code: key,
        label: COURSE_INCLUSIONS[key][language]
    }));
}

/**
 * 여러 포함사항 코드를 번역된 이름 배열로 변환
 * @param codes 포함사항 코드 배열
 * @param language 언어 (ko | en)
 * @returns 번역된 이름 배열
 */
export function translateInclusions(codes: string[], language: 'ko' | 'en' = 'ko'): string[] {
    return codes.map(code => getInclusionName(code, language));
}

