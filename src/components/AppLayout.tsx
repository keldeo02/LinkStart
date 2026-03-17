import { Outlet } from 'react-router-dom'
import { MainNavbar } from './MainNavbar'

export function AppLayout() {
  return (
    <>
      <MainNavbar />
      <div className="page-wrap">
        <Outlet />
      </div>
    </>
  )
}
