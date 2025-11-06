import { toPng } from 'html-to-image';

/**
 * DOM 요소를 정제하여 이미지 생성에 최적화된 상태로 변환
 */
export const createCleanPreviewDOM = (element: HTMLElement): HTMLElement | null => {
    if (!element) return null;

    // DOM 복제
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // 선택박스 상태 복원
    restoreSelectStates(element, clonedElement);

    // 견적서의 추가 버튼 제거
    removeAddButtons(clonedElement);

    // 테이블의 마지막 컬럼 전체 제거
    removeDeleteColumns(clonedElement);

    // 추가정보 섹션 제거 (전체 견적서 이미지에서)
    removeAdditionalInfoSection(clonedElement);

    // 체크박스 처리
    processCheckboxes(clonedElement);

    // 입력 필드를 텍스트로 변환
    convertInputsToText(clonedElement);

    // 테이블 레이아웃 최적화 (Tailwind 클래스 기반)
    optimizeTableLayout(clonedElement);

    // 텍스트 크기 1.3배 확대
    scaleTextSize(clonedElement);

    return clonedElement;
};

/**
 * 선택박스 상태 복원
 */
const restoreSelectStates = (originalElement: HTMLElement, clonedElement: HTMLElement): void => {
    const originalSelects = originalElement.querySelectorAll('select');
    const clonedSelects = clonedElement.querySelectorAll('select');

    originalSelects.forEach((originalSelect, index) => {
        const clonedSelect = clonedSelects[index] as HTMLSelectElement;
        if (clonedSelect && originalSelect instanceof HTMLSelectElement) {
            // 원본의 선택된 값을 복제본에 적용 (가장 안전한 방법)
            clonedSelect.value = originalSelect.value;
        }
    });
};

/**
 * 견적서의 추가 버튼 제거
 */
const removeAddButtons = (element: HTMLElement): void => {
    const buttons = element.querySelectorAll('button');
    buttons.forEach(button => {
        const buttonText = button.textContent?.trim() || '';
        const buttonHTML = button.innerHTML || '';

        // 추가 버튼 감지 (견적서 상단의 추가 버튼들)
        const isAddButton =
            buttonText.includes('추가') ||
            buttonText.includes('+') ||
            buttonHTML.includes('Plus') ||
            buttonHTML.includes('plus') ||
            buttonHTML.includes('add') ||
            button.className.includes('add');

        if (isAddButton) {
            button.remove();
        }
    });

    // 추가로 아이콘만 있는 추가 버튼들도 제거 (SVG 아이콘)
    const iconButtons = element.querySelectorAll('button svg');
    iconButtons.forEach(icon => {
        const button = icon.closest('button');
        if (button) {
            const buttonText = button.textContent?.trim() || '';
            const iconName = icon.getAttribute('data-lucide') ||
                icon.getAttribute('class') || '';

            // 아이콘만 있고 텍스트가 없는 추가 버튼들
            if (buttonText === '' && iconName.includes('plus')) {
                button.remove();
            }
        }
    });
};

/**
 * 테이블의 마지막 컬럼 전체 제거
 */
const removeDeleteColumns = (element: HTMLElement): void => {
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');

        // 복사 컬럼이 있는 테이블
        const headerRow = table.querySelector('tr');
        const headerCells = headerRow?.querySelectorAll('th');
        const hasCopyColumn = Array.from(headerCells || []).some(cell =>
            cell.textContent?.includes('복사')
        );

        rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells.length > 0) {
                if (hasCopyColumn) {
                    // 골프 사전결제 테이블: 마지막 2개 컬럼 제거 (복사+삭제)
                    if (cells.length >= 2) {
                        cells[cells.length - 1].remove(); // 삭제
                        cells[cells.length - 2].remove(); // 복사
                    }
                } else {
                    // 다른 테이블들: 마지막 1개 컬럼만 제거 (삭제)
                    cells[cells.length - 1].remove();
                }
            }
        });
    });
};

/**
 * 추가정보 섹션 제거 (전체 견적서 이미지에서)
 */
const removeAdditionalInfoSection = (element: HTMLElement): void => {
    const additionalInfoSection = element.querySelector('.additional-info-section');
    if (additionalInfoSection) {
        additionalInfoSection.remove();
    }
};

