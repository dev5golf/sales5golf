// 골프장 데이터
const golfCourses = [
    {
        id: 1,
        name: "탄손녓 골프 코스",
        location: "Winter Park, FL",
        type: "public",
        rating: 4.2,
        reviews: 128,
        price: "45,000원",
        originalPrice: "65,000원",
        discount: "31% 할인",
        image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        description: "아름다운 자연 속에서 즐기는 18홀 공공 골프장",
        features: ["18홀", "파 72", "6,500야드", "프로샵", "레스토랑"]
    },
    {
        id: 2,
        name: "파인 밸리 골프 클럽",
        location: "Pine Valley, NJ",
        type: "private",
        rating: 4.8,
        reviews: 89,
        price: "350,000원",
        originalPrice: "450,000원",
        discount: "22% 할인",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        description: "세계 최고의 프라이빗 골프장 중 하나",
        features: ["18홀", "파 70", "7,000야드", "클럽하우스", "골프카트"]
    },
    {
        id: 3,
        name: "어거스타 내셔널 골프 클럽",
        location: "Augusta, GA",
        type: "private",
        rating: 4.9,
        reviews: 156,
        price: "500,000원",
        originalPrice: "600,000원",
        discount: "17% 할인",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        description: "마스터스 토너먼트의 성지",
        features: ["18홀", "파 72", "7,475야드", "골프카트", "캐디"]
    },
    {
        id: 4,
        name: "페블 비치 골프 링크스",
        location: "Pebble Beach, CA",
        type: "resort",
        rating: 4.7,
        reviews: 203,
        price: "550,000원",
        originalPrice: "650,000원",
        discount: "15% 할인",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        description: "태평양을 바라보는 세계적인 리조트 골프장",
        features: ["18홀", "파 72", "7,075야드", "리조트", "스파"]
    },
    {
        id: 5,
        name: "세인트 앤드류스 올드 코스",
        location: "St. Andrews, Scotland",
        type: "public",
        rating: 4.6,
        reviews: 178,
        price: "200,000원",
        originalPrice: "250,000원",
        discount: "20% 할인",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        description: "골프의 발상지, 역사적인 링크스 코스",
        features: ["18홀", "파 72", "7,305야드", "골프박물관", "골프카트"]
    },
    {
        id: 6,
        name: "휘슬링 스트레이츠",
        location: "Kohler, WI",
        type: "resort",
        rating: 4.5,
        reviews: 134,
        price: "300,000원",
        originalPrice: "380,000원",
        discount: "21% 할인",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        description: "미시간 호수를 바라보는 아름다운 리조트 코스",
        features: ["18홀", "파 72", "7,790야드", "리조트", "골프카트"]
    },
    {
        id: 7,
        name: "TPC 소그래스",
        location: "Ponte Vedra Beach, FL",
        type: "resort",
        rating: 4.4,
        reviews: 167,
        price: "400,000원",
        originalPrice: "480,000원",
        discount: "17% 할인",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        description: "PLAYERS 챔피언십의 홈 코스",
        features: ["18홀", "파 72", "7,245야드", "리조트", "골프카트"]
    },
    {
        id: 8,
        name: "베스페이지 블랙 코스",
        location: "Farmingdale, NY",
        type: "public",
        rating: 4.3,
        reviews: 145,
        price: "75,000원",
        originalPrice: "95,000원",
        discount: "21% 할인",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        description: "뉴욕의 대표적인 공공 골프장",
        features: ["18홀", "파 71", "7,468야드", "골프카트", "프로샵"]
    }
];

// 현재 페이지와 필터 상태
let currentPage = 1;
let currentFilter = 'all';
let filteredCourses = [...golfCourses];
const coursesPerPage = 6;

// DOM 요소들
const coursesGrid = document.getElementById('coursesGrid');
const searchInput = document.querySelector('.search-input');
const filterToggles = document.querySelectorAll('.filter-toggle');
const searchBtn = document.querySelector('.search-btn');

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    initializePage();
    setupEventListeners();
});

// 페이지 초기화
function initializePage() {
    renderCourses();
    updatePagination();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 검색 버튼 클릭
    searchBtn.addEventListener('click', handleSearch);

    // 검색 입력 엔터키
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 필터 토글 버튼들
    filterToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const filter = this.dataset.filter;
            setActiveFilter(filter);
        });
    });
}

