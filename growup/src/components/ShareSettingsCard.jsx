import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import { 
  FiShare2, 
  FiLink, 
  FiEye, 
  FiClock,
  FiToggleLeft,
  FiToggleRight,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiTrash2
} from 'react-icons/fi'

const ShareSettingsCard = ({ userProfile }) => {
  const { isDark } = useTheme()
  const [shareSettings, setShareSettings] = useState({
    shareName: true,
    shareUsername: true,
    shareBio: false,
    shareLocation: false,
    shareWebsite: false,
    shareJoinDate: true,
    shareProfilePicture: true,
    shareStats: true,
    shareSocialConnections: false,
    shareAchievements: true,
    sharePlantStreak: true,
    shareGithub: false,
    shareLeetcode: false,
    shareLinkedin: false,
    shareInstagram: false,
    shareFacebook: false,
    shareYoutube: false,
    shareSnapchat: false,
    expiryOption: 'never'
  })
  
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [isShared, setIsShared] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // Theme-aware classes
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
  const roseText = isDark ? 'text-rose-400' : 'text-rose-600'
  const roseBg = isDark ? 'bg-rose-500/10' : 'bg-rose-100'

  // Check for existing share links on mount
  useEffect(() => {
    checkExistingShareLink()
  }, [userProfile.username])

  const checkExistingShareLink = async () => {
    try {
      const analytics = await api.getShareAnalytics()
      if (analytics && analytics.shareCode) {
        setShareUrl(`${window.location.origin}/p/${analytics.shareCode}`)
        setShareCode(analytics.shareCode)
        setAnalytics(analytics)
        setIsShared(true)
      }
    } catch (error) {
      // No active share link found
      console.log('No active share link')
    }
  }

  const handleToggle = (key) => {
    setShareSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleCreateShareLink = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.createSharedProfile(shareSettings)
      
      if (response.success) {
        const shareUrl = `${window.location.origin}/p/${response.profile.shareCode}`
        setShareUrl(shareUrl)
        setShareCode(response.profile.shareCode)
        setAnalytics({
          totalViews: response.profile.viewsCount || 0,
          lastViewedAt: response.profile.lastViewedAt,
          createdAt: response.profile.createdAt
        })
        setIsShared(true)
        setShowShareModal(true)
      }
    } catch (error) {
      console.error('Error creating share link:', error)
      setError(error.message || 'Failed to create share link')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate your share link?')) return
    
    setLoading(true)
    try {
      await api.deactivateSharedProfile()
      
      setIsShared(false)
      setShareUrl('')
      setShareCode('')
      setAnalytics(null)
    } catch (error) {
      console.error('Error deactivating share link:', error)
      setError(error.message || 'Failed to deactivate share link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = [
    {
      name: 'Twitter',
      icon: '𝕏',
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?text=Check%20out%20my%20growth%20journey%20on%20GrowUp%2B!&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: '📱',
      color: '#25D366',
      url: `https://wa.me/?text=${encodeURIComponent(`Check out my growth journey on GrowUp+! ${shareUrl}`)}`
    },
    {
      name: 'Telegram',
      icon: '📨',
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my growth journey on GrowUp+!')}`
    },
    {
      name: 'Email',
      icon: '✉️',
      color: '#EA4335',
      url: `mailto:?subject=${encodeURIComponent('Check out my growth journey on GrowUp+!')}&body=${encodeURIComponent(`I've been tracking my growth on GrowUp+ and wanted to share my profile with you: ${shareUrl}`)}`
    },
    {
      name: 'LinkedIn',
      icon: '🔗',
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: 'f',
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    }
  ]

  return (
    <>
      <div className={`lg:col-span-2 ${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xs sm:text-sm font-light ${textTertiary} flex items-center gap-2`}>
            <FiShare2 className={emeraldText} size={16} />
            SHARE PROFILE
          </h3>
          {isShared && (
            <span className={`text-[10px] px-2 py-1 ${emeraldBg} ${emeraldText} rounded-full font-light`}>
              Active
            </span>
          )}
        </div>

        <p className={`text-xs ${textMuted} mb-4 font-light`}>
          Create a public profile to share your progress with others. 
          Choose what information you want to make visible.
        </p>

        {error && (
          <div className={`mb-4 p-3 ${roseBg} border border-rose-500/30 rounded-lg`}>
            <p className={`text-xs ${roseText} font-light`}>{error}</p>
          </div>
        )}

        {/* Share Settings */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {/* Basic Info Section */}
          <div>
            <h4 className={`text-xs ${textSecondary} mb-2 font-light`}>Basic Information</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'shareName', label: 'Full Name' },
                { key: 'shareUsername', label: 'Username' },
                { key: 'shareBio', label: 'Bio' },
                { key: 'shareLocation', label: 'Location' },
                { key: 'shareWebsite', label: 'Website' },
                { key: 'shareJoinDate', label: 'Join Date' },
                { key: 'shareProfilePicture', label: 'Profile Picture' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className={`flex items-center justify-between p-2 ${nestedBg} border ${borderColor} rounded-lg text-xs`}
                >
                  <span className={`${textSecondary} font-light`}>{item.label}</span>
                  {shareSettings[item.key] ? (
                    <FiToggleRight className={emeraldText} size={18} />
                  ) : (
                    <FiToggleLeft className={textMuted} size={18} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div>
            <h4 className={`text-xs ${textSecondary} mb-2 font-light`}>Stats & Achievements</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'shareStats', label: 'Activity Stats' },
                { key: 'shareAchievements', label: 'Achievements' },
                { key: 'sharePlantStreak', label: 'Plant Streak' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className={`flex items-center justify-between p-2 ${nestedBg} border ${borderColor} rounded-lg text-xs`}
                >
                  <span className={`${textSecondary} font-light`}>{item.label}</span>
                  {shareSettings[item.key] ? (
                    <FiToggleRight className={emeraldText} size={18} />
                  ) : (
                    <FiToggleLeft className={textMuted} size={18} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Social Connections */}
          <div>
            <h4 className={`text-xs ${textSecondary} mb-2 font-light flex items-center gap-1`}>
              Social Connections
              <FiAlertCircle size={12} className={textTertiary} />
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'shareGithub', label: 'GitHub' },
                { key: 'shareLeetcode', label: 'LeetCode' },
                { key: 'shareLinkedin', label: 'LinkedIn' },
                { key: 'shareInstagram', label: 'Instagram' },
                { key: 'shareFacebook', label: 'Facebook' },
                { key: 'shareYoutube', label: 'YouTube' },
                { key: 'shareSnapchat', label: 'Snapchat' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className={`flex items-center justify-between p-2 ${nestedBg} border ${borderColor} rounded-lg text-xs`}
                >
                  <span className={`${textSecondary} font-light`}>{item.label}</span>
                  {shareSettings[item.key] ? (
                    <FiToggleRight className={emeraldText} size={18} />
                  ) : (
                    <FiToggleLeft className={textMuted} size={18} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry Options */}
          <div>
            <h4 className={`text-xs ${textSecondary} mb-2 font-light`}>Link Expiry</h4>
            <select
              value={shareSettings.expiryOption}
              onChange={(e) => setShareSettings(prev => ({ ...prev, expiryOption: e.target.value }))}
              className={`w-full p-2 ${nestedBg} border ${borderColor} rounded-lg text-xs ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
            >
              <option value="never">Never expires</option>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {!isShared ? (
            <button
              onClick={handleCreateShareLink}
              disabled={loading}
              className={`flex-1 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm flex items-center justify-center gap-2`}
            >
              <FiShare2 size={16} />
              {loading ? 'Creating...' : 'Create Share Link'}
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowShareModal(true)}
                className={`flex-1 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm flex items-center justify-center gap-2`}
              >
                <FiLink size={16} />
                View Link
              </button>
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className={`py-3 px-4 ${roseBg} ${roseText} rounded-xl hover:opacity-80 transition font-light text-sm`}
              >
                {loading ? '...' : 'Deactivate'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg ${cardBg} border ${borderColor} rounded-2xl p-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-light ${textPrimary}`}>Share Your Profile</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className={`p-2 ${textMuted} hover:text-emerald-500 transition`}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Share Link */}
            <div className="mb-6">
              <label className={`block text-xs ${textTertiary} mb-2 font-light`}>
                Your shareable link
              </label>
              <div className="flex gap-2">
                <div className={`flex-1 p-3 ${nestedBg} border ${borderColor} rounded-xl flex items-center gap-2 overflow-hidden`}>
                  <FiLink className={`flex-shrink-0 ${textMuted}`} size={16} />
                  <span className={`text-sm ${textSecondary} truncate font-light`}>
                    {shareUrl}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-4 flex-shrink-0 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition flex items-center gap-2 font-light text-sm`}
                >
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Analytics */}
            {analytics && (
              <div className={`mb-6 p-4 ${nestedBg} border ${borderColor} rounded-xl`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${textTertiary} font-light`}>Share Code</span>
                  <span className={`text-xs ${emeraldText} font-mono font-light bg-black/20 px-2 py-1 rounded`}>{shareCode}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${textTertiary} font-light`}>Created</span>
                  <span className={`text-xs ${textMuted} font-light`}>
                    {analytics.createdAt ? new Date(analytics.createdAt).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textTertiary} font-light`}>Total Views</span>
                  <span className={`text-sm ${textPrimary} font-light flex items-center gap-1`}>
                    <FiEye size={14} className={textMuted} />
                    {analytics.totalViews || 0}
                  </span>
                </div>
                {analytics.lastViewedAt && (
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${textTertiary} font-light`}>Last Viewed</span>
                    <span className={`text-xs ${textMuted} font-light flex items-center gap-1`}>
                      <FiClock size={12} />
                      {new Date(analytics.lastViewedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Share Options */}
            <div className="mb-6">
              <h4 className={`text-sm ${textSecondary} mb-3 font-light`}>Share via</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {shareLinks.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-3 ${nestedBg} border ${borderColor} rounded-xl hover:border-emerald-500/30 transition group`}
                  >
                    <span style={{ color: platform.color }} className="text-lg font-bold">
                      {platform.icon}
                    </span>
                    <span className={`text-xs ${textVeryMuted} group-hover:text-emerald-500 transition`}>
                      {platform.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className={`w-full py-2 text-xs ${textMuted} hover:text-emerald-500 transition font-light`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ShareSettingsCard