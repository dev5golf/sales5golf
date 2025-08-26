// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
    // 뷰 토글 기능
    const viewBtns = document.querySelectorAll('.view-btn');
    const teeTimesGrid = document.querySelector('.tee-times-grid');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // 활성 버튼 제거
            viewBtns.forEach(b => b.classList.remove('active'));
            // 클릭된 버튼 활성화
            this.classList.add('active');

            const view = this.dataset.view;

            if (view === 'list') {
                teeTimesGrid.style.gridTemplateColumns = '1fr';
                teeTimesGrid.classList.add('list-view');
            } else {
                teeTimesGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
                teeTimesGrid.classList.remove('list-view');
            }
        });
    });

    // 필터 기능
    const filterBtn = document.querySelector('.filter-btn');
    const filterInputs = document.querySelectorAll('.filter-input, .filter-select');

    filterBtn.addEventListener('click', function () {
        // 필터링 로직 (실제로는 서버에 요청을 보내야 함)
        console.log('필터링 중...');

        // 로딩 상태 표시
        this.textContent = '검색 중...';
        this.disabled = true;

        // 시뮬레이션된 지연
        setTimeout(() => {
            this.textContent = 'Search';
            this.disabled = false;

            // 필터 결과 표시 (예시)
            showFilterResults();
        }, 1500);
    });

    // 페이지네이션 기능
    const pageNumbers = document.querySelectorAll('.page-number');
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');

    pageNumbers.forEach(page => {
        page.addEventListener('click', function () {
            // 활성 페이지 제거
            pageNumbers.forEach(p => p.classList.remove('active'));
            // 클릭된 페이지 활성화
            this.classList.add('active');

            // 페이지 변경 로직 (실제로는 서버에 요청을 보내야 함)
            console.log('페이지 변경:', this.textContent);
        });
    });

    // 예약 버튼 기능
    const bookBtns = document.querySelectorAll('.btn-book');

    bookBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.tee-time-card');
            const time = card.querySelector('.time').textContent;
            const date = card.querySelector('.date').textContent;

            // 예약 확인 다이얼로그
            if (confirm(`${date} ${time}에 예약하시겠습니까?`)) {
                // 예약 처리 로직
                this.textContent = '예약 완료!';
                this.disabled = true;
                this.style.backgroundColor = '#28a745';

                // 3초 후 원래 상태로 복원
                setTimeout(() => {
                    this.textContent = 'Book Now';
                    this.disabled = false;
                    this.style.backgroundColor = '';
                }, 3000);
            }
        });
    });

    // 상세 정보 버튼 기능
    const detailBtns = document.querySelectorAll('.btn-details');

    detailBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.tee-time-card');
            const time = card.querySelector('.time').textContent;
            const date = card.querySelector('.date').textContent;
            const price = card.querySelector('.current-price').textContent;

            // 상세 정보 표시 (실제로는 모달이나 새 페이지로 이동)
            alert(`${date} ${time}\n가격: ${price}\n\n상세 정보는 골프장에 문의하세요.`);
        });
    });

    // 저장 버튼 기능
    const saveBtns = document.querySelectorAll('.btn-outline');

    saveBtns.forEach(btn => {
        if (btn.textContent.includes('Save')) {
            btn.addEventListener('click', function () {
                if (this.textContent.includes('Save')) {
                    this.innerHTML = '<i class="fas fa-heart"></i> Saved';
                    this.style.color = '#dc3545';
                    this.style.borderColor = '#dc3545';
                } else {
                    this.innerHTML = '<i class="fas fa-heart"></i> Save';
                    this.style.color = '#007bff';
                    this.style.borderColor = '#007bff';
                }
            });
        }
    });

    // 검색 필터 실시간 업데이트
    filterInputs.forEach(input => {
        input.addEventListener('change', function () {
            // 필터 변경 시 실시간 업데이트 (선택사항)
            console.log('필터 변경:', this.name || this.type, this.value);
        });
    });

    // 날짜 선택기 초기화
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        // 기본값을 오늘 날짜로 설정
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }

    // 가격 범위 입력 검증
    const priceInputs = document.querySelectorAll('input[placeholder*="Min"], input[placeholder*="Max"]');

    priceInputs.forEach(input => {
        input.addEventListener('input', function () {
            const value = parseInt(this.value);
            if (value < 0) {
                this.value = 0;
            }
        });
    });

    // 호버 효과 개선
    const cards = document.querySelectorAll('.tee-time-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
    });

    // 스크롤 시 헤더 그림자 효과
    window.addEventListener('scroll', function () {
        const header = document.querySelector('.header');
        if (window.scrollY > 10) {
            header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
    });

    // 필터 결과 표시 함수
    function showFilterResults() {
        const resultsCount = document.querySelector('.results-count');
        const currentCount = parseInt(resultsCount.textContent.match(/\d+/)[0]);

        // 랜덤하게 결과 수 변경 (실제로는 서버 응답에 따라)
        const newCount = Math.floor(Math.random() * 20) + 5;
        resultsCount.textContent = `Showing ${newCount} tee times`;

        // 결과 애니메이션
        resultsCount.style.color = '#28a745';
        setTimeout(() => {
            resultsCount.style.color = '#6c757d';
        }, 2000);
    }

    // 키보드 네비게이션
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('btn-book')) {
                focusedElement.click();
            }
        }
    });

    // 접근성 개선
    const interactiveElements = document.querySelectorAll('button, select, input');

    interactiveElements.forEach(element => {
        if (!element.hasAttribute('aria-label')) {
            const text = element.textContent || element.placeholder || element.name;
            if (text) {
                element.setAttribute('aria-label', text);
            }
        }
    });

    console.log('GolfNow 페이지가 성공적으로 로드되었습니다!');
}); 