/**
 * 체크박스 상태를 텍스트로 변환
 */
const processCheckboxes = (element: HTMLElement): void => {
    // 포함사항 체크박스 그룹 처리
    const inclusionContainers = element.querySelectorAll('div.flex.flex-wrap.gap-2');
    inclusionContainers.forEach(container => {
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        const checkedOptions: string[] = [];

        checkboxes.forEach(checkbox => {
            const htmlCheckbox = checkbox as HTMLInputElement;
            if (htmlCheckbox.checked) {
                const label = checkbox.closest('label');
                if (label) {
                    const optionText = label.textContent?.trim() || '';
                    if (optionText) {
                        checkedOptions.push(optionText);
                    }
                }
            }
        });

        // 체크된 옵션들을 쉼표로 구분하여 표시
        if (checkedOptions.length > 0) {
            container.innerHTML = '';
            // 테이블 셀 내부인지 확인하여 가운데 정렬 적용
            const isInTableCell = container.closest('td') || container.closest('th');
            if (isInTableCell) {
                container.className = 'inline-block text-center w-full';
            } else {
                container.className = 'inline-block';
            }
            container.textContent = checkedOptions.join(', ');
        } else {
            // 체크된 옵션이 없으면 컨테이너 제거
            container.remove();
        }
    });

    // 픽업 테이블의 "동일" 체크박스, 직접입력 체크박스 제거 (체크 상태와 관계없이)
    const pickupCheckboxes = element.querySelectorAll('input[type="checkbox"]');
    pickupCheckboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label && (label.textContent?.includes('동일') ||
            label.textContent?.includes('직접입력'))) {
            // "동일", "직접입력" 체크박스가 포함된 라벨 전체 제거
            label.remove();
        }
    });

    // 예상금액 체크박스 처리
    const estimatedAmountCheckboxes = element.querySelectorAll('input[type="checkbox"]');
    estimatedAmountCheckboxes.forEach(checkbox => {
        const label = checkbox.closest('label');
        if (label && label.textContent?.includes('예상금액')) {
            const htmlCheckbox = checkbox as HTMLInputElement;
            const container = label.closest('div') || label.parentElement;
            if (container) {
                if (htmlCheckbox.checked) {
                    // 체크된 경우: "(예상금액)" 텍스트만 표시
                    container.textContent = '(예상금액)';
                    container.className = 'flex items-center justify-center text-xs';
                } else {
                    // 체크되지 않은 경우: 요소 제거
                    container.remove();
                }
            }
        }
    });

    // 다른 개별 체크박스들 처리 (포함사항이 아닌 것들)
    const otherCheckboxes = element.querySelectorAll('input[type="checkbox"]:not(div.flex.flex-wrap.gap-2 input)');
    otherCheckboxes.forEach(checkbox => {
        const htmlCheckbox = checkbox as HTMLInputElement;
        const container = checkbox.closest('div') || checkbox.parentElement;
        if (container) {
            // 예상금액 체크박스는 이미 처리했으므로 스킵
            const label = checkbox.closest('label');
            if (label && label.textContent?.includes('예상금액')) {
                return;
            }

            if (htmlCheckbox.checked) {
                // 체크된 경우: 라벨 텍스트만 표시
                const label = container.querySelector('label') || checkbox.nextElementSibling;
                if (label) {
                    container.textContent = label.textContent || '';
                    container.className = 'inline-block';
                }
            } else {
                // 체크되지 않은 경우: 요소 제거
                container.remove();
            }
        }
    });
};

/**
 * 입력 필드를 텍스트로 변환
 */
