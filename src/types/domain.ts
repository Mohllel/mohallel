export type SkillKey = 'D' | 'R' | 'P' | 'S' | 'F' | 'N' | 'B' | 'C' | 'SS'

/** 0 = ضعيف, 1 = متوسط, 2 = جيد, 3 = ممتاز */
export type Quality = 0 | 1 | 2 | 3

/** بيانات وصفية إضافية فوق مهارة الإرسال (SS) — لا تُعد مهارة مستقلة */
export type ServeType = 'normal' | 'float' | 'ace' | 'error'

export type RotationPosition = 1 | 2 | 3 | 4 | 5 | 6

export type TeamSide = 'A' | 'B'

export type PlayerPosition = 'setter' | 'hitter4' | 'hitter3' | 'hitter2' | 'libero'

export interface Player {
  id: string
  name: string
  number?: number
  photo?: string | null
  /** 'A' = لاعب النادي، 'B' = لاعب ضمن روستر منافس محفوظ (ميزة Pro) */
  teamSide: TeamSide
  position?: PlayerPosition
  /** نبذة قصيرة عن اللاعب */
  bio?: string
}

export interface Action {
  id: string
  set: number
  ts: number
  /** الفريق الذي نفّذ الإجراء — 'A' فريقك، 'B' المنافس (يتطلب روستر منافس محفوظ + Pro) */
  side: TeamSide
  playerId: string
  skill: SkillKey
  quality: Quality
  /** موقع اللاعب وقت الحدث — يُملأ تلقائياً من خريطة الملعب */
  rotationPosition?: RotationPosition
  /** فقط عند skill === 'SS' */
  serveType?: ServeType
  /** مكان سقوط الكرة في ملعب الخصم (اختياري، من خريطة الملعب) */
  zone?: number
}

export interface RotationSlot {
  position: RotationPosition
  playerId: string | null
}

export type MatchEventType = 'point' | 'timeout' | 'challenge' | 'substitution'

export interface MatchEvent {
  id: string
  ts: number
  set: number
  type: MatchEventType
  /** الفريق المعني بالحدث (من سجّلت له النقطة، من طلب التايم آوت/التحدي، فريق التبديل) */
  side: TeamSide
  /** لحدث النقطة فقط — مكان سقوط الكرة */
  zone?: number
  /** لحدث التحدي فقط */
  challengeResult?: 'won' | 'lost'
  /** لحدث التبديل فقط */
  subOutPlayerId?: string
  subInPlayerId?: string
}

export type LiveMode = 'grid' | 'quick' | 'court'
export type ReportView = 'overview' | 'player' | 'video'
export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface TrainingSession {
  id: string
  createdAt: number
  date: string
  title: string
  playerIds: string[]
  /** تكرارات المهارات المسجَّلة بالتمرين — بنفس بنية إجراء المباراة لإعادة استخدام دوال التحليل */
  reps: Action[]
}

/** بيانات مرجعية موحّدة على مستوى المنصة (جدول reference_clubs) — يديرها المطوّر، تُقرأ من كل حسابات النادي */
export interface OpponentPreset {
  id: string
  name: string
  logo: string | null
}

/** بيانات مرجعية موحّدة على مستوى المنصة (جدول reference_competitions) — يديرها المطوّر */
export interface CompetitionPreset {
  id: string
  name: string
  /** يحصر المسابقة بأندية معيّنة (مراجع OpponentPreset) — فارغة/غير معرّفة يعني بلا حصر، تظهر لأي منافس */
  eligibleOpponentIds?: string[]
}

export interface ClubColors {
  pri: string
  sec: string
}

export interface ClubProfile {
  userName: string
  clubName: string
  clubLogo: string | null
  /** صورة مرجعية للزي الرسمي — تُستخدم لتوليد صور اللاعبين بالذكاء الاصطناعي */
  jerseyPhoto: string | null
  /** صورة الغلاف الكبيرة أعلى الصفحة الرئيسية — قابلة للتغيير من الإعدادات */
  headerImage: string | null
  /** نبذة قصيرة عن النادي أو الفئة */
  bio: string
  colors: ClubColors
  /** مفتاح تطوير محلي — بلا بوابة دفع حقيقية بعد */
  isPro: boolean
  players: Player[]
  /** لاعبو كل منافس محفوظ (يُقصد بالمفتاح معرّف نادٍ مرجعي عام) — ميزة مدفوعة (Pro) */
  opponentRosters: Record<string, Player[]>
}

export interface Match {
  id: string
  createdAt: number
  date: string
  opponentName: string
  opponentLogo: string | null
  /** يربط المباراة بفريق منافس محفوظ في ClubProfile.opponentPresets — يفعّل روستر المنافس (Pro) */
  opponentPresetId: string | null
  /** يربط المباراة ببطولة محفوظة في ClubProfile.competitions */
  competitionId: string | null
  /** لاعبو النادي المشاركون بهذه المباراة (مرجع إلى ClubProfile.players) */
  playerIds: string[]
  mode: LiveMode
  set: number
  sA: number[]
  sB: number[]
  /** يُملأ تلقائياً عند اكتمال كل شوط */
  setWinners: (('A' | 'B') | null)[]
  status: MatchStatus
  act: Action[]
  /** أحداث خريطة الملعب: نقاط بالموقع، تايم آوت، تحدي، تبديل — بلا مهارة/تقييم */
  events: MatchEvent[]
  /** تشكيلة كل فريق لكل شوط، بشكل مستقل */
  rotation: Record<TeamSide, Record<number, RotationSlot[]>>
  /** الفريق المُرسِل حالياً لكل شوط — يُحدَّث تلقائياً، ويُستخدم لتدوير التشكيلة عند اكتساب الإرسال */
  servingSide?: Record<number, TeamSide | null>
  /** رابط فيديو المباراة (يوتيوب أو رابط ملف مباشر) — لربط الإجراءات بلحظاتها */
  videoUrl?: string | null
  /** اللحظة (طابع زمني) التي تقابل الثانية صفر بالفيديو — تُحسب من نقطة معايرة مرجعية */
  videoStartedAt?: number | null
  /** هل البث المباشر للنتيجة مفعَّل لهذه المباراة (يتطلب Supabase) */
  liveShareEnabled?: boolean
}
