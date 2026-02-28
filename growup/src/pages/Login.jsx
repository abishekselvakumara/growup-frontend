import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi'

// Import images
import gokuBg from '../assets/goku.png'
import plantLogo from '../assets/plantlogo.png'

const Login = () => {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  // Theme-aware classes
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'
  const textPrimary = isDark ? 'text-white' : 'text-[#1d1d1f]'
  const textSecondary = isDark ? 'text-white/70' : 'text-gray-700'
  const textTertiary = isDark ? 'text-white/50' : 'text-gray-500'
  const textMuted = isDark ? 'text-white/40' : 'text-gray-400'
  
  // Input styling
  const inputBg = isDark ? 'bg-black/40' : 'bg-white/40'
  const inputBorder = isDark ? 'border-white/10' : 'border-gray-200/50'
  const inputText = isDark ? 'text-white' : 'text-gray-900'
  const placeholderColor = isDark ? 'placeholder:text-white/30' : 'placeholder:text-gray-500'
  
  // Button and accent colors
  const buttonGradient = 'from-emerald-500 to-teal-500'
  const focusColor = 'focus:border-emerald-500'
  const accentText = 'text-emerald-500'
  const accentHover = 'hover:text-emerald-600'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    return newErrors
  }

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/test', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const isBackendRunning = await checkBackendStatus()
      if (!isBackendRunning) {
        throw new Error('Unable to connect to server. Please make sure the backend is running.')
      }

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.')
      }
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        initials: data.initials
      }))

      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ 
        form: error.message || 'Unable to connect to server. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden`}>
      {/* Goku Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 mix-blend-multiply"></div>
        <img 
          src={gokuBg} 
          alt=""
          className="w-full h-full object-cover object-center opacity-[0.08] dark:opacity-[0.06] scale-105"
          style={{
            filter: 'grayscale(0.2) contrast(1.1)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-3 rounded-xl transition-all duration-200 z-20 backdrop-blur-md ${
          isDark 
            ? 'bg-white/10 text-emerald-400 hover:bg-white/15' 
            : 'bg-black/5 text-gray-700 hover:bg-black/10'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src={plantLogo} 
              alt="growup+" 
              className="w-7 h-7 object-contain"
              style={{ 
                filter: isDark ? 'brightness(1.2) contrast(1.1)' : 'none'
              }}
            />
            <span className={`text-3xl font-light tracking-tight ${textPrimary}`}>growup+</span>
          </div>
          <h2 className={`text-base font-light ${textSecondary} mb-0.5`}>Welcome Back</h2>
        <p className={`text-sm sm:text-base font-light animate-glow-red`}
   style={{ 
     textShadow: isDark 
       ? '0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444' 
       : '0 0 8px #ef4444, 0 0 16px #ef4444, 0 0 24px #ef4444'
   }}
>
  Grow like Plant
</p>
        </div>

        <Card variant="glass" className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className={`block text-xs font-light mb-1 ${textSecondary}`}>
                Email or username
              </label>
              <div className="relative">
                <FiMail className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={15} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="abijeeva2005@gmail.com"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${inputBg} ${inputBorder} ${inputText} ${placeholderColor} backdrop-blur-sm focus:outline-none ${focusColor} transition font-light text-sm ${
                    errors.username ? 'border-rose-500' : ''
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-rose-500 font-light">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-xs font-light mb-1 ${textSecondary}`}>
                Password
              </label>
              <div className="relative">
                <FiLock className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border ${inputBg} ${inputBorder} ${inputText} ${placeholderColor} backdrop-blur-sm focus:outline-none ${focusColor} transition font-light text-sm ${
                    errors.password ? 'border-rose-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} ${accentHover} transition`}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 font-light">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <span className={`text-xs font-light ${textTertiary}`}>Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className={`text-xs font-light hover:text-emerald-500 transition ${textTertiary}`}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {errors.form && (
              <div className="p-2.5 bg-rose-500/10 backdrop-blur-sm border border-rose-500/50 rounded-xl">
                <p className="text-xs text-rose-500 text-center font-light">{errors.form}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 bg-gradient-to-r ${buttonGradient} text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-light text-sm shadow-lg shadow-emerald-500/20`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <FiLogIn size={15} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Register Link */}
            <p className={`text-center text-xs font-light ${textTertiary}`}>
              Don't have an account?{' '}
              <Link to="/register" className={`${accentText} ${accentHover} font-medium`}>
                Sign up
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Login