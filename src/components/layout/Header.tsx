import { useNavigate } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { Logo } from '../brand/Logo'
import { IconButton } from '../shared/IconButton'
import { LiveShareButton } from './LiveShareButton'
import { ScoreBar } from './ScoreBar'
import { SetTabs } from './SetTabs'

interface HeaderProps {
  matchId: string
}

export function Header({ matchId }: HeaderProps) {
  const navigate = useNavigate()
  const match = useMatchesStore((s) => s.matches[matchId])
  const { clubName, clubLogo } = useClubStore()
  if (!match) return null

  return (
    <div className="sticky top-0 z-50 bg-bg/97 backdrop-blur-md px-3 py-2 border-b border-bd">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Logo size={28} />
          <div className="text-[15px] font-black">
            <span className="text-pri">مُحلّل</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <LiveShareButton matchId={matchId} />
          <IconButton label="الرئيسية" onClick={() => navigate('/')}>
            🏠
          </IconButton>
          <IconButton label="التقرير" onClick={() => navigate(`/match/${matchId}/report`)}>
            📊
          </IconButton>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-1.5">
        <TeamBadge logo={clubLogo} name={clubName || 'فريقك'} />
        <span className="text-[12px] font-black">{clubName || 'فريقك'}</span>
        <span className="text-[9px] text-t3">VS</span>
        <span className="text-[12px] font-black">{match.opponentName || 'فريق ب'}</span>
        <TeamBadge logo={match.opponentLogo} name={match.opponentName || 'فريق ب'} />
      </div>

      <ScoreBar matchId={matchId} />
      <SetTabs matchId={matchId} />
    </div>
  )
}

function TeamBadge({ logo, name }: { logo: string | null; name: string }) {
  return (
    <div className="w-[26px] h-[26px] rounded-full overflow-hidden border-[1.5px] border-bl flex items-center justify-center bg-s2 text-[8px] font-extrabold text-pri">
      {logo ? <img src={logo} alt={name} className="w-full h-full object-cover" /> : name.substring(0, 2)}
    </div>
  )
}
