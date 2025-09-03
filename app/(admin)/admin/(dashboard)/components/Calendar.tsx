"use client";
import { useState } from 'react';
import { TeeTime, CalendarProps } from '../../../../../types';

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
        <div className="calendar-container">
            <div className="calendar-grid">
                {/* 요일 헤더 */}
                <div className="calendar-header">
                    {weekDays.map(day => (
                        <div key={day} className="calendar-day-header">
                            {day}
                        </div>
                    ))}
                </div>

                {/* 달력 날짜들 */}
                <div className="calendar-body">
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
                                className={`calendar-day ${isTodayDate ? 'today' : ''} ${isPastDateDay ? 'past-date' : ''} ${isSelected ? 'selected' : ''}`}
                                style={{ gridColumnStart }}
                                onClick={() => handleDateClick(date)}
                                title={isPastDateDay ? '지나간 날짜는 선택할 수 없습니다' : ''}
                            >
                                <div className="day-number">{date.getDate()}</div>
                                {dateTeeTimes.length > 0 && (
                                    <div className="tee-time-indicators">
                                        {dateTeeTimes.slice(0, 3).map((teeTime, idx) => (
                                            <div key={idx} className="tee-time-dot" title={`${teeTime.time} - ${teeTime.availableSlots}슬롯`}>
                                                <span className="time">{teeTime.time}</span>
                                            </div>
                                        ))}
                                        {dateTeeTimes.length > 3 && (
                                            <div className="more-indicator">+{dateTeeTimes.length - 3}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 범례 */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-dot today"></div>
                    <span>오늘</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot has-teetime"></div>
                    <span>티타임 등록됨</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot selected"></div>
                    <span>선택된 날짜</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot past-date"></div>
                    <span>지나간 날짜</span>
                </div>
            </div>
        </div>
    );
}
