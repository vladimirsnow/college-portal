export const dynamic = 'force-dynamic'

import ChangePasswordClient from './ChangePasswordClient'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ChangePasswordClient />
    </Suspense>
  )
}