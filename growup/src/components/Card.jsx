import { useTheme } from '../context/ThemeContext'

const Card = ({ children, className = '', variant = 'default', onClick }) => {
  const { isDark } = useTheme()

  const variants = {
    default: isDark ? 'bg-[#121212]/80 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm',
    glass: isDark ? 'bg-[#121212]/60 backdrop-blur-md' : 'bg-white/60 backdrop-blur-md',
    gradient: isDark 
      ? 'bg-gradient-to-br from-[#121212]/80 to-[#1a1a1a]/80 backdrop-blur-sm' 
      : 'bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm',
  }

  const borderColor = isDark ? 'border-white/10' : 'border-gray-200/50'

  return (
    <div
      onClick={onClick}
      className={`rounded-xl sm:rounded-2xl border ${borderColor} p-4 sm:p-5 hover:border-emerald-500/40 hover:shadow-lg ${
        isDark ? 'hover:shadow-emerald-500/10' : 'hover:shadow-emerald-500/20'
      } transition-all duration-300 ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card