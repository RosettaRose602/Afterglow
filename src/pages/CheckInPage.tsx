import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { CheckInFlow } from '@/components/checkin/CheckInFlow'
import { format } from 'date-fns'
import { Check } from 'lucide-react'

export function CheckInPage() {
  const navigate = useNavigate()
  const { checkIns } = useAppStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const alreadyDone = checkIns.some((c) => c.date === today)

  if (alreadyDone) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-safeGreen/15 flex items-center justify-center">
          <Check size={28} className="text-safeGreen" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Already checked in today</h2>
          <p className="text-sm text-textMuted mt-1">Your threshold score is up to date.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary px-10">
          Back to dashboard
        </button>
      </div>
    )
  }

  return <CheckInFlow />
}
