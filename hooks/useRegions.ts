import { useState, useEffect } from 'react';
import { collection, getDocs, collectionGroup, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    CountryWithTranslations,
    CityWithTranslations,
    CountryTranslation,
    CityTranslation
} from '@/types';

// 국가 데이터 가져오기
export const useCountries = () => {
    const [countries, setCountries] = useState<CountryWithTranslations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCountries = async () => {
        try {
            setLoading(true);
            setError(null);

            const snapshot = await getDocs(collection(db, 'countries'));

            const countryDataPromises = snapshot.docs.map(async (countryDoc) => {
                const translationsSnapshot = await getDocs(
                    collection(db, 'countries', countryDoc.id, 'translations')
                );

                const translations: { [key: string]: CountryTranslation } = {};
                translationsSnapshot.docs.forEach(transDoc => {
                    translations[transDoc.id] = transDoc.data() as CountryTranslation;
                });

                return {
                    id: countryDoc.id,
                    ...countryDoc.data(),
                    translations,
                    name: translations['ko']?.name || translations['en']?.name || countryDoc.id
                } as CountryWithTranslations;
            });

            const countriesData = await Promise.all(countryDataPromises);
            countriesData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setCountries(countriesData);
        } catch (err) {
            console.error('국가 목록 가져오기 실패:', err);
            setError('국가 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    return {
        countries,
        loading,
        error,
        refetch: fetchCountries
    };
};

// 도시 데이터 가져오기 (서브컬렉션)
export const useCities = (countryId?: string) => {
    const [cities, setCities] = useState<CityWithTranslations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCities = async () => {
        try {
            setLoading(true);
            setError(null);

            let snapshot;

            if (countryId) {
                // 특정 국가의 도시만 조회 (효율적)
                snapshot = await getDocs(collection(db, 'countries', countryId, 'cities'));
            } else {
                // 모든 도시 조회 (Collection Group 사용)
                snapshot = await getDocs(collectionGroup(db, 'cities'));
            }

            const cityDataPromises = snapshot.docs.map(async (docSnap) => {
                const cityData = docSnap.data() as CityWithTranslations;
                cityData.id = docSnap.id;

                // countryId 추출 (Collection Group의 경우 부모 경로에서 가져옴)
                const pathSegments = docSnap.ref.path.split('/');
                cityData.countryId = pathSegments[pathSegments.length - 3]; // countries/{countryId}/cities/{cityId}

                // 번역 가져오기
                const translationsSnapshot = await getDocs(
                    collection(db, 'countries', cityData.countryId, 'cities', docSnap.id, 'translations')
                );

                const translations: { [key: string]: CityTranslation } = {};
                translationsSnapshot.forEach(transDoc => {
                    translations[transDoc.id] = transDoc.data() as CityTranslation;
                });

                cityData.translations = translations;
                cityData.name = translations['ko']?.name || translations['en']?.name || cityData.id;

                // 국가 이름 가져오기
                try {
                    const countryDoc = await getDocs(collection(db, 'countries', cityData.countryId, 'translations'));
                    const countryTranslations: { [key: string]: CountryTranslation } = {};
                    countryDoc.forEach(transDoc => {
                        countryTranslations[transDoc.id] = transDoc.data() as CountryTranslation;
                    });
                    cityData.countryName = countryTranslations['ko']?.name || countryTranslations['en']?.name || cityData.countryId;
                } catch (error) {
                    cityData.countryName = '알 수 없음';
                }

                return cityData;
            });

            let citiesData = await Promise.all(cityDataPromises);
            citiesData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setCities(citiesData);
        } catch (err) {
            console.error('도시 목록 가져오기 실패:', err);
            setError('도시 목록을 불러오는데 실패했습니다.');
            // Collection Group 권한이 없거나 도시가 없을 경우 빈 배열 설정
            setCities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, [countryId]);

    return {
        cities,
        loading,
        error,
        refetch: fetchCities
    };
};

// 모든 지역 데이터 가져오기 (필요한 경우)
export const useRegions = () => {
    const countriesResult = useCountries();
    const citiesResult = useCities();

    return {
        countries: countriesResult.countries,
        cities: citiesResult.cities,
        loading: countriesResult.loading || citiesResult.loading,
        error: countriesResult.error || citiesResult.error,
        refetchAll: async () => {
            await Promise.all([
                countriesResult.refetch(),
                citiesResult.refetch()
            ]);
        }
    };
};

