import { useRef } from 'react'
import { VolleyballBanner } from '../home/VolleyballBanner'

interface HeaderImageUploadProps {
  value: string | null
  onChange: (dataUrl: string) => void
  onClear: () => void
}

export function HeaderImageUpload({ value, onChange, onClear }: HeaderImageUploadProps) {
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
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-32 border border-bd overflow-hidden cursor-pointer bg-s2"
      >
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <VolleyballBanner />}
        <div className="absolute inset-0 bg-bg/0 hover:bg-bg/30 transition-colors flex items-center justify-center">
          <span className="text-white text-[11px] font-extrabold bg-black/40 px-2 py-1">✎ تغيير الصورة</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {value && (
        <button onClick={onClear} className="mt-1.5 text-[10px] font-bold text-err">
          إزالة الصورة والعودة للافتراضية
        </button>
      )}
    </div>
  )
}
