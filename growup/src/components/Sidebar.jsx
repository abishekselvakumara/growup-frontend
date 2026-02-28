import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import { 
  FiHome, 
  FiBook, 
  FiBarChart2, 
  FiSettings, 
  FiDollarSign,
  FiCalendar,
  FiLinkedin,
  FiInstagram,
  FiFacebook,
  FiFileText,
  FiGithub,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiLoader,
  FiYoutube,
  FiEdit,
  FiChevronRight
} from 'react-icons/fi'
import { SiLeetcode, SiSnapchat } from 'react-icons/si'
import { 
  fetchGitHubProfile, 
  fetchLeetCodeProfile,
  fetchYouTubeStats,
  saveManualData
} from '../services/socialApi'

// Import the logo
import plantLogo from '../assets/plantlogo.png'

const Sidebar = () => {
  const { isDark, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showManualEdit, setShowManualEdit] = useState(null)
  const [manualValues, setManualValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    name: 'User',
    initials: 'U'
  })

  const [financeData, setFinanceData] = useState({
    income: 0,
    expenses: 0
  })

  const [socialData, setSocialData] = useState({
    linkedin: { value: 0, growth: 0, loading: false, error: null, label: 'followers', source: null, note: null },
    instagram: { value: 0, growth: 0, loading: false, error: null, label: 'followers', source: null, note: null },
    facebook: { value: 0, growth: 0, loading: false, error: null, label: 'followers', source: null, note: null },
    github: { value: 0, growth: 0, loading: false, error: null, label: 'repos', source: null, public_repos: 0, note: null },
    youtube: { value: 0, growth: 0, loading: false, error: null, label: 'subscribers', source: null, note: null },
    snapchat: { value: 0, growth: 0, loading: false, error: null, label: 'followers', source: null, note: 'Manual entry only' },
    leetcode: { value: 0, growth: 0, loading: false, error: null, label: 'problems', source: null, note: null }
  })

  const [apiCredentials, setApiCredentials] = useState({})

  // Load all data from backend only
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // Load user data from localStorage (set during login)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      setUserData({
        name: user.fullName || 'User',
        initials: user.initials || 'U'
      })

      // Load finance summary from backend
      const financeSummary = await api.getFinanceSummary().catch(() => null)
      if (financeSummary) {
        setFinanceData({
          income: financeSummary.totalIncome || 0,
          expenses: financeSummary.totalExpenses || 0
        })
      }

      // Load social stats from backend (this is the source of truth)
      const socialStats = await api.getSocialStats().catch(() => ({}))
      
      // Process social stats from backend - ignore localStorage completely
      const platforms = ['github', 'leetcode', 'youtube', 'linkedin', 'instagram', 'facebook', 'snapchat']
      
      // First, reset all social data to empty
      const resetSocialData = {}
      platforms.forEach(platform => {
        resetSocialData[platform] = {
          value: 0,
          growth: 0,
          loading: false,
          error: null,
          source: null,
          note: platform === 'snapchat' ? 'Manual entry only' : null,
          ...(platform === 'github' && { public_repos: 0 })
        }
      })
      
      setSocialData(prev => ({ ...prev, ...resetSocialData }))
      
      // Then update with backend data
      platforms.forEach(platform => {
        const data = socialStats[platform]
        if (data) {
          setSocialData(prev => ({
            ...prev,
            [platform]: {
              ...prev[platform],
              value: data.value || 0,
              source: data.source || null,
              note: data.note || null,
              loading: false,
              error: null,
              // Special handling for GitHub
              ...(platform === 'github' && data.public_repos ? { public_repos: data.public_repos } : {})
            }
          }))
        }
      })

      // Load API credentials from localStorage (only for connection status)
      const savedCredentials = localStorage.getItem('api-credentials')
      if (savedCredentials) {
        setApiCredentials(JSON.parse(savedCredentials))
      }

    } catch (error) {
      console.error('Error loading sidebar data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch social data when credentials are available (only for API-connected platforms)
  useEffect(() => {
    const fetchAllSocialData = async () => {
      // Check if we have any API credentials that are connected
      const hasApiConnections = Object.values(apiCredentials).some(cred => cred?.connected)
      if (!hasApiConnections) return

      // GitHub - only fetch if connected and not already have data from backend
      if (apiCredentials.github?.connected && apiCredentials.github.username) {
        // Check if we already have data from backend with source 'api'
        if (socialData.github.source !== 'api' || socialData.github.value === 0) {
          setSocialData(prev => ({ ...prev, github: { ...prev.github, loading: true } }))
          const data = await fetchGitHubProfile(apiCredentials.github.username)
          if (data) {
            // Save to backend
            await api.saveApiStat('github', {
              value: data.followers,
              label: 'followers',
              note: `${data.public_repos} repos`
            }).catch(() => {})
            
            setSocialData(prev => ({
              ...prev,
              github: {
                ...prev.github,
                value: data.followers,
                public_repos: data.public_repos,
                growth: parseFloat(data.growth) || 0,
                loading: false,
                error: null,
                source: 'api',
                note: `${data.public_repos} repos`
              }
            }))
          } else {
            setSocialData(prev => ({
              ...prev,
              github: { ...prev.github, loading: false, error: 'Failed to fetch' }
            }))
          }
        }
      }

      // YouTube
      if (apiCredentials.youtube?.connected && apiCredentials.youtube.channelId && apiCredentials.youtube.apiKey) {
        if (socialData.youtube.source !== 'api' || socialData.youtube.value === 0) {
          setSocialData(prev => ({ ...prev, youtube: { ...prev.youtube, loading: true } }))
          const data = await fetchYouTubeStats(apiCredentials.youtube.channelId, apiCredentials.youtube.apiKey)
          if (data) {
            // Save to backend
            await api.saveApiStat('youtube', {
              value: data.subscribers,
              label: 'subscribers',
              note: `${data.views} views`
            }).catch(() => {})
            
            setSocialData(prev => ({
              ...prev,
              youtube: {
                ...prev.youtube,
                value: data.subscribers,
                growth: parseFloat(data.growth) || 0,
                loading: false,
                error: null,
                source: 'api',
                note: `${data.views} views`
              }
            }))
          } else {
            setSocialData(prev => ({
              ...prev,
              youtube: { ...prev.youtube, loading: false, error: 'Failed to fetch' }
            }))
          }
        }
      }

      // LeetCode
      if (apiCredentials.leetcode?.connected && apiCredentials.leetcode.username) {
        if (socialData.leetcode.source !== 'api' || socialData.leetcode.value === 0) {
          setSocialData(prev => ({ ...prev, leetcode: { ...prev.leetcode, loading: true } }))
          const data = await fetchLeetCodeProfile(apiCredentials.leetcode.username)
          if (data) {
            // Save to backend
            await api.saveApiStat('leetcode', {
              value: data.totalSolved,
              label: 'problems',
              note: `E:${data.easy} M:${data.medium} H:${data.hard}`
            }).catch(() => {})
            
            setSocialData(prev => ({
              ...prev,
              leetcode: {
                ...prev.leetcode,
                value: data.totalSolved || 0,
                growth: parseFloat(data.growth) || 0,
                loading: false,
                error: null,
                source: 'api',
                note: `E:${data.easy} M:${data.medium} H:${data.hard}`
              }
            }))
          } else {
            setSocialData(prev => ({
              ...prev,
              leetcode: { 
                ...prev.leetcode, 
                loading: false, 
                error: 'User not found'
              }
            }))
          }
        }
      }
    }

    fetchAllSocialData()
  }, [apiCredentials, socialData.github.source, socialData.youtube.source, socialData.leetcode.source])

  const handleManualSave = async (platform) => {
    const value = manualValues[platform]?.value || 0;
    const note = manualValues[platform]?.note || '';
    
    // Save to backend (source of truth)
    await api.saveManualStat(platform, {
      value: Number(value),
      label: platform === 'github' ? 'repos' : 
             platform === 'leetcode' ? 'problems' : 'followers',
      note
    }).catch(() => {})
    
    // Also save to localStorage as backup
    saveManualData(platform, {
      value: Number(value),
      note,
      timestamp: new Date().toISOString()
    });
    
    // Update socialData
    setSocialData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        value: Number(value),
        source: 'manual',
        note: note || null,
        loading: false,
        error: null,
        ...(platform === 'github' && { public_repos: 0 }) // Reset public_repos for manual GitHub entry
      }
    }));
    
    setManualValues(prev => ({
      ...prev,
      [platform]: { value: '', note: '' }
    }));
    
    setShowManualEdit(null);
  };

  const mainNavItems = [
    { path: '/', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/diary', icon: <FiBook size={20} />, label: 'Diary' },
    { path: '/notes', icon: <FiFileText size={20} />, label: 'Notes' },
    { path: '/analytics', icon: <FiBarChart2 size={20} />, label: 'Analytics' },
    { path: '/finance', icon: <FiDollarSign size={20} />, label: 'Finance' },
    { path: '/events', icon: <FiCalendar size={20} />, label: 'Events' },
    { path: '/settings', icon: <FiSettings size={20} />, label: 'Settings' },
  ]

  const socialNavItems = [
    { 
      icon: <FiGithub size={18} />, 
      label: 'GitHub', 
      color: isDark ? '#fff' : '#333', 
      growth: socialData.github.growth, 
      value: socialData.github.value,
      public_repos: socialData.github.public_repos,
      loading: socialData.github.loading,
      error: socialData.github.error,
      source: socialData.github.source,
      note: socialData.github.note,
      displayValue: socialData.github.public_repos ? `${socialData.github.public_repos} repos` : 
                   (socialData.github.value ? `${socialData.github.value} followers` : null)
    },
    { 
      icon: <FiYoutube size={18} />, 
      label: 'YouTube', 
      color: '#ff0000', 
      growth: socialData.youtube.growth, 
      value: socialData.youtube.value,
      loading: socialData.youtube.loading,
      error: socialData.youtube.error,
      source: socialData.youtube.source,
      note: socialData.youtube.note,
      displayValue: socialData.youtube.value ? `${socialData.youtube.value.toLocaleString()} subs` : null
    },
    { 
      icon: <SiLeetcode size={18} />, 
      label: 'LeetCode', 
      color: '#ffa116', 
      growth: socialData.leetcode.growth, 
      value: socialData.leetcode.value,
      loading: socialData.leetcode.loading,
      error: socialData.leetcode.error,
      source: socialData.leetcode.source,
      note: socialData.leetcode.note,
      displayValue: socialData.leetcode.value ? `${socialData.leetcode.value} problems` : null
    },
    { 
      icon: <FiLinkedin size={18} />, 
      label: 'LinkedIn', 
      color: '#0a66c2', 
      growth: socialData.linkedin.growth, 
      value: socialData.linkedin.value,
      loading: socialData.linkedin.loading,
      error: socialData.linkedin.error,
      source: socialData.linkedin.source,
      note: socialData.linkedin.note,
      displayValue: socialData.linkedin.value ? `${socialData.linkedin.value} followers` : null
    },
    { 
      icon: <FiInstagram size={18} />, 
      label: 'Instagram', 
      color: '#e4405f', 
      growth: socialData.instagram.growth, 
      value: socialData.instagram.value,
      loading: socialData.instagram.loading,
      error: socialData.instagram.error,
      source: socialData.instagram.source,
      note: socialData.instagram.note,
      displayValue: socialData.instagram.value ? `${socialData.instagram.value} followers` : null
    },
    { 
      icon: <FiFacebook size={18} />, 
      label: 'Facebook', 
      color: '#1877f2', 
      growth: socialData.facebook.growth, 
      value: socialData.facebook.value,
      loading: socialData.facebook.loading,
      error: socialData.facebook.error,
      source: socialData.facebook.source,
      note: socialData.facebook.note,
      displayValue: socialData.facebook.value ? `${socialData.facebook.value} followers` : null
    },
    { 
      icon: <SiSnapchat size={18} />, 
      label: 'Snapchat', 
      color: '#fffc00', 
      growth: 0, 
      value: socialData.snapchat.value,
      loading: socialData.snapchat.loading,
      error: socialData.snapchat.error,
      source: socialData.snapchat.source,
      note: socialData.snapchat.note || 'Manual entry only',
      displayValue: socialData.snapchat.value ? `${socialData.snapchat.value} followers` : null
    },
  ]

  const budgetPercentage = financeData.income > 0 
    ? Math.round((financeData.expenses / financeData.income) * 100) 
    : 0

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: ${isDark ? '#1a1a1a' : '#f5f5f7'};
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: ${isDark ? '#3a3a3a' : '#e5e5ea'};
      border-radius: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #10b981;
    }
  `

  const sidebarContent = (
    <div className={`h-full flex flex-col ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <style>{scrollbarStyles}</style>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        {/* Logo and Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Plant Logo */}
            <img 
              src={plantLogo} 
              alt="GrowUp+" 
              className="w-8 h-8 object-contain"
              style={{ 
                filter: isDark ? 'brightness(1.2)' : 'none'
              }}
            />
            <span className={`text-xl font-light tracking-tight ${isDark ? 'text-white/90' : 'text-[#2c2c2e]'}`}>
              growup+
            </span>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition ${
              isDark 
                ? 'bg-white/5 text-emerald-400 hover:bg-white/10' 
                : 'bg-[#f2f2f7] text-[#2c2c2e] hover:bg-[#e5e5ea]'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`lg:hidden ${
              isDark ? 'text-white/30 hover:text-white/90' : 'text-[#8e8e98] hover:text-[#2c2c2e]'
            }`}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation - Fixed the isActive error */}
        <nav className="space-y-1 mb-8">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : isDark
                      ? 'text-white/30 hover:bg-white/5 hover:text-white/90'
                      : 'text-[#8e8e98] hover:bg-[#f2f2f7] hover:text-[#2c2c2e]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon}
                  <span className="text-sm font-light">{item.label}</span>
                  {isActive && <FiChevronRight size={14} className="ml-auto text-emerald-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Social Growth Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-light tracking-wider ${
              isDark ? 'text-white/30' : 'text-[#8e8e98]'
            }`}>SOCIAL</p>
            <span className={`text-[10px] ${isDark ? 'text-white/20' : 'text-[#9e9e9e]'}`}>
              ✎ edit
            </span>
          </div>
          <div className="space-y-2">
            {socialNavItems.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-2 rounded-xl transition group ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-[#f5f5f7]'
              }`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span style={{ color: item.color }} className="text-lg flex-shrink-0">{item.icon}</span>
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-light ${isDark ? 'text-white/90' : 'text-[#2c2c2e]'}`}>
                        {item.label}
                      </span>
                      {item.source === 'manual' && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                          isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                        }`}>MAN</span>
                      )}
                      {item.source === 'api' && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                          isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        }`}>API</span>
                      )}
                    </div>
                    {showManualEdit === item.label ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          placeholder="Enter value"
                          value={manualValues[item.label.toLowerCase()]?.value || ''}
                          onChange={(e) => setManualValues({
                            ...manualValues,
                            [item.label.toLowerCase()]: {
                              ...manualValues[item.label.toLowerCase()],
                              value: e.target.value
                            }
                          })}
                          className={`w-20 px-2 py-1 text-xs rounded-lg ${
                            isDark 
                              ? 'bg-black/40 text-white border border-white/5' 
                              : 'bg-white text-[#2c2c2e] border border-[#e5e5ea]'
                          }`}
                          autoFocus
                        />
                        <button
                          onClick={() => handleManualSave(item.label.toLowerCase())}
                          className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowManualEdit(null)}
                          className={`text-xs px-2 py-1 rounded-lg ${
                            isDark ? 'bg-white/5 text-white/60' : 'bg-[#f5f5f7] text-[#2c2c2e]'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {item.loading ? (
                          <div className="flex items-center gap-1">
                            <FiLoader className="animate-spin text-xs" />
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-[#8e8e98]'}`}>Loading...</p>
                          </div>
                        ) : item.error ? (
                          <p className="text-xs text-rose-400">Error</p>
                        ) : item.note ? (
                          <p className={`text-xs ${isDark ? 'text-white/30' : 'text-[#9e9e9e]'}`}>{item.note}</p>
                        ) : item.displayValue ? (
                          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-[#8e8e98]'}`}>
                            {item.displayValue}
                          </p>
                        ) : item.value ? (
                          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-[#8e8e98]'}`}>
                            {item.value.toLocaleString()} {item.label === 'LeetCode' ? 'problems' : 
                                                          item.label === 'YouTube' ? 'subs' : 
                                                          'followers'}
                          </p>
                        ) : (
                          <p className={`text-xs ${isDark ? 'text-white/20' : 'text-[#9e9e9e]'}`}>
                            No data
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!item.note && !item.loading && !item.error && item.growth > 0 && (
                    <span className="text-xs text-emerald-400 font-light">
                      +{item.growth}%
                    </span>
                  )}
                  <button
                    onClick={() => setShowManualEdit(item.label)}
                    className={`opacity-0 group-hover:opacity-100 transition p-1 rounded-lg ${
                      isDark ? 'hover:bg-white/10' : 'hover:bg-[#e5e5ea]'
                    }`}
                  >
                    <FiEdit size={12} className={isDark ? 'text-white/40' : 'text-[#8e8e98]'} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Finance */}
        <div className="mb-8">
          <p className={`text-xs font-light tracking-wider mb-3 ${
            isDark ? 'text-white/30' : 'text-[#8e8e98]'
          }`}>FINANCE</p>
          <div className={`rounded-xl p-4 ${
            isDark ? 'bg-white/5' : 'bg-[#f5f5f7]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs ${isDark ? 'text-white/30' : 'text-[#8e8e98]'}`}>Income</span>
              <span className={`text-base font-light ${isDark ? 'text-white/90' : 'text-[#2c2c2e]'}`}>
                ${financeData.income?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs ${isDark ? 'text-white/30' : 'text-[#8e8e98]'}`}>Expenses</span>
              <span className="text-base font-light text-rose-400">
                ${financeData.expenses?.toLocaleString() || '0'}
              </span>
            </div>
            <div className={`w-full h-1 rounded-full overflow-hidden ${
              isDark ? 'bg-white/10' : 'bg-[#e5e5ea]'
            }`}>
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${budgetPercentage}%` }}></div>
            </div>
            <p className={`text-[10px] mt-2 ${isDark ? 'text-white/30' : 'text-[#8e8e98]'}`}>
              {budgetPercentage}% used
            </p>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-light text-sm">
            {userData.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-light truncate ${isDark ? 'text-white/90' : 'text-[#2c2c2e]'}`}>
              {userData.name}
            </p>
            <p className={`text-xs truncate ${isDark ? 'text-white/30' : 'text-[#8e8e98]'}`}>
              Connected
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl ${
          isDark ? 'bg-white/5 text-white/90' : 'bg-white text-[#2c2c2e] shadow-lg'
        }`}
        aria-label="Open menu"
      >
        <FiMenu size={24} />
      </button>

      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-64 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className={`hidden lg:block w-64 h-screen overflow-y-auto ${
        isDark ? 'bg-[#0a0a0a] border-r border-white/5' : 'bg-white border-r border-[#e5e5ea]'
      }`}>
        {sidebarContent}
      </aside>
    </>
  )
}

export default Sidebar