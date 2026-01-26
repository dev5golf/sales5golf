"use client";

import { useState, useEffect } from 'react';
import { Clock, FileText, Download, Calendar, Edit, Plus, DollarSign, Minus, X } from 'lucide-react';
import { ACTIVITY_LOG_CONSTANTS } from '../constants';
import { ActivityLogService, ActivityLog as ActivityLogType } from '../services/activityLogService';
import { Timestamp } from 'firebase/firestore';

// 액션별 아이콘 매핑
const actionIcons = {
    recruitment_create: Plus,
    recruitment_update: Edit,
    quotation_save: FileText,
    quotation_download: Download,
    reservation_create: Calendar,
    reservation_cancel: X,
    deposit_create: DollarSign,
    withdrawal_create: Minus
};

// 시간 포맷팅 함수
const formatTime = (timestamp: Timestamp | Date | null | undefined): string => {
    // null이나 undefined 체크
    if (!timestamp) {
        return '알 수 없음';
    }

    let date: Date;

    if (timestamp instanceof Timestamp) {
        // Timestamp가 null이거나 유효하지 않은 경우 체크
        if (!timestamp.toDate || typeof timestamp.toDate !== 'function') {
            return '알 수 없음';
        }
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        return '알 수 없음';
    }

    // date가 유효한지 체크
    if (!date || isNaN(date.getTime())) {
        return '알 수 없음';
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // 음수 차이는 미래 시간이므로 처리
    if (diff < 0) {
        return '방금 전';
    }

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

interface ActivityLogProps {
    refreshTrigger?: number; // 새로고침 트리거
}

export default function ActivityLog({ refreshTrigger }: ActivityLogProps) {
    const [logs, setLogs] = useState<ActivityLogType[]>([]);
    const [loading, setLoading] = useState(true);

    // 로그 목록 불러오기
    const loadLogs = async () => {
        setLoading(true);
        const response = await ActivityLogService.getRecentLogs(50);
        if (response.success && response.data) {
            // timestamp가 null이거나 유효하지 않은 로그 필터링
            const validLogs = response.data.filter(log => {
                if (!log.timestamp) return false;

                try {
                    if (log.timestamp instanceof Timestamp) {
                        const date = log.timestamp.toDate();
                        return date && !isNaN(date.getTime());
                    }
                    return true;
                } catch {
                    return false;
                }
            });

            setLogs(validLogs);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadLogs();
    }, [refreshTrigger]);

    return (
        <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-gray-800">
                    {ACTIVITY_LOG_CONSTANTS.SECTIONS.TITLE}
                </h3>
            </div>

            <div className="space-y-3 h-full overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        {ACTIVITY_LOG_CONSTANTS.MESSAGES.NO_DATA}
                    </p>
                ) : (
                    logs.map((log) => {
                        const Icon = actionIcons[log.action];
                        const actionLabel = ACTIVITY_LOG_CONSTANTS.ACTIONS.LABELS[log.action];
                        const actionColor = ACTIVITY_LOG_CONSTANTS.ACTIONS.COLORS[log.action];

                        return (
                            <div
                                key={log.id}
                                className="flex items-start gap-1 p-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${actionColor.bg} ${actionColor.text} flex-shrink-0 mt-0.5`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-gray-800">
                                            {log.userName}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${actionColor.badge}`}>
                                            {actionLabel}
                                        </span>
                                    </div>
                                    {log.targetTitle && (
                                        <p className="text-xs text-gray-600 truncate mb-1">
                                            {log.targetTitle}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatTime(log.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

