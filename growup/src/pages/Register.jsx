import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiSun, FiMoon } from 'react-icons/fi'

// Import images
import gokuBg from '../assets/goku.png'
import plantLogo from '../assets/plantlogo.png'

const Register = () => {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
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
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      // Check if backend is reachable
      const isBackendRunning = await checkBackendStatus()
      if (!isBackendRunning) {
        // Offer demo mode as fallback
        if (window.confirm('Backend server is not running. Would you like to continue with demo mode?')) {
          // Store demo user data
          localStorage.setItem('token', 'demo-token-' + Date.now())
          localStorage.setItem('user', JSON.stringify({
            username: formData.username,
            email: formData.email,
            fullName: formData.fullName,
            initials: (formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U').substring(0, 2)
          }))
          navigate('/')
          return
        } else {
          throw new Error('Backend server is not running. Please start the Spring Boot application.')
        }
      }

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.')
      }
      
      // Store token and user data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        initials: data.initials
      }))

      // Redirect to dashboard
      navigate('/')
    } catch (error) {
      console.error('Registration error:', error)
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
          <h2 className={`text-base font-light ${textSecondary} mb-0.5`}>Create Account</h2>
         <p className={`text-xs sm:text-sm font-light animate-glow-star`}
   style={{ 
     textShadow: isDark 
       ? '0 0 8px #fbbf24, 0 0 16px #fbbf24, 0 0 24px #f59e0b' 
       : '0 0 6px #fbbf24, 0 0 12px #fbbf24, 0 0 18px #f59e0b'
   }}
>
  Achieve like Star
</p>
        </div>

        <Card variant="glass" className="p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username Field */}
            <div>
              <label className={`block text-xs font-light mb-1 ${textSecondary}`}>
                Username
              </label>
              <div className="relative">
                <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={15} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${inputBg} ${inputBorder} ${inputText} ${placeholderColor} backdrop-blur-sm focus:outline-none ${focusColor} transition font-light text-sm ${
                    errors.username ? 'border-rose-500' : ''
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-rose-500 font-light">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-xs font-light mb-1 ${textSecondary}`}>
                Email
              </label>
              <div className="relative">
                <FiMail className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={15} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${inputBg} ${inputBorder} ${inputText} ${placeholderColor} backdrop-blur-sm focus:outline-none ${focusColor} transition font-light text-sm ${
                    errors.email ? 'border-rose-500' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500 font-light">{errors.email}</p>
              )}
            </div>

            {/* Full Name Field */}
            <div>
              <label className={`block text-xs font-light mb-1 ${textSecondary}`}>
                Full Name
              </label>
              <div className="relative">
                <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={15} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${inputBg} ${inputBorder} ${inputText} ${placeholderColor} backdrop-blur-sm focus:outline-none ${focusColor} transition font-light text-sm ${
                    errors.fullName ? 'border-rose-500' : ''
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-500 font-light">{errors.fullName}</p>
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
                  placeholder="Create a password"
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
              <p className={`mt-1 text-[10px] ${textTertiary} font-light`}>
                Min 6 chars with uppercase, lowercase & number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className={`block text-xs font-light mb-1 ${textSecondary}`}>
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={15} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border ${inputBg} ${inputBorder} ${inputText} ${placeholderColor} backdrop-blur-sm focus:outline-none ${focusColor} transition font-light text-sm ${
                    errors.confirmPassword ? 'border-rose-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} ${accentHover} transition`}
                >
                  {showConfirmPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-500 font-light">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                required
              />
              <label htmlFor="terms" className={`text-[10px] ${textTertiary} font-light`}>
                I agree to the{' '}
                <Link to="/terms" className={`${accentText} ${accentHover}`}>
                  Terms
                </Link>{' '}
                &{' '}
                <Link to="/privacy" className={`${accentText} ${accentHover}`}>
                  Privacy
                </Link>
              </label>
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <FiUserPlus size={15} />
                  <span>Sign Up</span>
                </>
              )}
            </button>

            {/* Login Link */}
            <p className={`text-center text-xs font-light ${textTertiary}`}>
              Already have an account?{' '}
              <Link to="/login" className={`${accentText} ${accentHover} font-medium`}>
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Register