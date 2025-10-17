import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    CountryWithTranslations,
    ProvinceWithTranslations,
    CityWithTranslations,
    CountryTranslation,
    ProvinceTranslation,
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

// 지방 데이터 가져오기
export const useProvinces = (countryId?: string) => {
    const [provinces, setProvinces] = useState<ProvinceWithTranslations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProvinces = async () => {
        try {
            setLoading(true);
            setError(null);

            const snapshot = await getDocs(collection(db, 'provinces'));

            const provinceDataPromises = snapshot.docs.map(async (docSnap) => {
                const provinceData = docSnap.data() as ProvinceWithTranslations;
                provinceData.id = docSnap.id;

                const translationsSnapshot = await getDocs(
                    collection(db, 'provinces', docSnap.id, 'translations')
                );

                const translations: { [key: string]: ProvinceTranslation } = {};
                translationsSnapshot.forEach(transDoc => {
                    translations[transDoc.id] = transDoc.data() as ProvinceTranslation;
                });

                provinceData.translations = translations;
                provinceData.name = translations['ko']?.name || translations['en']?.name || provinceData.id;

                // 국가 이름 가져오기
                try {
                    const countryDoc = await getDocs(collection(db, 'countries', provinceData.countryId, 'translations'));
                    const countryTranslations: { [key: string]: CountryTranslation } = {};
                    countryDoc.forEach(transDoc => {
                        countryTranslations[transDoc.id] = transDoc.data() as CountryTranslation;
                    });
                    provinceData.countryName = countryTranslations['ko']?.name || countryTranslations['en']?.name || provinceData.countryId;
                } catch (error) {
                    provinceData.countryName = '알 수 없음';
                }

                return provinceData;
            });

            let provincesData = await Promise.all(provinceDataPromises);

            // 국가 필터링
            if (countryId) {
                provincesData = provincesData.filter(p => p.countryId === countryId);
            }

            provincesData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setProvinces(provincesData);
        } catch (err) {
            console.error('지방 목록 가져오기 실패:', err);
            setError('지방 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProvinces();
    }, [countryId]);

    return {
        provinces,
        loading,
        error,
        refetch: fetchProvinces
    };
};

// 도시 데이터 가져오기
export const useCities = (provinceId?: string) => {
    const [cities, setCities] = useState<CityWithTranslations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCities = async () => {
        try {
            setLoading(true);
            setError(null);

            const snapshot = await getDocs(collection(db, 'cities'));

            const cityDataPromises = snapshot.docs.map(async (docSnap) => {
                const cityData = docSnap.data() as CityWithTranslations;
                cityData.id = docSnap.id;

                const translationsSnapshot = await getDocs(
                    collection(db, 'cities', docSnap.id, 'translations')
                );

                const translations: { [key: string]: CityTranslation } = {};
                translationsSnapshot.forEach(transDoc => {
                    translations[transDoc.id] = transDoc.data() as CityTranslation;
                });

                cityData.translations = translations;
                cityData.name = translations['ko']?.name || translations['en']?.name || cityData.id;

                // 지방 이름 가져오기
                try {
                    if (cityData.provinceId) {
                        const provinceDoc = await getDocs(collection(db, 'provinces', cityData.provinceId, 'translations'));
                        const provinceTranslations: { [key: string]: ProvinceTranslation } = {};
                        provinceDoc.forEach(transDoc => {
                            provinceTranslations[transDoc.id] = transDoc.data() as ProvinceTranslation;
                        });
                        cityData.provinceName = provinceTranslations['ko']?.name || provinceTranslations['en']?.name || cityData.provinceId;
                    } else {
                        cityData.provinceName = '알 수 없음';
                    }
                } catch (error) {
                    cityData.provinceName = '알 수 없음';
                }

                return cityData;
            });

            let citiesData = await Promise.all(cityDataPromises);

            // 지방 필터링
            if (provinceId) {
                citiesData = citiesData.filter(c => c.provinceId === provinceId);
            }

            citiesData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setCities(citiesData);
        } catch (err) {
            console.error('도시 목록 가져오기 실패:', err);
            setError('도시 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, [provinceId]);

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
    const provincesResult = useProvinces();
    const citiesResult = useCities();

    return {
        countries: countriesResult.countries,
        provinces: provincesResult.provinces,
        cities: citiesResult.cities,
        loading: countriesResult.loading || provincesResult.loading || citiesResult.loading,
        error: countriesResult.error || provincesResult.error || citiesResult.error,
        refetchAll: async () => {
            await Promise.all([
                countriesResult.refetch(),
                provincesResult.refetch(),
                citiesResult.refetch()
            ]);
        }
    };
};

