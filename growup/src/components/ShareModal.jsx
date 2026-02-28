import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { 
  FiX, 
  FiLink, 
  FiCheck, 
  FiCopy, 
  FiClock,
  FiGlobe,
  FiLock,
  FiEye,
  FiTwitter,
  FiMail,
  FiMessageCircle
} from 'react-icons/fi'
import { FaWhatsapp, FaTelegram, FaReddit, FaLinkedin } from 'react-icons/fa'

const ShareModal = ({ isOpen, onClose, shareUrl, shareCode, analytics }) => {
  const { isDark } = useTheme()
  const [copied, setCopied] = useState(false)
  
  // Theme-aware classes
  const cardBg = isDark ? 'bg-[#121212]' : 'bg-white'
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200'
  const textPrimary = isDark ? 'text-white' : 'text-[#1d1d1f]'
  const textSecondary = isDark ? 'text-white/60' : 'text-gray-600'
  const textTertiary = isDark ? 'text-white/40' : 'text-gray-500'
  const textMuted = isDark ? 'text-white/30' : 'text-gray-400'
  const nestedBg = isDark ? 'bg-black/40' : 'bg-gray-50'
  
  const emeraldText = isDark ? 'text-emerald-400' : 'text-emerald-600'
  const emeraldBg = isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'

  if (!isOpen) return null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = [
    {
      name: 'Twitter',
      icon: <FiTwitter size={18} />,
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?text=Check%20out%20my%20growth%20journey%20on%20GrowUp%2B!&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={18} />,
      color: '#25D366',
      url: `https://wa.me/?text=${encodeURIComponent(`Check out my growth journey on GrowUp+! ${shareUrl}`)}`
    },
    {
      name: 'Telegram',
      icon: <FaTelegram size={18} />,
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my growth journey on GrowUp+!')}`
    },
    {
      name: 'Reddit',
      icon: <FaReddit size={18} />,
      color: '#FF4500',
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('My growth journey on GrowUp+')}`
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin size={18} />,
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Email',
      icon: <FiMail size={18} />,
      color: '#EA4335',
      url: `mailto:?subject=${encodeURIComponent('Check out my growth journey on GrowUp+!')}&body=${encodeURIComponent(`I've been tracking my growth on GrowUp+ and wanted to share my profile with you: ${shareUrl}`)}`
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg ${cardBg} border ${borderColor} rounded-2xl p-6`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-light ${textPrimary}`}>Share Your Profile</h3>
          <button
            onClick={onClose}
            className={`p-2 ${textMuted} hover:${textPrimary} transition`}
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
            <div className={`flex-1 p-3 ${nestedBg} border ${borderColor} rounded-xl flex items-center gap-2`}>
              <FiLink className={textMuted} size={16} />
              <span className={`text-sm ${textSecondary} truncate font-light`}>
                {shareUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-4 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition flex items-center gap-2 font-light text-sm`}
            >
              {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share Code */}
        <div className={`mb-6 p-4 ${nestedBg} border ${borderColor} rounded-xl`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${textTertiary} font-light`}>Share Code</span>
            <span className={`text-xs ${emeraldText} font-mono font-light`}>{shareCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs ${textTertiary} font-light`}>Total Views</span>
            <span className={`text-sm ${textPrimary} font-light flex items-center gap-1`}>
              <FiEye size={14} className={textMuted} />
              {analytics?.totalViews || 0}
            </span>
          </div>
          {analytics?.lastViewedAt && (
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${textTertiary} font-light`}>Last Viewed</span>
              <span className={`text-xs ${textMuted} font-light flex items-center gap-1`}>
                <FiClock size={12} />
                {new Date(analytics.lastViewedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Share Options */}
        <div className="mb-6">
          <h4 className={`text-sm ${textSecondary} mb-3 font-light`}>Share via</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {shareLinks.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-1 p-3 ${nestedBg} border ${borderColor} rounded-xl hover:border-emerald-500/30 transition group`}
              >
                <span style={{ color: platform.color }} className="text-lg">
                  {platform.icon}
                </span>
                <span className={`text-[8px] ${textVeryMuted} group-hover:${textSecondary} transition`}>
                  {platform.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className={`p-4 ${nestedBg} border ${borderColor} rounded-xl text-center`}>
          <p className={`text-xs ${textTertiary} font-light mb-2`}>
            Scan QR code to share
          </p>
          <div className={`w-32 h-32 mx-auto ${cardBg} border ${borderColor} rounded-xl flex items-center justify-center`}>
            <span className={`text-2xl opacity-30`}>📱</span>
          </div>
          <p className={`text-[10px] ${textVeryMuted} font-light mt-2`}>
            QR code generation coming soon
          </p>
        </div>
      </div>
    </div>
  )
}

export default ShareModal