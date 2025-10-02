/**
 * 테이블 관련 유틸리티 함수들
 */

/**
 * 테이블 추가 버튼 클릭 핸들러를 생성하는 함수
 * @param isFormValid 폼 유효성 검사 결과
 * @param onAdd 추가 함수
 * @returns 클릭 핸들러 함수
 */
export const createAddClickHandler = (isFormValid: boolean, onAdd: () => void) => {
    return () => {
        if (!isFormValid) {
            alert('먼저 고객명, 여행지, 여행기간, 인원을 모두 입력해주세요.');
            return;
        }
        onAdd();
    };
};
