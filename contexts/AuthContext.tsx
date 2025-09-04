"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User as FirebaseUser,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    UserCredential
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
    firebaseUser: FirebaseUser | null;  // Firebase Auth User
    user: User | null;         // Firestore User 데이터
    loading: boolean;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isCourseAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase가 초기화되지 않았으면 로딩 완료
        if (!auth) {
            console.warn('Firebase Auth가 초기화되지 않았습니다.');
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);

            if (firebaseUser) {
                // 사용자가 로그인되어 있으면 Firestore에서 사용자 정보를 가져옴
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: userData.name,
                            phone: userData.phone,
                            profileImage: userData.profileImage,
                            role: userData.role,
                            courseId: userData.courseId,
                            courseName: userData.courseName,
                            createdAt: userData.createdAt,
                            updatedAt: userData.updatedAt,
                            lastLoginAt: userData.lastLoginAt,
                            isActive: userData.isActive,
                            isEmailVerified: firebaseUser.emailVerified
                        });
                    } else {
                        // 사용자 정보가 없으면 로그아웃
                        await signOut(auth);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('사용자 정보 가져오기 실패:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!auth) {
            throw new Error('Firebase가 초기화되지 않았습니다.');
        }
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        if (!auth) {
            return;
        }
        await signOut(auth);
    };

    const isAdmin = user?.role === 'course_admin' || user?.role === 'super_admin';
    const isSuperAdmin = user?.role === 'super_admin';
    const isCourseAdmin = user?.role === 'course_admin';

    const value = {
        firebaseUser,
        user,
        loading,
        signIn,
        logout,
        isAdmin,
        isSuperAdmin,
        isCourseAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
