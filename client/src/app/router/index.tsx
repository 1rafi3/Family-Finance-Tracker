import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Placeholder } from '@components/common/Placeholder'
import { AppLayout } from '@components/layout/AppLayout'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Placeholder title="Dashboard" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
