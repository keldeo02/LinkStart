const PLATFORMS = ['PC', 'PS5', 'Xbox', 'Switch'] as const

interface PlatformPickerProps {
  selected: string[]
  onChange: (platforms: string[]) => void
}

export function PlatformPicker({ selected, onChange }: PlatformPickerProps) {
  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((p) => p !== name))
    } else {
      onChange([...selected, name])
    }
  }

  return (
    <div className="platform-picker">
      {PLATFORMS.map((name) => (
        <label key={name} className={`platform-option ${selected.includes(name) ? 'is-active' : ''}`}>
          <input type="checkbox" checked={selected.includes(name)} onChange={() => toggle(name)} />
          {name}
        </label>
      ))}
    </div>
  )
}
