import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { Button } from 'primereact/button'

// 한글 텍스트를 글자 단위로 분리하여 양쪽 정렬하는 헬퍼 함수
const justifyText = (text: string) => {
    return text.split('').join(' ')
}

export interface FormField {
    label: string
    input: ReactNode
    id?: string
    defaultValue?: string | number | boolean // 각 필드의 기본값 (수정용 폼에서 사용)
}

export interface FormBasicProps {
    fields: FormField[]
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    submitButton?: {
        label?: string
        icon?: string
        loading?: boolean
        disabled?: boolean
    }
}

/**
 * FormBasic 컴포넌트 사용 예시:
 * 
 * // 신규 등록용
 * const fields: FormField[] = [
 *   {
 *     label: '단지 이름',
 *     id: 'name',
 *     input: <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} />
 *   }
 * ]
 * 
 * // 수정용 (초기값 설정)
 * const fields: FormField[] = [
 *   {
 *     label: '단지 이름',
 *     id: 'name',
 *     defaultValue: complexData?.name, // 수정 전 내용
 *     input: <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} />
 *   }
 * ]
 * 
 * <FormBasic 
 *   fields={fields}
 *   onSubmit={handleSubmit}
 *   initialValues={{ name: complexData?.name, address: complexData?.address }} // 또는 initialValues 사용
 *   submitButton={{ label: '수정', loading: loading }}
 * />
 */

export default function FormBasic({ 
    fields, 
    onSubmit, 
    submitButton = {
        label: '제출',
        icon: 'pi pi-check',
        loading: false,
        disabled: false,
    },
}: FormBasicProps) {
    return (
        <form onSubmit={onSubmit} {...stylex.props(styles.form)}>
            {fields.map((field, index) => (
                <div key={field.id || index} {...stylex.props(styles.formField)}>
                    <label 
                        htmlFor={field.id || `field-${index}`} 
                        {...stylex.props(styles.label)}
                    >
                        {justifyText(field.label)}
                    </label>
                    <div {...stylex.props(styles.inputWrapper)}>
                        {field.input}
                    </div>
                </div>
            ))}
            <div {...stylex.props(styles.buttonWrapper)}>
                <Button 
                    type="submit" 
                    label={submitButton.label} 
                    icon={submitButton.icon}
                    loading={submitButton.loading} 
                    disabled={submitButton.disabled} 
                />
            </div>
        </form>
    )
}

const styles = stylex.create({
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '600px',
    },
    formField: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
    },
    label: {
        fontWeight: 500,
        color: '#333',
        fontSize: '0.9rem',
        minWidth: '120px',
        textAlign: 'justify',
        textAlignLast: 'justify',
    },
    inputWrapper: {
        flex: 1,
        maxWidth: 'none',
        width: '100%',
    },
    buttonWrapper: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1rem',
    },
})
