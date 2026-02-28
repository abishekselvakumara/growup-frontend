import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { 
  FiUser, 
  FiMapPin, 
  FiLink2, 
  FiCalendar,
  FiGithub,
  FiLinkedin,
  FiInstagram,
  FiFacebook,
  FiYoutube,
  FiAward,
  FiBook,
  FiCalendar as FiCalendarIcon,
  FiStar,
  FiEye
} from 'react-icons/fi'
import { SiLeetcode, SiSnapchat } from 'react-icons/si'
import { GiSprout } from 'react-icons/gi'

const PublicProfilePage = () => {
  const { shareCode } = useParams()
  const { isDark } = useTheme()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Theme-aware classes
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'
  const cardBg = isDark ? 'bg-[#121212]' : 'bg-white'
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200'
  const textPrimary = isDark ? 'text-white' : 'text-[#1d1d1f]'
  const textSecondary = isDark ? 'text-white/60' : 'text-gray-600'
  const textTertiary = isDark ? 'text-white/40' : 'text-gray-500'
  const textMuted = isDark ? 'text-white/30' : 'text-gray-400'
  const textVeryMuted = isDark ? 'text-white/20' : 'text-gray-300'
  const nestedBg = isDark ? 'bg-black/40' : 'bg-gray-50'
  
  const emeraldText = isDark ? 'text-emerald-400' : 'text-emerald-600'
  const emeraldBg = isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'

  useEffect(() => {
    loadProfile()
  }, [shareCode])

  const loadProfile = () => {
    setLoading(true)
    try {
      // Try to get from shared profiles in localStorage
      const sharedProfiles = JSON.parse(localStorage.getItem('shared_profiles') || '[]')
      const sharedData = sharedProfiles.find(p => p.code === shareCode)
      
      if (sharedData) {
        // Get user profile data
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        const profileInfo = JSON.parse(localStorage.getItem(`profileInfo_${sharedData.username}`) || '{}')
        const profilePic = localStorage.getItem(`profilePicture_${sharedData.username}`)
        
        // Build profile based on share settings
        const settings = sharedData.settings
        
        const profileData = {
          username: sharedData.username,
          fullName: settings.shareName ? userData.fullName : null,
          profilePicture: settings.shareProfilePicture ? profilePic : null,
          bio: settings.shareBio ? profileInfo.bio : null,
          location: settings.shareLocation ? profileInfo.location : null,
          website: settings.shareWebsite ? profileInfo.website : null,
          joinDate: settings.shareJoinDate ? profileInfo.joinDate : null,
          views: sharedData.views || 0,
          plantStreak: settings.sharePlantStreak ? Math.floor(Math.random() * 30) : null, // Mock data
          stats: settings.shareStats ? {
            totalNotes: Math.floor(Math.random() * 50),
            totalEvents: Math.floor(Math.random() * 20),
            totalDiary: Math.floor(Math.random() * 100)
          } : null
        }
        
        setProfile(profileData)
        
        // Update view count
        sharedData.views = (sharedData.views || 0) + 1
        sharedData.lastViewedAt = new Date().toISOString()
        localStorage.setItem('shared_profiles', JSON.stringify(sharedProfiles))
      } else {
        setError('Profile not found or has expired')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
        <div className={`max-w-md ${cardBg} border ${borderColor} rounded-2xl p-8 text-center`}>
          <div className="text-6xl mb-4 opacity-30">🔒</div>
          <h2 className={`text-xl ${textPrimary} font-light mb-2`}>Profile Not Available</h2>
          <p className={`text-sm ${textTertiary} font-light`}>
            {error || 'This profile may have expired or been deactivated'}
          </p>
          <a 
            href="/" 
            className={`inline-block mt-6 px-6 py-2 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light`}
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgColor} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 mb-4`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Picture */}
            {profile.profilePicture ? (
              <img 
                src={profile.profilePicture} 
                alt={profile.fullName || profile.username}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-light">
                {profile.fullName?.charAt(0) || profile.username?.charAt(0) || 'U'}
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              {profile.fullName && (
                <h1 className={`text-2xl font-light ${textPrimary} mb-1`}>
                  {profile.fullName}
                </h1>
              )}
              {profile.username && (
                <p className={`text-sm ${textSecondary} mb-3`}>
                  @{profile.username}
                </p>
              )}
              
              {/* Bio */}
              {profile.bio && (
                <p className={`text-sm ${textTertiary} mb-3 font-light`}>
                  {profile.bio}
                </p>
              )}

              {/* Location & Website */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {profile.location && (
                  <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                    <FiMapPin size={12} />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1 text-xs ${textMuted} hover:text-emerald-500 transition`}
                  >
                    <FiLink2 size={12} />
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {profile.joinDate && (
                  <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                    <FiCalendar size={12} />
                    Joined {profile.joinDate}
                  </span>
                )}
              </div>
            </div>

            {/* View Count */}
            <div className={`flex items-center gap-2 px-4 py-2 ${nestedBg} border ${borderColor} rounded-xl`}>
              <FiEye className={textTertiary} size={14} />
              <span className={`text-sm ${textPrimary} font-light`}>
                {profile.views || 0} views
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {profile.stats && (
          <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 mb-4`}>
            <h2 className={`text-sm ${textTertiary} mb-4 font-light uppercase tracking-wider`}>
              Activity Stats
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profile.stats.totalNotes > 0 && (
                <div className={`p-4 ${nestedBg} border ${borderColor} rounded-xl text-center`}>
                  <FiBook className={`mx-auto mb-2 ${textTertiary}`} size={20} />
                  <p className={`text-xl font-light ${textPrimary}`}>
                    {profile.stats.totalNotes}
                  </p>
                  <p className={`text-xs ${textMuted} font-light`}>Notes</p>
                </div>
              )}
              {profile.stats.totalEvents > 0 && (
                <div className={`p-4 ${nestedBg} border ${borderColor} rounded-xl text-center`}>
                  <FiCalendarIcon className={`mx-auto mb-2 ${textTertiary}`} size={20} />
                  <p className={`text-xl font-light ${textPrimary}`}>
                    {profile.stats.totalEvents}
                  </p>
                  <p className={`text-xs ${textMuted} font-light`}>Events</p>
                </div>
              )}
              {profile.stats.totalDiary > 0 && (
                <div className={`p-4 ${nestedBg} border ${borderColor} rounded-xl text-center`}>
                  <FiAward className={`mx-auto mb-2 ${textTertiary}`} size={20} />
                  <p className={`text-xl font-light ${textPrimary}`}>
                    {profile.stats.totalDiary}
                  </p>
                  <p className={`text-xs ${textMuted} font-light`}>Journal Entries</p>
                </div>
              )}
              {profile.plantStreak > 0 && (
                <div className={`p-4 ${nestedBg} border ${borderColor} rounded-xl text-center`}>
                  <GiSprout className={`mx-auto mb-2 text-emerald-500`} size={20} />
                  <p className={`text-xl font-light ${textPrimary}`}>
                    {profile.plantStreak}
                  </p>
                  <p className={`text-xs ${textMuted} font-light`}>Day Streak</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note about data */}
        <div className={`text-center text-xs ${textVeryMuted} font-light mt-8`}>
          This profile is shared via growup+ • Data is public based on sharing settings
        </div>
      </div>
    </div>
  )
}

export default PublicProfilePage