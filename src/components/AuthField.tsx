import type { ChangeEventHandler } from 'react'

type AuthFieldProps = {
  label: string
  type: 'text' | 'email' | 'password'
  placeholder: string
  name: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  autoComplete?: string
}

export function AuthField({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
  autoComplete,
}: AuthFieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </label>
  )
}
