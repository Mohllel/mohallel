import { useRef, useState } from 'react'
import { uploadImage } from '../../lib/storage'

interface LogoUploadProps {
  value: string | null
  onChange: (url: string) => void
  /** المسار داخل مخزن الصور — فريد لكل غرض (مثال: 'club-logo', `opponents/${presetId}`) */
  path: string
  size?: number
}

export function LogoUpload({ value, onChange, path, size = 48 }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      if (typeof e.target?.result !== 'string') return
      setUploading(true)
      try {
        const url = await uploadImage(path, e.target.result)
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
    <div
      onClick={() => inputRef.current?.click()}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-xl border-2 border-dashed border-bl bg-bg flex items-center justify-center cursor-pointer overflow-hidden text-lg"
    >
      {uploading ? (
        <span className="text-[10px] animate-pulse">...</span>
      ) : value ? (
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
