import { useEffect, useState } from 'react'
import { fetchClientErrors, type ClientErrorRow } from '../../lib/adminApi'

function shortDateTime(iso: string): string {
  return iso.replace('T', ' ').slice(0, 16)
}

export function AdminLogTab() {
  const [errors, setErrors] = useState<ClientErrorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetchClientErrors()
      .then(setErrors)
      .catch((e) => setError(e instanceof Error ? e.message : 'فشل تحميل السجلّ'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحميل...</p>
  if (error) return <p className="text-center text-err text-[13px] mt-10">{error}</p>

  return (
    <div className="bg-s1 border border-bd p-4">
      <div className="text-[14px] font-extrabold mb-3">📜 آخر أخطاء المستخدمين ({errors.length})</div>
      {errors.length === 0 && <p className="text-center text-t3 text-[13px] mt-6">لا أخطاء مسجَّلة — بيانات نظيفة.</p>}
      {errors.map((e) => (
        <div key={e.id} className="py-2 border-b border-bg last:border-b-0">
          <button
            onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            className="w-full text-right"
          >
            <div className="text-[12px] font-bold text-err truncate" dir="ltr">
              {e.message}
            </div>
            <div className="text-[10px] text-t3 mt-0.5">{shortDateTime(e.created_at)}</div>
          </button>
          {expanded === e.id && (
            <div className="mt-1.5 text-[10px] text-t3 bg-bg border border-bd rounded-lg p-2 break-all" dir="ltr">
              {e.url && <div className="mb-1">url: {e.url}</div>}
              {e.stack && <pre className="whitespace-pre-wrap">{e.stack}</pre>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
