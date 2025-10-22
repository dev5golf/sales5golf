"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CourseWithTranslations, CourseTranslation } from '@/types';

interface GolfCourseAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (course: CourseWithTranslations) => void;
    placeholder?: string;
    className?: string;
}

// 드롭다운 상태를 관리하는 타입
interface DropdownState {
    isOpen: boolean;
    selectedIndex: number;
    isSelecting: boolean;
    isFocused: boolean;
}

export default function GolfCourseAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = "골프장명을 입력하세요",
    className = ""
}: GolfCourseAutocompleteProps) {
    // 데이터 상태
    const [courses, setCourses] = useState<CourseWithTranslations[]>([]);
    const [loading, setLoading] = useState(false);

    // 드롭다운 상태 통합
    const [dropdownState, setDropdownState] = useState<DropdownState>({
        isOpen: false,
        selectedIndex: -1,
        isSelecting: false,
        isFocused: false
    });

    // UI 상태
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    // Refs
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 골프장 데이터 가져오기 (메모이제이션)
    const fetchCourses = useCallback(async () => {
        if (courses.length > 0) return; // 이미 데이터가 있으면 중복 요청 방지

        try {
            setLoading(true);

            if (!db) {
                console.error('Firebase DB가 연결되지 않음');
                setCourses([]);
                return;
            }

            const coursesQuery = query(
                collection(db, 'courses'),
                where('isActive', '==', true)
            );

            const snapshot = await getDocs(coursesQuery);

            // 각 골프장의 번역 데이터도 함께 가져오기
            const courseDataPromises = snapshot.docs.map(async (courseDoc) => {
                const translationsSnapshot = await getDocs(
                    collection(db, 'courses', courseDoc.id, 'translations')
                );

                const translations: { [key: string]: CourseTranslation } = {};
                translationsSnapshot.docs.forEach(transDoc => {
                    translations[transDoc.id] = transDoc.data() as CourseTranslation;
                });

                return {
                    id: courseDoc.id,
                    ...courseDoc.data(),
                    translations,
                    name: translations['ko']?.name || translations['en']?.name || courseDoc.id
                } as CourseWithTranslations;
            });

            const coursesData = await Promise.all(courseDataPromises);

            // 이름순으로 정렬
            const sortedCourses = coursesData.sort((a, b) =>
                (a.name || '').localeCompare(b.name || '')
            );

            setCourses(sortedCourses);
        } catch (error) {
            console.error('골프장 목록 가져오기 실패:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [courses.length]);

    // 컴포넌트 마운트 시 데이터 가져오기
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // 필터링된 골프장 목록 (메모이제이션)
    const filteredCourses = useMemo(() => {
        if (!value.trim()) return courses;

        return courses.filter(course => {
            const courseName = course.translations?.ko?.name || course.translations?.en?.name || '';
            return courseName.toLowerCase().includes(value.toLowerCase());
        });
    }, [courses, value]);

    // 드롭다운 위치 업데이트
    const updateDropdownPosition = useCallback(() => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, []);

    // 드롭다운 상태 업데이트 헬퍼
    const updateDropdownState = useCallback((updates: Partial<DropdownState>) => {
        setDropdownState(prev => ({ ...prev, ...updates }));
    }, []);

    // 입력값 변경 핸들러
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // 입력값이 변경되면 선택 인덱스 리셋하고 드롭다운 열기
        updateDropdownState({
            selectedIndex: -1,
            isSelecting: false,
            isOpen: true,
            isFocused: true
        });
    }, [onChange, updateDropdownState]);

    // 포커스 핸들러
    const handleInputFocus = useCallback(() => {
        if (dropdownState.isSelecting) return;

        updateDropdownState({
            isFocused: true,
            isOpen: true,
            selectedIndex: -1
        });
        updateDropdownPosition();
    }, [dropdownState.isSelecting, updateDropdownState, updateDropdownPosition]);

    // 블러 핸들러
    const handleInputBlur = useCallback(() => {
        updateDropdownState({ isFocused: false });
    }, [updateDropdownState]);

    // 골프장 선택 핸들러
    const handleCourseSelect = useCallback((course: CourseWithTranslations, event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // 선택 중 상태로 설정
        updateDropdownState({
            isSelecting: true,
            isOpen: false,
            selectedIndex: -1,
            isFocused: false
        });

        // 값 업데이트 (한글명 우선)
        const courseName = course.translations?.ko?.name || course.translations?.en?.name || course.id;
        onChange(courseName);

        // onSelect 콜백 호출
        if (onSelect) {
            onSelect(course);
        }

        // 포커스 제거
        inputRef.current?.blur();

        // 선택 완료 후 상태 리셋 (다음 렌더링 사이클에서)
        setTimeout(() => {
            updateDropdownState({ isSelecting: false });
        }, 0);
    }, [onChange, updateDropdownState, onSelect]);

    // 선택된 항목을 화면에 보이도록 스크롤
    const scrollToSelectedItem = useCallback((selectedIndex: number) => {
        if (dropdownRef.current && selectedIndex >= 0) {
            const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, []);

    // 키보드 네비게이션
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        // 드롭다운이 열려있지 않으면 포커스 시 드롭다운 열기
        if (!dropdownState.isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            const newIndex = e.key === 'ArrowDown' ? 0 : filteredCourses.length - 1;
            updateDropdownState({
                isOpen: true,
                isFocused: true,
                selectedIndex: newIndex
            });
            updateDropdownPosition();
            return;
        }

        if (!dropdownState.isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = dropdownState.selectedIndex < filteredCourses.length - 1
                    ? dropdownState.selectedIndex + 1
                    : 0;
                updateDropdownState({ selectedIndex: nextIndex });
                scrollToSelectedItem(nextIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = dropdownState.selectedIndex > 0
                    ? dropdownState.selectedIndex - 1
                    : filteredCourses.length - 1;
                updateDropdownState({ selectedIndex: prevIndex });
                scrollToSelectedItem(prevIndex);
                break;
            case 'Enter':
                e.preventDefault();
                if (dropdownState.selectedIndex >= 0 && dropdownState.selectedIndex < filteredCourses.length) {
                    handleCourseSelect(filteredCourses[dropdownState.selectedIndex]);
                } else if (filteredCourses.length === 1) {
                    // 검색 결과가 하나뿐이면 자동 선택
                    handleCourseSelect(filteredCourses[0]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                updateDropdownState({
                    isOpen: false,
                    selectedIndex: -1,
                    isFocused: false
                });
                inputRef.current?.blur();
                break;
            case 'Tab':
                // Tab 키로 드롭다운 닫기
                updateDropdownState({
                    isOpen: false,
                    selectedIndex: -1
                });
                break;
        }
    }, [dropdownState.isOpen, dropdownState.selectedIndex, filteredCourses, updateDropdownState, updateDropdownPosition, handleCourseSelect, scrollToSelectedItem]);

    // 드롭다운 표시 여부 결정
    const shouldShowDropdown = useMemo(() => {
        if (dropdownState.isSelecting) return false;
        if (!dropdownState.isOpen) return false;
        if (filteredCourses.length === 0) return false;
        return true;
    }, [dropdownState.isSelecting, dropdownState.isOpen, filteredCourses.length]);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                dropdownRef.current?.contains(target) ||
                inputRef.current?.contains(target)
            ) {
                return;
            }

            updateDropdownState({
                isOpen: false,
                isFocused: false,
                selectedIndex: -1
            });
        };

        if (dropdownState.isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [dropdownState.isOpen, updateDropdownState]);

    // 스크롤 및 리사이즈 이벤트
    useEffect(() => {
        const handleScroll = () => updateDropdownPosition();
        const handleResize = () => updateDropdownPosition();

        if (dropdownState.isOpen) {
            window.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [dropdownState.isOpen, updateDropdownPosition]);

    return (
        <div className="golf-course-autocomplete">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
                autoComplete="off"
                disabled={loading}
            />

            {shouldShowDropdown && createPortal(
                <div
                    ref={dropdownRef}
                    className="golf-course-autocomplete-dropdown"
                    onMouseDown={(e) => {
                        // 드롭다운 클릭 시 onBlur 이벤트 방지
                        e.preventDefault();
                    }}
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        zIndex: 99999,
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        maxHeight: '15rem',
                        overflowY: 'auto',
                        marginTop: '0.25rem'
                    }}
                >
                    {loading ? (
                        <div
                            className="dropdown-item loading"
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                textAlign: 'center'
                            }}
                        >
                            로딩 중...
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        filteredCourses.map((course, index) => {
                            const isSelected = index === dropdownState.selectedIndex;
                            return (
                                <div
                                    key={course.id}
                                    className="dropdown-item"
                                    onClick={(e) => handleCourseSelect(course, e)}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateDropdownState({ isFocused: true });
                                    }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        borderBottom: '1px solid #f3f4f6',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: isSelected ? '#e5e7eb' : 'white'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }
                                    }}
                                >
                                    <div
                                        className="course-name"
                                        style={{
                                            fontWeight: '500',
                                            color: '#111827'
                                        }}
                                    >
                                        {course.translations?.ko?.name || course.translations?.en?.name || course.id}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div
                            className="dropdown-item no-results"
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                textAlign: 'center'
                            }}
                        >
                            검색 결과가 없습니다
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}