const convertInputsToText = (element: HTMLElement): void => {
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
        const htmlInput = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        let displayValue = '';

        if (input.tagName === 'SELECT') {
            const selectElement = input as HTMLSelectElement;

            const selectedOption = selectElement.options[selectElement.selectedIndex];


            // 실제 값이 선택된 경우만 표시 (value가 있고, placeholder가 아닌 경우)
            if (selectElement.value && selectElement.value.trim() !== '') {
                displayValue = selectElement.value;
            } else if (selectedOption && selectedOption.textContent &&
                !selectedOption.textContent.includes('선택') &&
                !selectedOption.textContent.includes('선택하세요')) {
                displayValue = selectedOption.textContent;
            } else {
                // placeholder 옵션이 선택된 경우 빈 값으로 처리
                displayValue = '';
            }

        } else if (input.tagName === 'INPUT') {
            const inputElement = input as HTMLInputElement;
            if (inputElement.type === 'checkbox') {
                // 체크박스는 processCheckboxes에서 처리하므로 여기서는 스킵
                return;
            } else if (inputElement.type === 'date') {
                // 날짜 입력은 그대로 표시
                displayValue = inputElement.value || '';
            } else {
                // 일반 입력 필드
                displayValue = inputElement.value || '';

                // 입력 필드에 이미 원화 표기가 있으므로 추가 처리 불필요
            }
        } else if (input.tagName === 'TEXTAREA') {
            const textareaElement = input as HTMLTextAreaElement;
            displayValue = textareaElement.value || '';
        }

        // 빈 값이면 placeholder 표시
        if (!displayValue.trim()) {
            const placeholder = input.getAttribute('placeholder');
            displayValue = placeholder ? `(${placeholder})` : '';
        }

        // textarea의 경우 줄바꿈을 HTML로 변환
        if (input.tagName === 'TEXTAREA' && displayValue.includes('\n')) {
            displayValue = displayValue.replace(/\n/g, '<br>');
        }

        const textSpan = document.createElement('span');

        // 원화 표기가 있으면 천단위 콤마 추가
        if (displayValue.includes('₩')) {
            const numericValue = displayValue.replace(/[₩,]/g, '');
            if (numericValue && !isNaN(parseInt(numericValue))) {
                const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                displayValue = `₩${formatted}`;
            }
        }

        // textarea의 경우 innerHTML 사용 (줄바꿈 태그 지원)
        if (input.tagName === 'TEXTAREA' && displayValue.includes('<br>')) {
            textSpan.innerHTML = displayValue;
        } else {
            textSpan.textContent = displayValue;
        }

        // 계약금 입력창인 경우 잔금, 합계와 같은 스타일 적용
        const isDownPayment = input.getAttribute('placeholder')?.includes('₩0') &&
            input.closest('[class*="from-purple-50"]');

        // 모든 테이블 섹션의 입력폼인지 확인 (골프, 숙박, 픽업)
        const isTableSectionInput = input.closest('table') &&
            (input.closest('td') || input.closest('th'));

        // 포함사항, 사전결제1인, 총합계 부분인지 확인
        const isSummarySection = input.closest('.bg-gradient-to-r') ||
            input.closest('.bg-gradient-to-br') ||
            input.closest('.space-y-3') ||
            input.closest('.flex.justify-between');

        // 추가선택사항 textarea인지 확인 (추가정보 섹션 내부)
        const isAdditionalInfoTextarea = input.tagName === 'TEXTAREA' &&
            input.closest('.additional-info-section');

        if (isDownPayment) {
            textSpan.textContent = displayValue;
            textSpan.className = 'text-3xl font-bold text-purple-700 py-3 inline-block';
        } else if (isAdditionalInfoTextarea) {
            // 추가선택사항 textarea는 원래 크기 유지
            textSpan.className = 'inline-block text-2xl';
        } else if (isTableSectionInput) {
            // 모든 테이블 섹션 입력폼은 가운데 정렬과 텍스트 크기 적용 (골프, 숙박, 픽업)
            textSpan.className = 'inline-block text-center w-full text-lg';
        } else if (isSummarySection) {
            // 포함사항, 사전결제1인, 총합계 부분은 가운데 정렬과 텍스트 크기 적용
            textSpan.className = 'inline-block text-center w-full text-lg';
        } else {
            // 기본 입력 필드는 텍스트 크기만 적용
            textSpan.className = 'inline-block text-xl';
        }

        input.parentNode?.replaceChild(textSpan, input);
    });
};

/**
 * 테이블 레이아웃 최적화 (Tailwind 클래스 기반)
 */
