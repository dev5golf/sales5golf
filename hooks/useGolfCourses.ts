import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CourseWithTranslations, CourseTranslation } from '@/types';

export const useGolfCourses = () => {
    const [courses, setCourses] = useState<CourseWithTranslations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                const coursesRef = collection(db, 'courses');
                const snapshot = await getDocs(coursesRef);

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

                setCourses(coursesData);
            } catch (err) {
                console.error('골프장 데이터 가져오기 실패:', err);
                setError('골프장 데이터를 가져오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const getCoursesByRegion = (region: string) => {
        return courses.filter(course => course.provinceName === region);
    };

    const searchCourses = (searchTerm: string) => {
        if (!searchTerm) return courses;

        return courses.filter(course => {
            const courseName = course.translations?.ko?.name || course.translations?.en?.name || '';
            const provinceName = course.provinceName || '';

            return courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                provinceName.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    return {
        courses,
        loading,
        error,
        getCoursesByRegion,
        searchCourses
    };
};
