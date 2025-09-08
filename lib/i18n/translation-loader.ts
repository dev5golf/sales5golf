import i18n from './index';

// 서버 사이드에서 안전하게 실행되도록 체크
const isServer = typeof window === 'undefined';

/**
 * localStorage에서 번역 데이터를 로드하여 i18n에 적용
 */
export const loadTranslationsFromStorage = () => {
    if (isServer) return;

    try {
        const koTranslations = localStorage.getItem('translations_ko');
        const enTranslations = localStorage.getItem('translations_en');
        const viTranslations = localStorage.getItem('translations_vi');

        if (koTranslations && enTranslations && viTranslations) {
            const ko = JSON.parse(koTranslations);
            const en = JSON.parse(enTranslations);
            const vi = JSON.parse(viTranslations);

            // i18n 리소스 업데이트
            i18n.addResourceBundle('ko', 'translation', ko, true, true);
            i18n.addResourceBundle('en', 'translation', en, true, true);
            i18n.addResourceBundle('vi', 'translation', vi, true, true);
        }
    } catch (error) {
        console.error('번역 데이터 로드 중 오류:', error);
    }
};

/**
 * 번역 데이터를 localStorage에 저장
 */
export const saveTranslationsToStorage = (translations: {
    ko: Record<string, string>;
    en: Record<string, string>;
    vi: Record<string, string>;
}) => {
    if (isServer) return;

    try {
        localStorage.setItem('translations_ko', JSON.stringify(translations.ko));
        localStorage.setItem('translations_en', JSON.stringify(translations.en));
        localStorage.setItem('translations_vi', JSON.stringify(translations.vi));
    } catch (error) {
        console.error('번역 데이터 저장 중 오류:', error);
    }
};