const optimizeTableLayout = (element: HTMLElement): void => {
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
        // Tailwind 클래스로 테이블 최적화
        table.classList.add('w-full', 'table-fixed');


        // 컬럼 너비를 균등하게 분배
        const rows = table.querySelectorAll('tr');
        if (rows.length > 0) {
            const firstRow = rows[0];
            const cells = firstRow.querySelectorAll('td, th');
            const cellCount = cells.length;

            // 각 셀의 너비를 균등하게 분배
            cells.forEach(cell => {
                const cellElement = cell as HTMLTableCellElement;
                cellElement.classList.add('text-center', 'whitespace-nowrap');
                // Tailwind의 grid 시스템을 활용한 균등 분배
                cellElement.style.width = `${100 / cellCount}%`;
            });
        }

        // 모든 셀에 기본 스타일 적용
        const allCells = table.querySelectorAll('td, th');
        allCells.forEach(cell => {
            const cellElement = cell as HTMLTableCellElement;
            cellElement.classList.add('px-3', 'py-2', 'align-middle');
        });
    });
};

/**
 * Tailwind 클래스에서 폰트 크기 추출
 */
const extractFontSizeFromClasses = (element: Element): string | null => {
    const className = element.className;

    // Tailwind 폰트 크기 클래스 매핑
    const fontSizeMap: { [key: string]: string } = {
        'text-xs': '0.75rem',    // 12px
        'text-sm': '0.875rem',   // 14px
        'text-base': '1rem',     // 16px
        'text-lg': '1.125rem',   // 18px
        'text-xl': '1.25rem',    // 20px
        'text-2xl': '1.5rem',    // 24px
        'text-3xl': '1.875rem',  // 30px
        'text-4xl': '2.25rem',   // 36px
        'text-5xl': '3rem',      // 48px
        'text-6xl': '3.75rem',   // 60px
        'text-7xl': '4.5rem',    // 72px
        'text-8xl': '6rem',      // 96px
        'text-9xl': '8rem',      // 128px
    };

    // 클래스에서 폰트 크기 찾기
    for (const [tailwindClass, fontSize] of Object.entries(fontSizeMap)) {
        if (className.includes(tailwindClass)) {
            console.log(`Found Tailwind class: ${tailwindClass} -> ${fontSize}`);
            return fontSize;
        }
    }

    // 부모 요소에서 폰트 크기 찾기 (상속)
    const parentElement = element.parentElement;
    if (parentElement) {
        const parentFontSize = extractFontSizeFromClasses(parentElement);
        if (parentFontSize) {
            console.log(`Inherited from parent: ${parentFontSize}`);
            return parentFontSize;
        }
    }

    return null;
};

/**
 * 텍스트 크기를 1.2배로 확대
 */
const scaleTextSize = (element: HTMLElement): void => {
    // 모든 텍스트 요소를 찾아서 크기 확대
    const textElements = element.querySelectorAll('*');

    textElements.forEach(el => {
        const htmlElement = el as HTMLElement;

        // 원화 표기가 있는 텍스트에 천단위 콤마 추가 (숫자만 있는 경우만)
        if (el.textContent && el.textContent.includes('₩')) {
            const text = el.textContent;
            // ₩ 뒤에 숫자만 있는지 확인 (한글, 영문 등이 포함된 경우 제외)
            const match = text.match(/^₩(\d+(?:,\d{3})*)$/);
            if (match) {
                const numericValue = match[1].replace(/,/g, '');
                if (numericValue && !isNaN(parseInt(numericValue))) {
                    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    el.textContent = `₩${formatted}`;
                }
            }
        }

        // 로그 출력
        console.log('Element:', el.tagName, 'Classes:', el.className, 'Text:', el.textContent?.trim().substring(0, 20));

        // Tailwind 클래스에서 폰트 크기 추출
        let fontSize = extractFontSizeFromClasses(el);

        // 폰트 크기가 없으면 기본값 사용
        if (!fontSize) {
            fontSize = '1rem';
            console.log('Using default fontSize: 1rem');
        }

        console.log('Final fontSize to process:', fontSize);

        // rem 단위인 경우 처리
        if (fontSize.includes('rem')) {
            const remValue = parseFloat(fontSize);
            const newRemValue = remValue * 1.2;
            htmlElement.style.fontSize = `${newRemValue}rem`;
            console.log('Rem scaled:', remValue, '->', newRemValue);
        }
        // px 단위인 경우 처리
        else if (fontSize.includes('px')) {
            const pxValue = parseFloat(fontSize);
            const newPxValue = pxValue * 1.2;
            htmlElement.style.fontSize = `${newPxValue}px`;
            console.log('Px scaled:', pxValue, '->', newPxValue);
        }
        else {
            console.log('Unsupported unit, applying default 1.2rem:', fontSize);
            htmlElement.style.fontSize = '1.2rem';
        }
    });
};

