import { Outlet } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const MainLayout = () => {
  const { isDark } = useTheme()

  return (
    <div className={`flex h-screen ${isDark ? 'bg-[#0a0a0c]' : 'bg-[#f5f5f7]'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 ${
          isDark ? 'bg-[#0a0a0c]' : 'bg-[#f5f5f7]'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout