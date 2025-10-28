import { useState } from 'react';
import { RecruitmentData } from '../components';
import { RecruitmentService } from '../services/recruitmentService';
import { RECRUITMENT_CONSTANTS } from '../constants';
import { useAuth } from '@/contexts/AuthContext';

export const useRecruitmentModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const handleSubmit = async (data: RecruitmentData) => {
        setIsLoading(true);

        try {
            // 사용자 정보 확인
            if (!user) {
                alert('로그인이 필요합니다.');
                return;
            }

            // 필수 필드 검증
            const missingFields = RECRUITMENT_CONSTANTS.VALIDATION.REQUIRED_FIELDS.filter(
                field => !data[field] || data[field].trim() === ''
            );

            if (missingFields.length > 0) {
                alert(RECRUITMENT_CONSTANTS.MESSAGES.ERROR.VALIDATION);
                return;
            }

            // 서비스를 통한 데이터 저장
            const createdBy = user.name || user.email || '알 수 없음';
            const response = await RecruitmentService.createRecruitment(data, createdBy);

            if (response.success) {
                alert(response.message);
                closeModal();
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('수배 등록 실패:', error);
            alert(RECRUITMENT_CONSTANTS.MESSAGES.ERROR.CREATE);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isOpen,
        isLoading,
        openModal,
        closeModal,
        handleSubmit
    };
};
