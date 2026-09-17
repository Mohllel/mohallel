import { useRef, useState } from 'react'
import { VolleyballBanner } from '../home/VolleyballBanner'
import { uploadImage } from '../../lib/storage'

interface HeaderImageUploadProps {
  value: string | null
  onChange: (url: string) => void
  onClear: () => void
}

export function HeaderImageUpload({ value, onChange, onClear }: HeaderImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      if (typeof e.target?.result !== 'string') return
      setUploading(true)
      try {
        const url = await uploadImage('header', e.target.result)
        onChange(url)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'فشل رفع الصورة')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-32 border border-bd overflow-hidden cursor-pointer bg-s2"
      >
        {uploading ? (
          <div className="w-full h-full flex items-center justify-center text-[12px] animate-pulse">
            جارٍ الرفع...
          </div>
        ) : value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <VolleyballBanner />
        )}
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
