// 골프장 ID 생성 유틸리티
// 사용법: generateCourseId(1) -> "course_0001"

/**
 * 골프장 ID를 4자리 형식으로 생성
 * @param {number} number - 골프장 번호 (1부터 시작)
 * @returns {string} - "course_0001" 형식의 ID
 */
function generateCourseId(number) {
    if (number < 1 || number > 9999) {
        throw new Error('골프장 번호는 1부터 9999까지 가능합니다.');
    }

    return `course_${number.toString().padStart(4, '0')}`;
}

/**
 * 골프장 ID에서 번호 추출
 * @param {string} courseId - "course_0001" 형식의 ID
 * @returns {number} - 골프장 번호
 */
function extractCourseNumber(courseId) {
    const match = courseId.match(/^course_(\d{4})$/);
    if (!match) {
        throw new Error('유효하지 않은 골프장 ID 형식입니다.');
    }

    return parseInt(match[1], 10);
}

/**
 * 다음 골프장 ID 생성 (기존 데이터 기반)
 * @param {Array} existingCourses - 기존 골프장 목록
 * @returns {string} - 다음 골프장 ID
 */
function generateNextCourseId(existingCourses) {
    if (existingCourses.length === 0) {
        return generateCourseId(1);
    }

    const maxNumber = Math.max(
        ...existingCourses.map(course => extractCourseNumber(course.id))
    );

    return generateCourseId(maxNumber + 1);
}

module.exports = {
    generateCourseId,
    extractCourseNumber,
    generateNextCourseId
};

