import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { 
  FiCalendar, 
  FiEdit2, 
  FiLock, 
  FiUnlock, 
  FiBook, 
  FiLoader, 
  FiKey, 
  FiEye, 
  FiEyeOff,
  FiChevronRight,
  FiX
} from 'react-icons/fi'
import { api } from '../services/api'

const Diary = () => {
  const { isDark } = useTheme()
  const [isLocked, setIsLocked] = useState(true)
  const [password, setPassword] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  })
  
  const hasUnlockedRef = useRef(false)

  // Theme-aware classes
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'
  const cardBg = isDark ? 'bg-[#121212]' : 'bg-white'
  const nestedBg = isDark ? 'bg-black/40' : 'bg-gray-50'
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200'
  const textPrimary = isDark ? 'text-white' : 'text-[#1d1d1f]'
  const textSecondary = isDark ? 'text-white/60' : 'text-gray-600'
  const textTertiary = isDark ? 'text-white/40' : 'text-gray-500'
  const textMuted = isDark ? 'text-white/30' : 'text-gray-400'
  const textVeryMuted = isDark ? 'text-white/20' : 'text-gray-300'
  
  const emeraldText = isDark ? 'text-emerald-400' : 'text-emerald-600'
  const emeraldBg = isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'
  const roseText = isDark ? 'text-rose-400' : 'text-rose-600'
  const roseBg = isDark ? 'bg-rose-500/10' : 'bg-rose-100'

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    
    // Check if we have a lock state in sessionStorage
    const lockState = sessionStorage.getItem('diary-lock-state')
    
    if (lockState === 'locked') {
      // User manually locked before leaving
      setIsLocked(true)
      hasUnlockedRef.current = false
      setLoading(false)
    } else if (settings.diaryLock) {
      // Diary lock is enabled in settings
      setIsLocked(true)
      hasUnlockedRef.current = false
      setLoading(false)
    } else {
      // No lock enabled
      setIsLocked(false)
      loadEntries()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
        if (settings.diaryLock && hasUnlockedRef.current) {
          setIsLocked(true)
          hasUnlockedRef.current = false
          sessionStorage.setItem('diary-lock-state', 'locked')
        }
      }
    }

    const handleBeforeUnload = () => {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
      if (settings.diaryLock && hasUnlockedRef.current) {
        sessionStorage.setItem('diary-lock-state', 'locked')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Lock when component unmounts (navigating away)
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
      if (settings.diaryLock && hasUnlockedRef.current) {
        sessionStorage.setItem('diary-lock-state', 'locked')
      }
    }
  }, [])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const data = await api.getDiaryEntries()
      setEntries(data || [])
    } catch (error) {
      console.error('Error loading diary entries:', error)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const addEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      alert('Please fill in both title and content')
      return
    }

    try {
      const entry = await api.createDiaryEntry({
        title: newEntry.title,
        content: newEntry.content,
        date: newEntry.date,
        time: newEntry.time
      })
      
      setEntries([...entries, entry])
      setShowAddModal(false)
      setNewEntry({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      })
    } catch (error) {
      console.error('Error adding diary entry:', error)
      alert('Failed to add diary entry. Please try again.')
    }
  }

  const deleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return
    try {
      await api.deleteDiaryEntry(id)
      setEntries(entries.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting diary entry:', error)
      alert('Failed to delete diary entry. Please try again.')
    }
  }

  const handleUnlock = () => {
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    if (password === settings.diaryPassword) {
      setIsLocked(false)
      hasUnlockedRef.current = true
      setPassword('')
      loadEntries()
      // Clear the lock state when unlocked
      sessionStorage.removeItem('diary-lock-state')
    } else {
      alert('Incorrect password')
    }
  }

  const handleLock = () => {
    setIsLocked(true)
    hasUnlockedRef.current = false
    // Set lock state when manually locked
    sessionStorage.setItem('diary-lock-state', 'locked')
  }

  const handleChangePassword = () => {
    setPasswordError('')
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    
    // Verify current password
    if (currentPassword !== settings.diaryPassword) {
      setPasswordError('Current password is incorrect')
      return
    }
    
    // Validate new password
    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    // Update password in settings
    const updatedSettings = {
      ...settings,
      diaryPassword: newPassword
    }
    
    localStorage.setItem('app-settings', JSON.stringify(updatedSettings))
    
    // Reset form and close modal
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowChangePasswordModal(false)
    alert('Password changed successfully!')
  }

  const handleDisableLock = () => {
    if (window.confirm('Are you sure you want to disable diary lock? All entries will be accessible without password.')) {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}')
      const updatedSettings = {
        ...settings,
        diaryLock: false,
        diaryPassword: ''
      }
      localStorage.setItem('app-settings', JSON.stringify(updatedSettings))
      setIsLocked(false)
      loadEntries()
    }
  }

  const formatDisplayDate = (entry) => {
    if (!entry.date) return 'Unknown date'
    
    const date = new Date(entry.date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    today.setHours(0, 0, 0, 0)
    yesterday.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    const timeStr = entry.time || '12:00'

    if (compareDate.getTime() === today.getTime()) {
      return `Today at ${timeStr}`
    } else if (compareDate.getTime() === yesterday.getTime()) {
      return `Yesterday at ${timeStr}`
    } else {
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
      return `${formattedDate} at ${timeStr}`
    }
  }

  if (isLocked) {
    return (
      <div className={`min-h-[80vh] ${bgColor} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8`}>
          <div className={`w-16 h-16 ${emeraldBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <FiLock className={emeraldText} size={28} />
          </div>
          <h2 className={`text-xl sm:text-2xl font-light ${textPrimary} text-center mb-2`}>Diary Locked</h2>
          <p className={`text-xs sm:text-sm ${textTertiary} text-center mb-6 sm:mb-8 font-light`}>
            Enter your password to access your private diary
          </p>
          
          <div className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <button 
              onClick={handleUnlock}
              className={`w-full py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light flex items-center justify-center gap-2 text-sm sm:text-base`}
            >
              <FiUnlock size={16} />
              Unlock Diary
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/5">
          <div className="space-y-1">
            <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${textPrimary}`}>Private Diary</h1>
            <p className={`text-xs sm:text-sm ${textTertiary} font-light`}>
              Capture your thoughts, feelings, and memories
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-xs sm:text-sm`}
            >
              <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
              <span>New Entry</span>
            </button>
            <button 
              onClick={() => setShowChangePasswordModal(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 border ${borderColor} ${textSecondary} rounded-xl hover:bg-white/5 transition font-light text-xs sm:text-sm`}
            >
              <FiKey size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Change Password</span>
              <span className="sm:hidden">Password</span>
            </button>
            <button 
              onClick={handleLock}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 border ${borderColor} ${textSecondary} rounded-xl hover:bg-white/5 transition font-light text-xs sm:text-sm`}
            >
              <FiLock size={14} className="sm:w-4 sm:h-4" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Entries Grid */}
        {entries.length === 0 ? (
          <div className={`${cardBg} border ${borderColor} rounded-2xl p-8 sm:p-12 text-center`}>
            <FiBook className={`mx-auto mb-4 ${textVeryMuted}`} size={48} />
            <h3 className={`text-lg sm:text-xl font-light ${textSecondary} mb-2`}>No entries yet</h3>
            <p className={`text-xs sm:text-sm ${textMuted} font-light mb-6`}>
              Start writing your first diary entry
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className={`px-6 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm inline-flex items-center gap-2`}
            >
              <FiEdit2 size={16} />
              Write First Entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {[...entries]
              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
              .map((entry) => (
                <div
                  key={entry.id}
                  className={`group ${cardBg} border ${borderColor} hover:border-emerald-500/30 rounded-xl p-4 sm:p-5 transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex items-center gap-2 text-[10px] sm:text-xs ${textMuted} font-light`}>
                      <FiCalendar size={10} className="sm:w-3 sm:h-3" />
                      {formatDisplayDate(entry)}
                    </div>
                  </div>
                  
                  <h3 className={`text-sm sm:text-base font-light ${textPrimary} mb-2 line-clamp-2`}>
                    {entry.title}
                  </h3>
                  
                  <p className={`text-xs sm:text-sm ${textTertiary} font-light mb-4 line-clamp-4`}>
                    {entry.content}
                  </p>
                  
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition">
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className={`text-xs ${roseText} hover:opacity-80 font-light`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Add Entry Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-light ${emeraldText}`}>New Entry</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 ${textMuted} hover:${textPrimary} transition`}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Title</label>
                  <input 
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    placeholder="Entry title"
                    autoFocus
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Date</label>
                    <input 
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                      className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Time</label>
                    <input 
                      type="time"
                      value={newEntry.time}
                      onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                      className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Your thoughts</label>
                  <textarea 
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light h-32 resize-none`}
                    placeholder="Write your thoughts, feelings, and experiences..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={addEntry}
                  className={`flex-1 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm`}
                >
                  Save Entry
                </button>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-3 border ${borderColor} ${textSecondary} rounded-xl hover:bg-white/5 transition font-light text-sm`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-light ${emeraldText}`}>Change Password</h3>
                <button
                  onClick={() => {
                    setShowChangePasswordModal(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                  }}
                  className={`p-2 ${textMuted} hover:${textPrimary} transition`}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full p-3 pr-10 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:${textPrimary}`}
                    >
                      {showCurrentPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full p-3 pr-10 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:${textPrimary}`}
                    >
                      {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full p-3 pr-10 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:${textPrimary}`}
                    >
                      {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {passwordError && (
                  <p className={`text-xs sm:text-sm ${roseText} font-light`}>{passwordError}</p>
                )}

                {/* Disable Lock Option */}
                <div className="pt-2">
                  <button
                    onClick={handleDisableLock}
                    className={`text-xs ${roseText} hover:opacity-80 transition font-light`}
                  >
                    Disable diary lock completely
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={handleChangePassword}
                  className={`flex-1 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm`}
                >
                  Change Password
                </button>
                <button 
                  onClick={() => {
                    setShowChangePasswordModal(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                  }}
                  className={`flex-1 py-3 border ${borderColor} ${textSecondary} rounded-xl hover:bg-white/5 transition font-light text-sm`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Diary