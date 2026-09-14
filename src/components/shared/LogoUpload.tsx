import { useRef } from 'react'

interface LogoUploadProps {
  value: string | null
  onChange: (dataUrl: string) => void
  size?: number
}

export function LogoUpload({ value, onChange, size = 48 }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') onChange(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-xl border-2 border-dashed border-bl bg-bg flex items-center justify-center cursor-pointer overflow-hidden text-lg"
    >
      {value ? (
        <img src={value} alt="" className="w-full h-full object-cover opacity-100" />
      ) : (
        <span className="opacity-30">+</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
