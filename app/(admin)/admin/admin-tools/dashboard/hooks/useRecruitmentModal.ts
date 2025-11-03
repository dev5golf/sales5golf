import { useState } from 'react';
import { RecruitmentData } from '../components';
import { RecruitmentService } from '../services/recruitmentService';
import { RECRUITMENT_CONSTANTS } from '../constants';
import { useAuth } from '@/contexts/AuthContext';

export const useRecruitmentModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [initialData, setInitialData] = useState<RecruitmentData | undefined>(undefined);
    const { user } = useAuth();

    const openModal = () => {
        setEditMode(false);
        setEditId(null);
        setInitialData(undefined);
        setIsOpen(true);
    };

    const openEditModal = (id: string, data: RecruitmentData) => {
        setEditMode(true);
        setEditId(id);
        setInitialData(data);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditMode(false);
        setEditId(null);
        setInitialData(undefined);
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

            if (editMode && editId) {
                // 수정 모드
                const createdBy = user.name || user.email || '알 수 없음';
                const response = await RecruitmentService.updateRecruitment(editId, data, createdBy);

                if (response.success) {
                    alert(response.message);
                    closeModal();
                } else {
                    alert(response.message);
                }
            } else {
                // 등록 모드
                const createdBy = user.name || user.email || '알 수 없음';
                const response = await RecruitmentService.createRecruitment(data, createdBy);

                if (response.success) {
                    alert(response.message);
                    closeModal();
                } else {
                    alert(response.message);
                }
            }
        } catch (error) {
            console.error(editMode ? '수배 수정 실패:' : '수배 등록 실패:', error);
            alert(editMode ? '수배 수정에 실패했습니다.' : RECRUITMENT_CONSTANTS.MESSAGES.ERROR.CREATE);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isOpen,
        isLoading,
        editMode,
        initialData,
        openModal,
        openEditModal,
        closeModal,
        handleSubmit
    };
};
