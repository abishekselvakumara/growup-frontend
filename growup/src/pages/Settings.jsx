import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import ShareSettingsCard from '../components/ShareSettingsCard'
import { useNavigate } from 'react-router-dom'
import { 
  FiSun, 
  FiMoon, 
  FiBell, 
  FiLock, 
  FiDatabase,
  FiDownload,
  FiUpload,
  FiUser,
  FiGithub,
  FiLinkedin,
  FiInstagram,
  FiFacebook,
  FiYoutube,
  FiKey,
  FiLink,
  FiAlertCircle,
  FiEdit,
  FiLogOut,
  FiLoader,
  FiChevronRight,
  FiX,
  FiCamera,
  FiMail,
  FiCalendar,
  FiAward,
  FiMapPin,
  FiLink2
} from 'react-icons/fi'
import { SiLeetcode, SiSnapchat } from 'react-icons/si'
// Remove api import since we're using localStorage only
// import { api } from '../services/api'

const Settings = () => {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  // User profile state - SEPARATE from plant data
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    username: '',
    initials: '',
    profilePicture: null,
    joinDate: '',
    bio: '',
    location: '',
    website: ''
  })

  const [settings, setSettings] = useState({
    notifications: true,
    weeklyReports: true,
    diaryLock: false,
    diaryPassword: '',
    language: 'English',
    autoBackup: true,
    theme: 'dark',
    showEmail: true,
    showJoinDate: true
  })

  // API Credentials State
  const [apiCredentials, setApiCredentials] = useState({
    github: { username: '', token: '', connected: false },
    leetcode: { username: '', connected: false },
    youtube: { channelId: '', apiKey: '', connected: false },
    linkedin: { clientId: '', clientSecret: '', companyId: '', accessToken: '', connected: false },
    instagram: { accessToken: '', businessId: '', connected: false },
    facebook: { pageId: '', accessToken: '', connected: false },
    snapchat: { note: 'Snapchat does not provide public API access' }
  })

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showApiGuide, setShowApiGuide] = useState(false)
  
  // Profile picture state - SEPARATE
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

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
    loadData()
    loadUserProfile()
  }, [])

  const loadUserProfile = () => {
    // Load user data from localStorage (from login/register)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    // Load profile picture from SEPARATE storage key
    const savedProfilePic = localStorage.getItem(`profilePicture_${user.username}`)
    
    // Load profile info from SEPARATE storage
    const savedProfileInfo = localStorage.getItem(`profileInfo_${user.username}`)
    let profileInfo = {}
    if (savedProfileInfo) {
      profileInfo = JSON.parse(savedProfileInfo)
    }
    
    setUserProfile({
      fullName: user.fullName || '',
      email: user.email || '',
      username: user.username || '',
      initials: user.initials || '',
      profilePicture: savedProfilePic || null,
      joinDate: profileInfo.joinDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      bio: profileInfo.bio || '',
      location: profileInfo.location || '',
      website: profileInfo.website || ''
    })

    if (savedProfilePic) {
      setImagePreview(savedProfilePic)
    }
  }

  const saveProfileInfo = (updatedInfo) => {
    if (!userProfile.username) return
    
    // Save to SEPARATE storage
    const profileKey = `profileInfo_${userProfile.username}`
    localStorage.setItem(profileKey, JSON.stringify({
      bio: updatedInfo.bio,
      location: updatedInfo.location,
      website: updatedInfo.website,
      joinDate: updatedInfo.joinDate
    }))
    
    // Also update user object in localStorage (but keep profile pic separate)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    user.bio = updatedInfo.bio
    user.location = updatedInfo.location
    user.website = updatedInfo.website
    localStorage.setItem('user', JSON.stringify(user))
  }

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setImagePreview(base64String)
        setProfileImage(file)
        
        // Save to SEPARATE storage - profile picture only
        if (userProfile.username) {
          localStorage.setItem(`profilePicture_${userProfile.username}`, base64String)
          
          // Trigger storage event for navbar to update
          window.dispatchEvent(new StorageEvent('storage', {
            key: `profilePicture_${userProfile.username}`,
            newValue: base64String
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfileImage = () => {
    setImagePreview(null)
    setProfileImage(null)
    
    if (userProfile.username) {
      localStorage.removeItem(`profilePicture_${userProfile.username}`)
      
      // Trigger storage event for navbar to update
      window.dispatchEvent(new StorageEvent('storage', {
        key: `profilePicture_${userProfile.username}`,
        newValue: null
      }))
    }
  }

  const updateProfileInfo = (field, value) => {
    const updated = { ...userProfile, [field]: value }
    setUserProfile(updated)
    saveProfileInfo(updated)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Load settings from localStorage only (no backend calls)
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      // Load API credentials from localStorage only
      const savedCredentials = localStorage.getItem('api-credentials')
      if (savedCredentials) {
        const parsed = JSON.parse(savedCredentials)
        setApiCredentials({
          github: { username: '', token: '', connected: false, ...parsed.github },
          leetcode: { username: '', connected: false, ...parsed.leetcode },
          youtube: { channelId: '', apiKey: '', connected: false, ...parsed.youtube },
          linkedin: { clientId: '', clientSecret: '', companyId: '', accessToken: '', connected: false, ...parsed.linkedin },
          instagram: { accessToken: '', businessId: '', connected: false, ...parsed.instagram },
          facebook: { pageId: '', accessToken: '', connected: false, ...parsed.facebook },
          snapchat: { note: 'Snapchat does not provide public API access', ...parsed.snapchat }
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings) => {
    // Save to localStorage only (no backend)
    localStorage.setItem('app-settings', JSON.stringify(newSettings))
    setSettings(newSettings)
  }

  const saveApiCredentials = async (newCredentials) => {
    // Save to localStorage only (no backend)
    localStorage.setItem('api-credentials', JSON.stringify(newCredentials))
    setApiCredentials(newCredentials)
  }

  const handleToggle = (key) => {
    saveSettings({ ...settings, [key]: !settings[key] })
  }

  const handleSetDiaryPassword = () => {
    if (passwordInput === confirmPassword && passwordInput.length >= 4) {
      saveSettings({ 
        ...settings, 
        diaryLock: true, 
        diaryPassword: passwordInput 
      })
      setShowPasswordModal(false)
      setPasswordInput('')
      setConfirmPassword('')
    }
  }

  const updateCredential = (platform, field, value) => {
    const updated = {
      ...apiCredentials,
      [platform]: { 
        ...apiCredentials[platform], 
        [field]: value 
      }
    }
    saveApiCredentials(updated)
  }

  const toggleConnection = (platform) => {
    const updated = {
      ...apiCredentials,
      [platform]: { 
        ...apiCredentials[platform], 
        connected: !apiCredentials[platform]?.connected 
      }
    }
    saveApiCredentials(updated)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('api-credentials')
    localStorage.removeItem('app-settings')
    // Don't remove profile pictures - they should persist
    navigate('/login')
  }

  const handleExportData = () => {
    const data = {
      settings,
      apiCredentials,
      userProfile: {
        ...userProfile,
        profilePicture: imagePreview // Include profile pic in export
      },
      notes: JSON.parse(localStorage.getItem('notes') || '[]'),
      events: JSON.parse(localStorage.getItem('events') || '[]'),
      finance: JSON.parse(localStorage.getItem('finance') || '[]'),
      diary: JSON.parse(localStorage.getItem('diary-entries') || '[]'),
      plantData: localStorage.getItem('plantData') // Plant data separate
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `growth-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.settings) {
            setSettings(data.settings)
            localStorage.setItem('app-settings', JSON.stringify(data.settings))
          }
          if (data.apiCredentials) {
            setApiCredentials(data.apiCredentials)
            localStorage.setItem('api-credentials', JSON.stringify(data.apiCredentials))
          }
          if (data.userProfile && data.userProfile.username) {
            // Restore profile picture
            if (data.userProfile.profilePicture) {
              localStorage.setItem(`profilePicture_${data.userProfile.username}`, data.userProfile.profilePicture)
              setImagePreview(data.userProfile.profilePicture)
            }
            // Restore profile info
            localStorage.setItem(`profileInfo_${data.userProfile.username}`, JSON.stringify({
              bio: data.userProfile.bio,
              location: data.userProfile.location,
              website: data.userProfile.website,
              joinDate: data.userProfile.joinDate
            }))
          }
          if (data.notes) localStorage.setItem('notes', JSON.stringify(data.notes))
          if (data.events) localStorage.setItem('events', JSON.stringify(data.events))
          if (data.finance) localStorage.setItem('finance', JSON.stringify(data.finance))
          if (data.diary) localStorage.setItem('diary-entries', JSON.stringify(data.diary))
          if (data.plantData) localStorage.setItem('plantData', data.plantData)
          
          alert('Data imported successfully!')
          loadUserProfile() // Reload profile
        } catch (error) {
          alert('Invalid backup file')
        }
      }
      reader.readAsText(file)
    }
  }

  const getCredential = (platform, field, defaultValue = '') => {
    return apiCredentials[platform]?.[field] ?? defaultValue
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
            <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${textPrimary}`}>Settings</h1>
            <p className={`text-xs sm:text-sm ${textTertiary} font-light`}>
              Configure your app, profile, and connected accounts
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleExportData}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 border ${borderColor} ${textSecondary} rounded-xl hover:bg-white/5 transition font-light text-xs sm:text-sm`}
            >
              <FiDownload size={14} className="sm:w-4 sm:h-4" />
              <span>Export</span>
            </button>
            <label className={`flex items-center gap-2 px-3 sm:px-4 py-2 border ${borderColor} ${textSecondary} rounded-xl hover:bg-white/5 transition cursor-pointer font-light text-xs sm:text-sm`}>
              <FiUpload size={14} className="sm:w-4 sm:h-4" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          
          {/* PROFILE SECTION */}
          <div className={`lg:col-span-2 ${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-4 flex items-center gap-2`}>
              <FiUser className={emeraldText} size={16} />
              PROFILE
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 ${borderColor} ${cardBg} flex items-center justify-center`}>
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-3xl font-light bg-gradient-to-br from-emerald-500 to-teal-500 text-white`}>
                        {userProfile.initials || 'U'}
                      </div>
                    )}
                  </div>
                  
                  <label className={`absolute -bottom-2 -right-2 p-2 rounded-xl ${cardBg} border ${borderColor} cursor-pointer hover:border-emerald-500/30 transition`}>
                    <FiCamera size={16} className={textSecondary} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfileImageChange}
                    />
                  </label>
                  
                  {imagePreview && (
                    <button 
                      onClick={removeProfileImage}
                      className={`absolute -top-2 -right-2 p-1.5 rounded-full ${roseBg} ${roseText} border ${borderColor} hover:opacity-80 transition`}
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
                <p className={`text-[10px] ${textVeryMuted} font-light`}>Click camera to upload</p>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1 font-light`}>Full Name</label>
                    <p className={`text-sm ${textPrimary} font-light p-2 ${nestedBg} border ${borderColor} rounded-lg`}>
                      {userProfile.fullName}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1 font-light`}>Username</label>
                    <p className={`text-sm ${textPrimary} font-light p-2 ${nestedBg} border ${borderColor} rounded-lg`}>
                      @{userProfile.username}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1 font-light`}>Email</label>
                    <p className={`text-sm ${textPrimary} font-light p-2 ${nestedBg} border ${borderColor} rounded-lg`}>
                      {userProfile.email}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1 font-light`}>Member Since</label>
                    <p className={`text-sm ${textPrimary} font-light p-2 ${nestedBg} border ${borderColor} rounded-lg`}>
                      {userProfile.joinDate}
                    </p>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1 font-light`}>Bio</label>
                    <textarea
                      value={userProfile.bio}
                      onChange={(e) => updateProfileInfo('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      className={`w-full p-2 ${nestedBg} border ${borderColor} rounded-lg text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light resize-none h-20`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs ${textTertiary} mb-1 font-light flex items-center gap-1`}>
                        <FiMapPin size={12} /> Location
                      </label>
                      <input
                        type="text"
                        value={userProfile.location}
                        onChange={(e) => updateProfileInfo('location', e.target.value)}
                        placeholder="City, Country"
                        className={`w-full p-2 ${nestedBg} border ${borderColor} rounded-lg text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${textTertiary} mb-1 font-light flex items-center gap-1`}>
                        <FiLink2 size={12} /> Website
                      </label>
                      <input
                        type="url"
                        value={userProfile.website}
                        onChange={(e) => updateProfileInfo('website', e.target.value)}
                        placeholder="https://..."
                        className={`w-full p-2 ${nestedBg} border ${borderColor} rounded-lg text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHARE PROFILE SECTION */}
          <ShareSettingsCard userProfile={userProfile} />

          {/* Appearance */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-3 sm:mb-4 flex items-center gap-2`}>
              <FiSun className={emeraldText} size={16} />
              APPEARANCE
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className={`text-xs sm:text-sm font-light ${textSecondary}`}>Theme</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (isDark) toggleTheme()
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-light transition ${
                      !isDark 
                        ? `${emeraldBg} ${emeraldText}` 
                        : `${nestedBg} ${textMuted} hover:${textSecondary}`
                    }`}
                  >
                    <FiSun size={12} className="inline mr-1" />
                    Light
                  </button>
                  <button 
                    onClick={() => {
                      if (!isDark) toggleTheme()
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-light transition ${
                      isDark 
                        ? `${emeraldBg} ${emeraldText}` 
                        : `${nestedBg} ${textMuted} hover:${textSecondary}`
                    }`}
                  >
                    <FiMoon size={12} className="inline mr-1" />
                    Dark
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className={`text-xs sm:text-sm font-light ${textSecondary}`}>Language</span>
                <select 
                  value={settings.language}
                  onChange={(e) => saveSettings({ ...settings, language: e.target.value })}
                  className={`px-3 py-1.5 ${nestedBg} border ${borderColor} rounded-lg text-xs sm:text-sm ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-3 sm:mb-4 flex items-center gap-2`}>
              <FiBell className={emeraldText} size={16} />
              NOTIFICATIONS
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm font-light ${textSecondary}`}>Push Notifications</span>
                <button
                  onClick={() => handleToggle('notifications')}
                  className={`w-12 h-6 rounded-full transition relative ${
                    settings.notifications ? 'bg-emerald-500' : `${nestedBg}`
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                    settings.notifications ? 'left-7' : 'left-1'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm font-light ${textSecondary}`}>Weekly Reports</span>
                <button
                  onClick={() => handleToggle('weeklyReports')}
                  className={`w-12 h-6 rounded-full transition relative ${
                    settings.weeklyReports ? 'bg-emerald-500' : `${nestedBg}`
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                    settings.weeklyReports ? 'left-7' : 'left-1'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-3 sm:mb-4 flex items-center gap-2`}>
              <FiLock className={emeraldText} size={16} />
              SECURITY
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className={`text-xs sm:text-sm font-light ${textSecondary}`}>Diary Lock</span>
                  <p className={`text-[10px] sm:text-xs ${textVeryMuted} font-light mt-1`}>Password protect your diary</p>
                </div>
                {settings.diaryLock ? (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className={`px-3 py-1.5 ${emeraldBg} ${emeraldText} rounded-lg text-xs sm:text-sm font-light hover:opacity-80 transition whitespace-nowrap`}
                  >
                    Change
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className={`px-3 py-1.5 border ${borderColor} ${textSecondary} rounded-lg text-xs sm:text-sm font-light hover:bg-white/5 transition whitespace-nowrap`}
                  >
                    Enable
                  </button>
                )}
              </div>
              
              {/* Profile Visibility Settings */}
              <div className="pt-2 border-t border-white/5">
                <p className={`text-[10px] sm:text-xs ${textTertiary} mb-2 font-light`}>Profile Visibility</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-light ${textSecondary}`}>Show Email</span>
                    <button
                      onClick={() => handleToggle('showEmail')}
                      className={`w-10 h-5 rounded-full transition relative ${
                        settings.showEmail ? 'bg-emerald-500' : `${nestedBg}`
                      }`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${
                        settings.showEmail ? 'left-6' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-light ${textSecondary}`}>Show Join Date</span>
                    <button
                      onClick={() => handleToggle('showJoinDate')}
                      className={`w-10 h-5 rounded-full transition relative ${
                        settings.showJoinDate ? 'bg-emerald-500' : `${nestedBg}`
                      }`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${
                        settings.showJoinDate ? 'left-6' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-3 sm:mb-4 flex items-center gap-2`}>
              <FiDatabase className={emeraldText} size={16} />
              DATA
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm font-light ${textSecondary}`}>Auto Backup</span>
                <button
                  onClick={() => handleToggle('autoBackup')}
                  className={`w-12 h-6 rounded-full transition relative ${
                    settings.autoBackup ? 'bg-emerald-500' : `${nestedBg}`
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                    settings.autoBackup ? 'left-7' : 'left-1'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* API Connections */}
          <div className={`lg:col-span-2 ${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
              <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider flex items-center gap-2`}>
                <FiKey className={emeraldText} size={16} />
                API CONNECTIONS
              </h3>
              <button
                onClick={() => setShowApiGuide(!showApiGuide)}
                className={`text-[10px] sm:text-xs ${textMuted} hover:text-emerald-500 transition font-light`}
              >
                {showApiGuide ? 'Hide Guide' : 'Show Guide'}
              </button>
            </div>

            {showApiGuide && (
              <div className={`mb-4 sm:mb-6 p-3 sm:p-4 ${nestedBg} border ${borderColor} rounded-xl`}>
                <h4 className={`text-[10px] sm:text-xs font-light ${textSecondary} mb-2`}>API Access Guide</h4>
                <ul className="space-y-1 text-[10px] sm:text-xs font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><span className={textSecondary}>GitHub:</span> Public API - just enter username</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span><span className={textSecondary}>LeetCode:</span> Working via public API</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">⚠️</span>
                    <span><span className={textSecondary}>LinkedIn/Instagram/Facebook:</span> Manual only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400">✗</span>
                    <span><span className={textSecondary}>Snapchat:</span> No API - manual only</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* GitHub */}
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FiGithub className={textSecondary} size={16} />
                  <span className={`text-xs sm:text-sm font-light ${textPrimary}`}>GitHub</span>
                  <span className={`ml-auto text-[8px] px-2 py-0.5 ${emeraldBg} ${emeraldText} rounded-full`}>API</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Username"
                    value={getCredential('github', 'username')}
                    onChange={(e) => updateCredential('github', 'username', e.target.value)}
                    className={`w-full p-2 ${nestedBg} border ${borderColor} rounded-lg text-xs ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                  />
                  <button
                    onClick={() => toggleConnection('github')}
                    className={`w-full py-1.5 sm:py-2 text-xs rounded-lg transition font-light ${
                      apiCredentials.github?.connected
                        ? `${emeraldBg} ${emeraldText} hover:opacity-80`
                        : `${nestedBg} ${textSecondary} hover:bg-white/5`
                    }`}
                  >
                    {apiCredentials.github?.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>

              {/* LeetCode */}
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <SiLeetcode className="text-[#ffa116]" size={16} />
                  <span className={`text-xs sm:text-sm font-light ${textPrimary}`}>LeetCode</span>
                  <span className={`ml-auto text-[8px] px-2 py-0.5 ${emeraldBg} ${emeraldText} rounded-full`}>API</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Username"
                    value={getCredential('leetcode', 'username')}
                    onChange={(e) => updateCredential('leetcode', 'username', e.target.value)}
                    className={`w-full p-2 ${nestedBg} border ${borderColor} rounded-lg text-xs ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                  />
                  <button
                    onClick={() => toggleConnection('leetcode')}
                    className={`w-full py-1.5 sm:py-2 text-xs rounded-lg transition font-light ${
                      apiCredentials.leetcode?.connected
                        ? `${emeraldBg} ${emeraldText} hover:opacity-80`
                        : `${nestedBg} ${textSecondary} hover:bg-white/5`
                    }`}
                  >
                    {apiCredentials.leetcode?.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>

              {/* YouTube */}
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FiYoutube className="text-[#ff0000]" size={16} />
                  <span className={`text-xs sm:text-sm font-light ${textPrimary}`}>YouTube</span>
                  <span className={`ml-auto text-[8px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full`}>MANUAL</span>
                </div>
                <div className="space-y-2">
                  <p className={`text-[10px] sm:text-xs ${textTertiary} font-light`}>
                    Use sidebar edit icon to enter subscriber count
                  </p>
                  <div className={`p-2 sm:p-3 ${nestedBg} border ${borderColor} rounded-lg`}>
                    <p className={`text-[10px] flex items-center gap-2 ${textVeryMuted}`}>
                      <FiEdit size={10} />
                      Click ✎ in sidebar to edit
                    </p>
                  </div>
                </div>
              </div>

              {/* LinkedIn */}
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FiLinkedin className="text-[#0a66c2]" size={16} />
                  <span className={`text-xs sm:text-sm font-light ${textPrimary}`}>LinkedIn</span>
                  <span className={`ml-auto text-[8px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full`}>MANUAL</span>
                </div>
                <div className="space-y-2">
                  <p className={`text-[10px] sm:text-xs ${textTertiary} font-light`}>
                    Manual entry only - use sidebar edit
                  </p>
                  <div className={`p-2 sm:p-3 ${nestedBg} border ${borderColor} rounded-lg`}>
                    <p className={`text-[10px] flex items-center gap-2 ${textVeryMuted}`}>
                      <FiEdit size={10} />
                      Click ✎ in sidebar to edit
                    </p>
                  </div>
                </div>
              </div>

              {/* Instagram */}
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FiInstagram className="text-[#e4405f]" size={16} />
                  <span className={`text-xs sm:text-sm font-light ${textPrimary}`}>Instagram</span>
                  <span className={`ml-auto text-[8px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full`}>MANUAL</span>
                </div>
                <div className="space-y-2">
                  <p className={`text-[10px] sm:text-xs ${textTertiary} font-light`}>
                    Manual entry only - use sidebar edit
                  </p>
                  <div className={`p-2 sm:p-3 ${nestedBg} border ${borderColor} rounded-lg`}>
                    <p className={`text-[10px] flex items-center gap-2 ${textVeryMuted}`}>
                      <FiEdit size={10} />
                      Click ✎ in sidebar to edit
                    </p>
                  </div>
                </div>
              </div>

              {/* Facebook */}
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FiFacebook className="text-[#1877f2]" size={16} />
                  <span className={`text-xs sm:text-sm font-light ${textPrimary}`}>Facebook</span>
                  <span className={`ml-auto text-[8px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full`}>MANUAL</span>
                </div>
                <div className="space-y-2">
                  <p className={`text-[10px] sm:text-xs ${textTertiary} font-light`}>
                    Manual entry only - use sidebar edit
                  </p>
                  <div className={`p-2 sm:p-3 ${nestedBg} border ${borderColor} rounded-lg`}>
                    <p className={`text-[10px] flex items-center gap-2 ${textVeryMuted}`}>
                      <FiEdit size={10} />
                      Click ✎ in sidebar to edit
                    </p>
                  </div>
                </div>
              </div>

              {/* Snapchat */}
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <SiSnapchat className="text-[#fffc00]" size={16} />
                  <span className={`text-xs sm:text-sm font-light ${textPrimary}`}>Snapchat</span>
                  <span className={`ml-auto text-[8px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full`}>MANUAL</span>
                </div>
                <div className="space-y-2">
                  <p className={`text-[10px] sm:text-xs ${textTertiary} font-light`}>
                    No public API - use manual entry
                  </p>
                  <div className={`p-2 sm:p-3 ${nestedBg} border ${borderColor} rounded-lg`}>
                    <p className={`text-[10px] flex items-center gap-2 ${textVeryMuted}`}>
                      <FiEdit size={10} />
                      Click ✎ in sidebar to edit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className={`lg:col-span-2 ${cardBg} border ${roseBg} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 ${roseBg} rounded-xl`}>
                  <FiLogOut className={roseText} size={16} />
                </div>
                <div>
                  <h3 className={`text-xs sm:text-sm font-light ${textPrimary}`}>Logout</h3>
                  <p className={`text-[10px] sm:text-xs ${textMuted} font-light mt-0.5 sm:mt-1`}>
                    Sign out from your account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`px-4 sm:px-6 py-2 ${roseBg} ${roseText} rounded-xl hover:opacity-80 transition font-light text-xs sm:text-sm self-end sm:self-auto`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Diary Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-base sm:text-lg font-light ${emeraldText}`}>
                  {settings.diaryLock ? 'Change Password' : 'Set Password'}
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordInput('')
                    setConfirmPassword('')
                  }}
                  className={`p-2 ${textMuted} hover:text-emerald-500 transition`}
                >
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>New Password</label>
                  <input 
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Confirm Password</label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={handleSetDiaryPassword}
                  className={`flex-1 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm`}
                >
                  {settings.diaryLock ? 'Update' : 'Enable'}
                </button>
                <button 
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordInput('')
                    setConfirmPassword('')
                  }}
                  className={`flex-1 py-3 border ${borderColor} ${textSecondary} rounded-xl hover:bg-white/5 transition font-light text-sm`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8`}>
              <h3 className={`text-base sm:text-lg font-light ${roseText} mb-2`}>Confirm Logout</h3>
              <p className={`text-xs sm:text-sm ${textTertiary} font-light mb-6`}>
                Are you sure you want to logout? You'll need to login again.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLogout}
                  className={`flex-1 py-3 ${roseBg} ${roseText} rounded-xl hover:opacity-80 transition font-light text-sm`}
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
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

export default Settings