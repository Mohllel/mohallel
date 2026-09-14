import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

export async function downloadElementAsPng(el: HTMLElement, filename: string) {
  const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#060b18' })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

interface BuildReportPdfInput {
  coverEl: HTMLElement
  playerEls: HTMLElement[]
  filename: string
}

/**
 * يبني تقرير PDF حقيقي متعدد الصفحات: كل صفحة لها حدود وترقيم مرسومان مباشرة
 * (لا تعتمد على تصوير الشاشة)، وتحمل بطاقة عالية الجودة (غلاف/لاعب) بدل صورة
 * واحدة طويلة لكامل التقرير.
 */
export async function buildAndDownloadReportPdf({ coverEl, playerEls, filename }: BuildReportPdfInput) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 28

  const drawPage = async (el: HTMLElement, pageNo: number, totalPages: number) => {
    const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#060b18' })
    const imgW = el.offsetWidth
    const imgH = el.offsetHeight
    const maxW = pageWidth - margin * 2
    const maxH = pageHeight - margin * 2 - 24
    const scale = Math.min(maxW / imgW, maxH / imgH)
    const drawW = imgW * scale
    const drawH = imgH * scale
    const x = (pageWidth - drawW) / 2

    pdf.setDrawColor(37, 58, 99)
    pdf.setLineWidth(1)
    pdf.roundedRect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin, 8, 8)

    pdf.addImage(dataUrl, 'PNG', x, margin, drawW, drawH, undefined, 'SLOW')

    pdf.setFontSize(9)
    pdf.setTextColor(140, 140, 140)
    pdf.text(`${pageNo} / ${totalPages}`, pageWidth / 2, pageHeight - margin / 2 + 3, { align: 'center' })
  }

  const totalPages = 1 + playerEls.length
  await drawPage(coverEl, 1, totalPages)
  for (let i = 0; i < playerEls.length; i++) {
    pdf.addPage()
    await drawPage(playerEls[i], i + 2, totalPages)
  }

  pdf.save(filename)
}
