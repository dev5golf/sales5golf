/**
 * 테이블 핸들러 함수들
 * 공통으로 사용되는 테이블 관련 핸들러 함수들을 모아놓은 파일
 */

import { Course } from '@/types';
import { INCLUSION_OPTIONS } from '@/constants/quotationConstants';

/**
 * 포함사항 변경 핸들러 생성
 * @param schedules 스케줄 배열
 * @param onUpdate 업데이트 함수
 * @returns 포함사항 변경 핸들러 함수
 */
export const createInclusionChangeHandler = (schedules: any[], onUpdate: Function) =>
    (id: string, inclusion: string, checked: boolean) => {
        const schedule = schedules.find(s => s.id === id);
        if (!schedule) return;

        let newInclusions = [...schedule.inclusions];
        if (checked) {
            newInclusions.push(inclusion);
        } else {
            newInclusions = newInclusions.filter(item => item !== inclusion);
        }

        onUpdate(id, 'inclusions', newInclusions);
    };

/**
 * 골프장 선택 핸들러 생성
 * @param onUpdate 업데이트 함수
 * @returns 골프장 선택 핸들러 함수
 */
export const createCourseSelectHandler = (onUpdate: Function) =>
    (id: string, course: Course) => {
        // 골프장명 업데이트
        onUpdate(id, 'courseName', course.name);

        // 포함사항 자동 설정 (골프장의 inclusions가 있으면 사용, 없으면 기본값)
        const inclusions = course.inclusions && course.inclusions.length > 0
            ? course.inclusions
            : [...INCLUSION_OPTIONS];

        onUpdate(id, 'inclusions', inclusions);
    };

/**
 * 총액 변경 핸들러 생성 (원화 포맷팅)
 * @param onUpdate 업데이트 함수
 * @returns 총액 변경 핸들러 함수
 */
export const createTotalChangeHandler = (onUpdate: Function) =>
    (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // 숫자만 추출
        const numericValue = value.replace(/[^\d]/g, '');

        // 원화 표기와 함께 저장 (천단위 콤마 없음)
        const finalValue = numericValue ? `₩${numericValue}` : '';
        onUpdate(id, 'total', finalValue);
    };

/**
 * 총액 변경 핸들러 생성 (현장결제용 - 엔화 처리)
 * @param onUpdate 업데이트 함수
 * @param convertYenToWon 엔화를 원화로 변환하는 함수
 * @returns 총액 변경 핸들러 함수
 */
export const createOnSiteTotalChangeHandler = (onUpdate: Function, convertYenToWon: Function) =>
    (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // 숫자만 추출
        const numericValue = value.replace(/[^\d]/g, '');

        // 빈 값이면 그대로 저장
        if (numericValue === '') {
            onUpdate(id, 'total', '');
            onUpdate(id, 'yenAmount', '');
            return;
        }

        // 숫자로 변환
        const totalAmount = parseInt(numericValue) || 0;

        // 현장결제: 엔화 금액을 별도로 저장하고 원화로 변환하여 저장
        onUpdate(id, 'yenAmount', totalAmount.toString());
        const wonAmount = convertYenToWon(totalAmount);
        const wonFormatted = `₩${wonAmount}`;
        onUpdate(id, 'total', wonFormatted);
    };

/**
 * 직접입력 모드 토글 핸들러 생성 (단일 필드용)
 * @param directInputMode 직접입력 모드 상태
 * @param setDirectInputMode 직접입력 모드 상태 설정 함수
 * @param onUpdate 업데이트 함수
 * @param dbField DB 필드명
 * @returns 직접입력 모드 토글 핸들러 함수
 */
export const createSingleFieldDirectInputToggleHandler = (
    directInputMode: any,
    setDirectInputMode: Function,
    onUpdate: Function,
    dbField: string
) =>
    (id: string) => {
        const newValue = !directInputMode[id];
        setDirectInputMode((prev: any) => ({
            ...prev,
            [id]: newValue
        }));
        // DB에도 저장
        onUpdate(id, dbField, newValue.toString());
    };

/**
 * 직접입력 모드 토글 핸들러 생성 (다중 필드용)
 * @param directInputMode 직접입력 모드 상태
 * @param setDirectInputMode 직접입력 모드 상태 설정 함수
 * @param onUpdate 업데이트 함수
 * @returns 직접입력 모드 토글 핸들러 함수
 */
export const createMultiFieldDirectInputToggleHandler = (
    directInputMode: any,
    setDirectInputMode: Function,
    onUpdate: Function
) =>
    (id: string, field: string) => {
        const newValue = !directInputMode[id]?.[field];
        setDirectInputMode((prev: any) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: newValue
            }
        }));
        // DB에도 저장
        const dbField = `${field}DirectInput`;
        onUpdate(id, dbField, newValue.toString());
    };
