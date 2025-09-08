'use client';

import i18n from './index';

// 클라이언트에서만 i18n 초기화
if (typeof window !== 'undefined') {
    // i18n이 이미 초기화되지 않았다면 초기화
    if (!i18n.isInitialized) {
        i18n.init();
    }
}

export default i18n;
