import { useState } from 'react';
import { RecruitmentData } from '../components';
import { RecruitmentService } from '../services/recruitmentService';
import { ActivityLogService } from '../services/activityLogService';
import { RECRUITMENT_CONSTANTS } from '../constants';
import { useAuth } from '@/contexts/AuthContext';

interface UseRecruitmentModalOptions {
    onLogCreated?: () => void; // 로그 생성 후 콜백
}

export const useRecruitmentModal = (options?: UseRecruitmentModalOptions) => {
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

            const createdBy = user.name || user.email || '알 수 없음';

            if (editMode && editId) {
                // 수정 모드
                const response = await RecruitmentService.updateRecruitment(editId, data, createdBy, user.id);

                if (response.success) {
                    // 수배 수정 로그 기록
                    const title = `${data.customerName}_${data.destination}_${data.startDate}~${data.endDate}_${data.numberOfPeople}명`;
                    await ActivityLogService.createLog({
                        action: 'recruitment_update',
                        userId: user.id,
                        userName: createdBy,
                        targetId: editId,
                        targetTitle: title
                    });

                    // 로그 생성 후 콜백 호출
                    if (options?.onLogCreated) {
                        options.onLogCreated();
                    }

                    alert(response.message);
                    closeModal();
                } else {
                    alert(response.message);
                }
            } else {
                // 등록 모드
                const response = await RecruitmentService.createRecruitment(data, createdBy, user.id);

                if (response.success && response.data) {
                    // 수배 등록 로그 기록
                    await ActivityLogService.createLog({
                        action: 'recruitment_create',
                        userId: user.id,
                        userName: createdBy,
                        targetId: response.data.id,
                        targetTitle: response.data.title
                    });

                    // 로그 생성 후 콜백 호출
                    if (options?.onLogCreated) {
                        options.onLogCreated();
                    }

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