// 검색 처리
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        filteredCourses = [...golfCourses];
    } else {
        filteredCourses = golfCourses.filter(course =>
            course.name.toLowerCase().includes(searchTerm) ||
            course.location.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm)
        );
    }

    // 필터 적용
    if (currentFilter !== 'all') {
        filteredCourses = filteredCourses.filter(course => course.type === currentFilter);
    }

    currentPage = 1;
    renderCourses();
    updatePagination();
}

// 필터 설정
function setActiveFilter(filter) {
    currentFilter = filter;

    // 활성 필터 버튼 업데이트
    filterToggles.forEach(toggle => {
        toggle.classList.remove('active');
        if (toggle.dataset.filter === filter) {
            toggle.classList.add('active');
        }
    });

    // 필터 적용
    if (filter === 'all') {
        filteredCourses = [...golfCourses];
    } else {
        filteredCourses = golfCourses.filter(course => course.type === filter);
    }

    // 검색어가 있으면 검색 필터도 적용
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm !== '') {
        filteredCourses = filteredCourses.filter(course =>
            course.name.toLowerCase().includes(searchTerm) ||
            course.location.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm)
        );
    }

    currentPage = 1;
    renderCourses();
    updatePagination();
}

// 골프장 렌더링
function renderCourses() {
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);

    coursesGrid.innerHTML = '';

    if (coursesToShow.length === 0) {
        coursesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어나 필터를 시도해보세요.</p>
            </div>
        `;
        return;
    }

    coursesToShow.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesGrid.appendChild(courseCard);
    });
}

// 골프장 카드 생성
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
        <div class="course-card-image">
            <img src="${course.image}" alt="${course.name}">
            <div class="course-card-badge ${course.type}">${getTypeLabel(course.type)}</div>
            ${course.discount ? `<div class="course-card-discount">${course.discount}</div>` : ''}
        </div>
        <div class="course-card-content">
            <h3 class="course-card-title">${course.name}</h3>
            <div class="course-card-location">
                <i class="fas fa-map-marker-alt"></i> ${course.location}
            </div>
            <div class="course-card-rating">
                <i class="fas fa-star"></i> ${course.rating} (${course.reviews} reviews)
            </div>
            <p class="course-card-description">${course.description}</p>
            <div class="course-card-features">
                ${course.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
            </div>
            <div class="course-card-price">
                <span class="current-price">${course.price}</span>
                ${course.originalPrice ? `<span class="original-price">${course.originalPrice}</span>` : ''}
            </div>
            <div class="course-card-actions">
                <button class="btn btn-outline" onclick="viewCourse(${course.id})">
                    <i class="fas fa-eye"></i> 상세보기
                </button>
                <button class="btn btn-primary" onclick="bookTeeTime(${course.id})">
                    <i class="fas fa-calendar-check"></i> 예약하기
                </button>
            </div>
        </div>
    `;

    return card;
}

// 타입 라벨 가져오기
function getTypeLabel(type) {
    const labels = {
        'public': '공공',
        'private': '사설',
        'resort': '리조트'
    };
    return labels[type] || type;
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const pagination = document.querySelector('.pagination');

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    // 페이지 번호 업데이트
    const paginationNumbers = document.querySelector('.pagination-numbers');
    paginationNumbers.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        if (i <= 5 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => goToPage(i);
            paginationNumbers.appendChild(pageBtn);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            paginationNumbers.appendChild(dots);
        }
    }

    // 이전/다음 버튼 상태 업데이트
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    prevBtn.onclick = () => goToPage(currentPage - 1);
    nextBtn.onclick = () => goToPage(currentPage + 1);
}

// 페이지 이동
function goToPage(page) {
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderCourses();
    updatePagination();

    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 골프장 상세보기
function viewCourse(courseId) {
    // 상세 페이지로 이동
    window.location.href = `detail.html?course=${courseId}`;
}

// 티타임 예약
function bookTeeTime(courseId) {
    // 예약 페이지로 이동
    window.location.href = `detail.html?course=${courseId}&booking=true`;
}
