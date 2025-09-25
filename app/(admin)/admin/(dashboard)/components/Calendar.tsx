"use client";
import { useState } from 'react';
import { TeeTime } from '@/app/(admin)/admin/tee-times/types';

/**
 * 캘린더 컴포넌트 Props
 * 달력 표시와 날짜 클릭 이벤트를 처리하는 인터페이스
 */
interface CalendarProps {
    currentMonth: Date;
    onDateClick: (date: string) => void;
    teeTimes: TeeTime[];
}

export default function Calendar({ currentMonth, onDateClick, teeTimes }: CalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // 달력 데이터 생성
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 현재 월의 날짜들만 생성
    const currentMonthDays = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
        currentMonthDays.push(new Date(year, month, day));
    }

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // isCurrentMonth 함수 제거됨 - currentMonthDays로 대체

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘의 시작 시간으로 설정
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0); // 비교할 날짜의 시작 시간으로 설정
        return targetDate < today;
    };

    const getTeeTimesForDate = (date: Date) => {
        const dateStr = formatDate(date);
        return teeTimes.filter(teeTime => teeTime.date === dateStr);
    };

    const handleDateClick = (date: Date) => {
        if (isPastDate(date)) {
            return; // 지나간 날짜는 클릭 무시
        }
        setSelectedDate(date);
        onDateClick(formatDate(date));
    };

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="w-full">
            <div className="grid grid-cols-7 gap-1 mb-4">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 gap-1 col-span-7">
                    {weekDays.map(day => (
                        <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-md">
                            {day}
                        </div>
                    ))}
                </div>

                {/* 달력 날짜들 */}
                <div className="grid grid-cols-7 gap-1 col-span-7">
                    {/* 현재 월의 날짜들만 표시 */}
                    {currentMonthDays.map((date, index) => {
                        const dateTeeTimes = getTeeTimesForDate(date);
                        const isTodayDate = isToday(date);
                        const isPastDateDay = isPastDate(date);
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                        // 첫 번째 날짜의 경우 올바른 그리드 위치에 배치
                        const gridColumnStart = index === 0 ? firstDay.getDay() + 1 : 'auto';

                        return (
                            <div
                                key={index}
                                className={`
                                    relative p-2 min-h-[80px] border border-gray-200 rounded-md cursor-pointer transition-all duration-200
                                    ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''}
                                    ${isPastDateDay ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}
                                    ${isSelected ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-200' : ''}
                                    ${!isPastDateDay ? 'hover:shadow-sm' : ''}
                                `}
                                style={{ gridColumnStart }}
                                onClick={() => handleDateClick(date)}
                                title={isPastDateDay ? '지나간 날짜는 선택할 수 없습니다' : ''}
                            >
                                <div className={`text-sm font-medium ${isPastDateDay ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {date.getDate()}
                                </div>
                                {dateTeeTimes.length > 0 && (
                                    <div className="mt-1 space-y-1">
                                        {dateTeeTimes.slice(0, 3).map((teeTime, idx) => (
                                            <div
                                                key={idx}
                                                className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded truncate"
                                                title={`${teeTime.time} - ${teeTime.availableSlots}슬롯`}
                                            >
                                                {teeTime.time}
                                            </div>
                                        ))}
                                        {dateTeeTimes.length > 3 && (
                                            <div className="text-xs text-gray-500 font-medium">
                                                +{dateTeeTimes.length - 3}개 더
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                    <span className="text-sm text-gray-600">오늘</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-sm text-gray-600">티타임 등록됨</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 border-2 border-blue-400 rounded"></div>
                    <span className="text-sm text-gray-600">선택된 날짜</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                    <span className="text-sm text-gray-600">지나간 날짜</span>
                </div>
            </div>
        </div>
    );
}