/**
 * 정제된 DOM을 임시로 body에 추가하고 렌더링 준비
 */
const prepareDOMForCapture = (element: HTMLElement): HTMLElement => {
    // 임시 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'absolute -left-[9999px] top-0 w-full h-auto overflow-visible -z-10 opacity-0 pointer-events-none';

    // 컨테이너에 요소 추가
    container.appendChild(element);
    document.body.appendChild(container);

    // 요소 스타일 설정
    element.classList.add('static', 'w-full', 'h-auto', 'overflow-visible');


    return container;
};

/**
 * 임시 DOM 제거
 */
const cleanupTemporaryDOM = (container: HTMLElement): void => {
    if (document.body.contains(container)) {
        document.body.removeChild(container);
    }
};

/**
 * 견적서 미리보기 이미지 생성
 */
export const generatePreviewImage = async (element: HTMLElement): Promise<string> => {
    const cleanDOM = createCleanPreviewDOM(element);
    if (!cleanDOM) {
        throw new Error('DOM 복제에 실패했습니다.');
    }

    const preparedDOM = prepareDOMForCapture(cleanDOM);

    try {
        // DOM이 제대로 렌더링될 때까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 100));

        // 컨테이너 내부의 실제 요소를 캡처
        const actualElement = preparedDOM.firstChild as HTMLElement;

        const dataUrl = await toPng(actualElement, {
            quality: 1.0,
            pixelRatio: 1,
            backgroundColor: '#ffffff',
        });

        return dataUrl;
    } finally {
        cleanupTemporaryDOM(preparedDOM);
    }
};

/**
 * 이미지 다운로드
 */
export const downloadImage = (dataUrl: string, filename: string): void => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
};

/**
 * 견적서 파일명 생성
 */
export const generateQuotationFilename = (customerName: string): string => {
    const date = new Date().toISOString().split('T')[0];
    return `견적서_${customerName || '고객'}_${date}.png`;
};

/**
 * 추가 정보 섹션 이미지 생성
 */
export const createAdditionalInfoImage = async (element: HTMLElement): Promise<string> => {
    try {
        // DOM 복제
        const clonedElement = element.cloneNode(true) as HTMLElement;

        // 버튼 컨테이너 전체 제거 (지도 링크 복사, 추가정보 이미지 저장 버튼 포함)
        const buttonContainer = clonedElement.querySelector('.flex.justify-end.gap-2');
        if (buttonContainer) {
            buttonContainer.remove();
        }

        // 입력 필드를 텍스트로 변환
        convertInputsToText(clonedElement);
        scaleTextSize(clonedElement);

        // 임시로 DOM에 추가하여 렌더링 준비
        const tempContainer = document.createElement('div');
        tempContainer.appendChild(clonedElement);
        document.body.appendChild(tempContainer);

        // 렌더링 대기
        // await new Promise(resolve => setTimeout(resolve, 100));

        // 이미지 생성
        const dataUrl = await toPng(clonedElement, {
            quality: 1,
            pixelRatio: 1,
            backgroundColor: '#ffffff',
            // width: 800,
            // height: clonedElement.scrollHeight
        });

        // 임시 컨테이너 제거
        document.body.removeChild(tempContainer);

        return dataUrl;
    } catch (error) {
        console.error('추가 정보 섹션 이미지 생성 실패:', error);
        // 임시 컨테이너가 남아있을 수 있으므로 정리
        const tempContainer = document.querySelector('div[style*="-9999px"]');
        if (tempContainer && document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
        throw error;
    }
};

/**
 * 추가 정보 섹션 파일명 생성
 */
export const generateAdditionalInfoFilename = (customerName?: string): string => {
    const date = new Date().toISOString().split('T')[0];
    return customerName ? `추가정보_${customerName}_${date}.png` : `추가정보_${date}.png`;
};