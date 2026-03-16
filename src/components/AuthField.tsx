type AuthFieldProps = {
  label: string
  type: 'text' | 'email' | 'password'
  placeholder: string
}

export function AuthField({ label, type, placeholder }: AuthFieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input type={type} placeholder={placeholder} />
    </label>
  )
}
