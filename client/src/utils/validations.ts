/**
 * 전화번호 양식 검증
 * 허용되는 형식:
 * - 00-000-0000
 * - 00-0000-0000
 * - 000-000-0000
 * - 000-0000-0000
 * - 위 형식 뒤에 ~0 또는 ~00 추가 가능
 */
export function validatePhoneNumber(phone: string): boolean {
    if (!phone) return false
    
    const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}(~0{1,2})?$/
    return phoneRegex.test(phone)
}

/**
 * 전화번호 검증 에러 메시지 반환
 * 유효하면 빈 문자열, 유효하지 않으면 에러 메시지 반환
 */
export function validatePhoneNumberWithMessage(phone: string): string {
    if (!phone) return '전화번호를 입력해주세요.'
    if (!validatePhoneNumber(phone)) {
        return '전화번호 형식이 올바르지 않습니다. (예: 02-123-4567, 010-1234-5678, 02-123-4567~0)'
    }
    return ''
}

/**
 * 이메일 양식 검증
 */
export function validateEmail(email: string): boolean {
    if (!email) return false
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * 이메일 검증 에러 메시지 반환
 * 유효하면 빈 문자열, 유효하지 않으면 에러 메시지 반환
 */
export function validateEmailWithMessage(email: string): string {
    if (!email) return '이메일을 입력해주세요.'
    if (!validateEmail(email)) {
        return '이메일 형식이 올바르지 않습니다. (예: example@domain.com)'
    }
    return ''
}

/**
 * COTIS 양식 검증
 * 허용되는 형식: 000000-00-00000 (6자리-2자리-5자리)
 */
export function validateCotis(cotis: string): boolean {
    if (!cotis) return false
    
    const cotisRegex = /^\d{6}-\d{2}-\d{5}$/
    return cotisRegex.test(cotis)
}

/**
 * COTIS 검증 에러 메시지 반환
 * 유효하면 빈 문자열, 유효하지 않으면 에러 메시지 반환
 */
export function validateCotisWithMessage(cotis: string): string {
    if (!cotis) return 'COTIS를 입력해주세요.'
    if (!validateCotis(cotis)) {
        return 'COTIS 형식이 올바르지 않습니다. (예: 000000-00-00000)'
    }
    return ''
}

