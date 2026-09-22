import { useNavigate } from 'react-router-dom'

interface RuleSection {
  icon: string
  title: string
  points: string[]
}

const SECTIONS: RuleSection[] = [
  {
    icon: '🏐',
    title: 'نظام النقاط والأشواط',
    points: [
      'كل شوط يُلعب بنظام "نقطة بكل رالي" — أي فريق يفوز بالرالي يُحتسب له نقطة، بغض النظر عمّن كان يُرسل.',
      'الفريق الذي يصل إلى 25 نقطة أولاً بفارق نقطتين على الأقل يفوز بالشوط.',
      'عند التعادل 2-2 بالأشواط، يُلعب شوط حاسم (الخامس) حتى 15 نقطة بفارق نقطتين.',
      'المباراة تُحسم لأول فريق يفوز بثلاثة أشواط.',
    ],
  },
  {
    icon: '🔄',
    title: 'نظام الدوران',
    points: [
      'يقف كل فريق في ستة مواقع مرقّمة من 1 إلى 6 داخل الملعب — الموقع 1 هو موقع الإرسال.',
      'عند اكتساب فريق حق الإرسال بعد أن كان الفريق الآخر يُرسل، يجب أن يدور لاعبوه موقعاً واحداً باتجاه عقارب الساعة قبل الإرسال التالي.',
      'الإخلال بترتيب الدوران وقت ملامسة الكرة يُعد "خطأ دوران"، وتُمنح النقطة والإرسال للفريق الآخر.',
    ],
  },
  {
    icon: '🎽',
    title: 'الليبرو',
    points: [
      'لاعب دفاعي متخصص يرتدي زياً مختلفاً عن بقية زملائه.',
      'لا يحق له الإرسال، أو إتمام هجوم كامل من أمام خط الهجوم، أو المشاركة بالحجب (البلوك).',
      'يدخل ويخرج من الملعب بحرية أكبر من التبديل العادي، لكن ضمن قواعد محدَّدة لتتابع دخوله وخروجه.',
    ],
  },
  {
    icon: '🔁',
    title: 'التبديلات',
    points: [
      'يحق لكل فريق حتى 6 تبديلات في الشوط الواحد (تبديلات الليبرو لا تُحتسب من هذا العدد).',
      'اللاعب الأساسي الذي يخرج يمكن أن يعود لموقعه الأصلي مرة واحدة فقط بنفس الشوط، وبنفس اللاعب الذي دخل بدلاً عنه.',
    ],
  },
  {
    icon: '⏱',
    title: 'التايم آوت',
    points: ['يحق لكل فريق طلب تايم آوتين بكل شوط، مدة كل واحد 30 ثانية.'],
  },
  {
    icon: '🖥',
    title: 'تحدي الفيديو (Challenge System)',
    points: [
      'نظام مراجعة فيديو يسمح لكل فريق بطلب مراجعة قرار تحكيمي عدداً محدوداً من المرات بكل شوط.',
      'إذا نجح التحدي (تغيّر القرار لصالح الفريق) لا يُخصم من رصيده؛ وإذا فشل يُخصم من عدد المحاولات المتاحة.',
    ],
  },
  {
    icon: '⚠️',
    title: 'أخطاء شائعة',
    points: [
      'لمس الشبكة أثناء اللعب.',
      '"أربع ضربات" — لمس الفريق للكرة أكثر من 3 مرات قبل إعادتها للملعب الآخر.',
      '"الحمل" — إمساك الكرة أو دفعها بدل ضربها بوضوح.',
      'تجاوز خط الوسط بالكامل تحت الشبكة أثناء اللعب.',
    ],
  },
]

interface TermDef {
  term: string
  def: string
}

const TERMS: TermDef[] = [
  { term: 'Rally', def: 'التبادل المستمر للكرة بين الفريقين حتى تُحتسب نقطة.' },
  { term: 'Ace', def: 'نقطة مباشرة من الإرسال بلا استقبال ناجح من الفريق الآخر.' },
  { term: 'Dig', def: 'الدفاع عن ضربة هجومية قادمة من الفريق المنافس.' },
  { term: 'Set', def: 'التمريرة التي تسبق الهجوم مباشرة — إعداد الكرة للاعب المهاجم.' },
  { term: 'Spike / Attack', def: 'الضربة الهجومية القوية فوق الشبكة.' },
  { term: 'Block', def: 'حجب الكرة عند الشبكة لصد هجوم الخصم.' },
  { term: 'Sideout', def: 'استعادة فريق حق الإرسال بعد فوزه بنقطة أثناء استقباله للإرسال.' },
  { term: 'Rotation fault', def: 'خطأ دوران — عدم التزام لاعبي الفريق بترتيب الدوران الصحيح وقت الإرسال.' },
]

const OFFICIAL_LINKS = [
  {
    label: 'الكتيّب الرسمي لقوانين الكرة الطائرة (2025–2028)',
    url: 'https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN-v05.pdf',
  },
  {
    label: 'مركز الأدوات والمصادر التعليمية (FIVB)',
    url: 'https://www.fivb.com/inside-fivb/education/tools-and-resources-centre/',
  },
]

export function RulesScreen() {
  const navigate = useNavigate()

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-[34px] h-[34px] rounded-[10px] bg-s2 border border-bd text-t2 flex items-center justify-center"
        >
          ←
        </button>
        <h2 className="text-[18px] font-black flex-1">📖 قوانين ومصطلحات الكرة الطائرة</h2>
      </div>

      <p className="text-[11px] text-t3 mb-3 leading-relaxed">
        ملخّص مبسّط بلغتنا يغطّي أهم القوانين المرتبطة بما يسجّله التطبيق (الدوران، النقاط، التبديل...) — للتفاصيل
        الكاملة والرسمية راجع مصادر FIVB أسفل الصفحة.
      </p>

      {SECTIONS.map((section) => (
        <div key={section.title} className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
          <div className="text-[14px] font-extrabold mb-2">
            {section.icon} {section.title}
          </div>
          <ul className="space-y-1.5">
            {section.points.map((point, i) => (
              <li key={i} className="text-[12px] text-t2 leading-relaxed flex gap-1.5">
                <span className="text-pri shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">📚 مصطلحات رسمية</div>
        {TERMS.map((t) => (
          <div key={t.term} className="flex gap-2 py-1.5 border-b border-bd last:border-b-0">
            <span className="text-[12px] font-extrabold text-pri shrink-0 min-w-[90px]" dir="ltr">
              {t.term}
            </span>
            <span className="text-[12px] text-t2">{t.def}</span>
          </div>
        ))}
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4">
        <div className="text-[14px] font-extrabold mb-3">🔗 المصادر الرسمية (FIVB)</div>
        {OFFICIAL_LINKS.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[12px] font-bold text-pri underline py-1.5"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  )
}
