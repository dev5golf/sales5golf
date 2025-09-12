import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course } from '../types';

export const useGolfCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                const coursesRef = collection(db, 'courses');
                const snapshot = await getDocs(coursesRef);

                const coursesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Course[];

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

        return courses.filter(course =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.provinceName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return {
        courses,
        loading,
        error,
        getCoursesByRegion,
        searchCourses
    };
};
