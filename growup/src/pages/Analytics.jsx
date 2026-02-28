import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import Chart from '../components/Chart'
import { api } from '../services/api'
import { 
  FiTrendingUp, 
  FiCode, 
  FiLinkedin,
  FiInstagram,
  FiFacebook,
  FiYoutube,
  FiGithub,
  FiDollarSign,
  FiCalendar,
  FiBook,
  FiClock,
  FiTarget,
  FiAward,
  FiBarChart2,
  FiLoader,
  FiChevronRight,
  FiDroplet
} from 'react-icons/fi'
import { SiLeetcode, SiSnapchat } from 'react-icons/si'
import { GiSprout, GiPlantSeed } from 'react-icons/gi'

const Analytics = () => {
  const { isDark } = useTheme()
  const [timeframe, setTimeframe] = useState('week')
  const [loading, setLoading] = useState(true)
  
  // Plant streak state
  const [plantStreak, setPlantStreak] = useState(0)
  const [plantEmoji, setPlantEmoji] = useState('🌱')
  
  // Current user
  const [currentUser, setCurrentUser] = useState(null)
  
  const [analyticsData, setAnalyticsData] = useState({
    social: {},
    sources: {},
    coding: {
      problemsSolved: 0,
      repos: 0
    },
    finance: { 
      income: 0, 
      expenses: 0, 
      savings: 0, 
      savingsRate: 0 
    },
    notes: { 
      total: 0, 
      important: 0, 
      completionRate: 0 
    },
    events: { 
      total: 0, 
      upcoming: 0 
    }
  })

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
  const yellowText = isDark ? 'text-yellow-400' : 'text-yellow-600'

  // Load current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setCurrentUser(user)
    console.log('Analytics - Current user loaded:', user.username)
  }, [])

  // Load plant data when user is available
  useEffect(() => {
    if (currentUser?.username) {
      loadPlantData()
    }
  }, [currentUser])

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadPlantData = async () => {
    try {
      const data = await api.getPlantStreak()
      setPlantStreak(data.currentStreak || 0)
      
      // Update plant emoji based on streak
      updatePlantEmoji(data.currentStreak || 0)
    } catch (error) {
      console.error('Error loading plant streak:', error)
      // Fallback to localStorage
      loadPlantDataFallback()
    }
  }

  const loadPlantDataFallback = () => {
    if (!currentUser?.username) return
    
    const plantKey = `plantData_${currentUser.username}`
    const saved = localStorage.getItem(plantKey)
    
    if (saved) {
      const data = JSON.parse(saved)
      setPlantStreak(data.streak || 0)
      updatePlantEmoji(data.streak || 0)
    }
  }

  const updatePlantEmoji = (streak) => {
    if (streak >= 30) setPlantEmoji('🌳')
    else if (streak >= 14) setPlantEmoji('🌿')
    else if (streak >= 7) setPlantEmoji('🌱')
    else if (streak >= 3) setPlantEmoji('🌿')
    else setPlantEmoji('🌱')
  }

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Load all data in parallel
      const [
        socialStats,
        dashboardSummary,
        notes,
        events,
        transactions
      ] = await Promise.all([
        api.getSocialStats().catch(() => ({})),
        api.getDashboardSummary().catch(() => ({})),
        api.getNotes().catch(() => []),
        api.getEvents().catch(() => []),
        api.getTransactions().catch(() => [])
      ])

      // Process social stats
      const social = {}
      const sources = {}
      
      const platforms = ['github', 'leetcode', 'youtube', 'linkedin', 'instagram', 'facebook', 'snapchat']
      
      platforms.forEach(platform => {
        const data = socialStats[platform]
        social[platform] = data
        sources[platform] = data?.source || null
      })

      // Calculate finance totals
      const totalIncome = transactions
        .filter(t => t?.type === 'income')
        .reduce((sum, t) => sum + Number(t?.amount || 0), 0)
      const totalExpenses = transactions
        .filter(t => t?.type === 'expense')
        .reduce((sum, t) => sum + Number(t?.amount || 0), 0)

      // Calculate notes stats
      const importantNotes = notes.filter(n => n?.important).length

      // Calculate events stats
      const now = new Date()
      const upcomingEvents = events.filter(e => new Date(e?.date || 0) >= now).length

      setAnalyticsData({
        social,
        sources,
        coding: {
          problemsSolved: social.leetcode?.totalSolved || social.leetcode?.value || 0,
          repos: social.github?.public_repos || social.github?.value || 0
        },
        finance: {
          income: totalIncome || 0,
          expenses: totalExpenses || 0,
          savings: (totalIncome - totalExpenses) || 0,
          savingsRate: totalIncome ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0
        },
        notes: {
          total: notes.length || 0,
          important: importantNotes || 0,
          completionRate: notes.length ? ((importantNotes / notes.length) * 100).toFixed(1) : 0
        },
        events: {
          total: events.length || 0,
          upcoming: upcomingEvents || 0
        }
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConnectedPlatformsCount = () => {
    return Object.values(analyticsData.social).filter(s => s && typeof s === 'object').length
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
            <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${textPrimary}`}>Analytics</h1>
            <p className={`text-xs sm:text-sm ${textTertiary} font-light`}>
              Comprehensive insights across all platforms
            </p>
          </div>
          <div className={`flex gap-2 ${isDark ? 'bg-black/40' : 'bg-gray-100'} border ${borderColor} rounded-xl p-1 self-end sm:self-auto`}>
            {['week', 'month', 'year'].map((period) => (
              <button 
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-light transition capitalize ${
                  timeframe === period 
                    ? `${emeraldBg} ${emeraldText}` 
                    : `${textMuted} hover:${textPrimary}`
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Connected Platforms */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${emeraldBg} rounded-lg`}>
                <FiAward className={emeraldText} size={18} />
              </div>
              <span className={`text-xs font-light ${textTertiary}`}>Connected</span>
            </div>
            <p className={`text-xl sm:text-2xl font-light ${textPrimary}`}>
              {getConnectedPlatformsCount()}
            </p>
            <p className={`text-xs ${textMuted} font-light mt-2`}>Active platforms</p>
          </div>

          {/* Problems Solved */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-lg`}>
                <FiTarget className={textSecondary} size={18} />
              </div>
              <span className={`text-xs font-light ${textTertiary}`}>Problems</span>
            </div>
            <p className={`text-xl sm:text-2xl font-light ${textPrimary}`}>
              {analyticsData.coding.problemsSolved || 0}
            </p>
            <p className={`text-xs ${textMuted} font-light mt-2`}>Total solved</p>
          </div>

          {/* Plant Streak - User specific */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${emeraldBg} rounded-lg`}>
                <GiSprout className={emeraldText} size={18} />
              </div>
              <span className={`text-xs font-light ${textTertiary}`}>Plant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{plantEmoji}</span>
              <p className={`text-xl sm:text-2xl font-light ${textPrimary}`}>
                {plantStreak || 0} day{plantStreak !== 1 ? 's' : ''}
              </p>
            </div>
            <p className={`text-xs ${textMuted} font-light mt-2`}>Watering streak</p>
          </div>

          {/* Repositories */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-lg`}>
                <FiCode className={textSecondary} size={18} />
              </div>
              <span className={`text-xs font-light ${textTertiary}`}>Repos</span>
            </div>
            <p className={`text-xl sm:text-2xl font-light ${textPrimary}`}>
              {analyticsData.coding.repos || 0}
            </p>
            <p className={`text-xs ${textMuted} font-light mt-2`}>GitHub repositories</p>
          </div>
        </div>

        {/* Platform Details - Responsive Grid */}
        <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-6`}>
          <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-4 uppercase`}>Platforms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* GitHub */}
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiGithub className={isDark ? 'text-white/60' : 'text-gray-700'} size={16} />
                  <span className={`text-sm font-light ${textPrimary}`}>GitHub</span>
                </div>
                {analyticsData.sources?.github && (
                  <span className={`text-[8px] sm:text-[10px] px-2 py-1 rounded-full font-light ${
                    analyticsData.sources.github === 'manual'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : `${emeraldBg} ${emeraldText}`
                  }`}>
                    {analyticsData.sources.github === 'manual' ? 'MAN' : 'API'}
                  </span>
                )}
              </div>
              {analyticsData.social.github ? (
                <>
                  <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                    {analyticsData.social.github.public_repos || analyticsData.social.github.value || 0}
                  </p>
                  <p className={`text-xs ${textMuted} font-light mt-1`}>Repositories</p>
                  {analyticsData.social.github.followers > 0 && (
                    <p className={`text-xs ${textVeryMuted} font-light mt-2`}>
                      {analyticsData.social.github.followers} followers
                    </p>
                  )}
                </>
              ) : (
                <p className={`text-sm ${textMuted} font-light`}>Not connected</p>
              )}
            </div>

            {/* LeetCode */}
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SiLeetcode className="text-[#ffa116]" size={16} />
                  <span className={`text-sm font-light ${textPrimary}`}>LeetCode</span>
                </div>
                {analyticsData.sources?.leetcode && (
                  <span className={`text-[8px] sm:text-[10px] px-2 py-1 rounded-full font-light ${
                    analyticsData.sources.leetcode === 'manual'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : `${emeraldBg} ${emeraldText}`
                  }`}>
                    {analyticsData.sources.leetcode === 'manual' ? 'MAN' : 'API'}
                  </span>
                )}
              </div>
              {analyticsData.social.leetcode ? (
                <>
                  <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                    {analyticsData.social.leetcode.totalSolved || analyticsData.social.leetcode.value || 0}
                  </p>
                  <p className={`text-xs ${textMuted} font-light mt-1`}>Problems</p>
                  {(analyticsData.social.leetcode.easy > 0 || 
                    analyticsData.social.leetcode.medium > 0 || 
                    analyticsData.social.leetcode.hard > 0) && (
                    <div className="flex flex-wrap gap-2 mt-2 text-[10px] sm:text-xs">
                      {analyticsData.social.leetcode.easy > 0 && (
                        <span className="text-emerald-500">E:{analyticsData.social.leetcode.easy}</span>
                      )}
                      {analyticsData.social.leetcode.medium > 0 && (
                        <span className="text-yellow-500">M:{analyticsData.social.leetcode.medium}</span>
                      )}
                      {analyticsData.social.leetcode.hard > 0 && (
                        <span className="text-rose-500">H:{analyticsData.social.leetcode.hard}</span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className={`text-sm ${textMuted} font-light`}>Not connected</p>
              )}
            </div>

            {/* YouTube */}
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiYoutube className="text-[#ff0000]" size={16} />
                  <span className={`text-sm font-light ${textPrimary}`}>YouTube</span>
                </div>
                {analyticsData.sources?.youtube && (
                  <span className={`text-[8px] sm:text-[10px] px-2 py-1 rounded-full font-light ${
                    analyticsData.sources.youtube === 'manual'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : `${emeraldBg} ${emeraldText}`
                  }`}>
                    {analyticsData.sources.youtube === 'manual' ? 'MAN' : 'API'}
                  </span>
                )}
              </div>
              {analyticsData.social.youtube ? (
                <>
                  <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                    {analyticsData.social.youtube.subscribers?.toLocaleString() || 
                     analyticsData.social.youtube.value?.toLocaleString() || 0}
                  </p>
                  <p className={`text-xs ${textMuted} font-light mt-1`}>
                    {analyticsData.social.youtube.subscribers ? 'Subscribers' : 'Value'}
                  </p>
                  {analyticsData.social.youtube.views > 0 && (
                    <p className={`text-xs ${textVeryMuted} font-light mt-2`}>
                      {analyticsData.social.youtube.views.toLocaleString()} views
                    </p>
                  )}
                </>
              ) : (
                <p className={`text-sm ${textMuted} font-light`}>Not connected</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiLinkedin className="text-[#0a66c2]" size={16} />
                  <span className={`text-sm font-light ${textPrimary}`}>LinkedIn</span>
                </div>
                {analyticsData.sources?.linkedin && (
                  <span className="text-[8px] sm:text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-light">
                    MAN
                  </span>
                )}
              </div>
              {analyticsData.social.linkedin ? (
                <>
                  <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                    {analyticsData.social.linkedin.value?.toLocaleString() || 0}
                  </p>
                  <p className={`text-xs ${textMuted} font-light mt-1`}>Followers</p>
                  {analyticsData.social.linkedin.note && (
                    <p className={`text-[10px] sm:text-xs ${textVeryMuted} font-light mt-2`}>{analyticsData.social.linkedin.note}</p>
                  )}
                </>
              ) : (
                <p className={`text-sm ${textMuted} font-light`}>Not connected</p>
              )}
            </div>

            {/* Instagram */}
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiInstagram className="text-[#e4405f]" size={16} />
                  <span className={`text-sm font-light ${textPrimary}`}>Instagram</span>
                </div>
                {analyticsData.sources?.instagram && (
                  <span className="text-[8px] sm:text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-light">
                    MAN
                  </span>
                )}
              </div>
              {analyticsData.social.instagram ? (
                <>
                  <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                    {analyticsData.social.instagram.value?.toLocaleString() || 0}
                  </p>
                  <p className={`text-xs ${textMuted} font-light mt-1`}>Followers</p>
                  {analyticsData.social.instagram.note && (
                    <p className={`text-[10px] sm:text-xs ${textVeryMuted} font-light mt-2`}>{analyticsData.social.instagram.note}</p>
                  )}
                </>
              ) : (
                <p className={`text-sm ${textMuted} font-light`}>Not connected</p>
              )}
            </div>

            {/* Facebook */}
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiFacebook className="text-[#1877f2]" size={16} />
                  <span className={`text-sm font-light ${textPrimary}`}>Facebook</span>
                </div>
                {analyticsData.sources?.facebook && (
                  <span className="text-[8px] sm:text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-light">
                    MAN
                  </span>
                )}
              </div>
              {analyticsData.social.facebook ? (
                <>
                  <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                    {analyticsData.social.facebook.value?.toLocaleString() || 0}
                  </p>
                  <p className={`text-xs ${textMuted} font-light mt-1`}>Followers</p>
                  {analyticsData.social.facebook.note && (
                    <p className={`text-[10px] sm:text-xs ${textVeryMuted} font-light mt-2`}>{analyticsData.social.facebook.note}</p>
                  )}
                </>
              ) : (
                <p className={`text-sm ${textMuted} font-light`}>Not connected</p>
              )}
            </div>

            {/* Snapchat */}
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SiSnapchat className="text-[#fffc00]" size={16} />
                  <span className={`text-sm font-light ${textPrimary}`}>Snapchat</span>
                </div>
                {analyticsData.sources?.snapchat && (
                  <span className="text-[8px] sm:text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-light">
                    MAN
                  </span>
                )}
              </div>
              {analyticsData.social.snapchat ? (
                <>
                  <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                    {analyticsData.social.snapchat.value?.toLocaleString() || 0}
                  </p>
                  <p className={`text-xs ${textMuted} font-light mt-1`}>Followers</p>
                  {analyticsData.social.snapchat.note && (
                    <p className={`text-[10px] sm:text-xs ${textVeryMuted} font-light mt-2`}>{analyticsData.social.snapchat.note}</p>
                  )}
                </>
              ) : (
                <p className={`text-sm ${textMuted} font-light`}>Not connected</p>
              )}
            </div>
          </div>
        </div>

        {/* Finance Analytics */}
        <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-6`}>
          <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-4 uppercase`}>Finance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <p className={`text-xs ${textMuted} font-light mb-1`}>Income</p>
              <p className={`text-lg sm:text-xl font-light ${emeraldText}`}>
                ${Number(analyticsData.finance.income).toLocaleString()}
              </p>
            </div>
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <p className={`text-xs ${textMuted} font-light mb-1`}>Expenses</p>
              <p className={`text-lg sm:text-xl font-light text-rose-500`}>
                ${Number(analyticsData.finance.expenses).toLocaleString()}
              </p>
            </div>
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <p className={`text-xs ${textMuted} font-light mb-1`}>Savings</p>
              <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                ${Number(analyticsData.finance.savings).toLocaleString()}
              </p>
            </div>
            <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4`}>
              <p className={`text-xs ${textMuted} font-light mb-1`}>Savings Rate</p>
              <p className={`text-lg sm:text-xl font-light ${emeraldText}`}>
                {analyticsData.finance.savingsRate || 0}%
              </p>
            </div>
          </div>
          <div className="h-48 sm:h-56 lg:h-64">
            <Chart type="finance-trend" />
          </div>
        </div>

        {/* Notes & Events Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Notes Analysis */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-6`}>
            <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-4 uppercase`}>Notes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiBook className={emeraldText} size={16} />
                  <span className={`text-sm font-light ${textSecondary}`}>Total</span>
                </div>
                <span className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                  {analyticsData.notes.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiAward className={emeraldText} size={16} />
                  <span className={`text-sm font-light ${textSecondary}`}>Important</span>
                </div>
                <span className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                  {analyticsData.notes.important || 0}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span className={`text-xs ${textMuted} font-light`}>Quality Score</span>
                  <span className={`text-xs ${emeraldText} font-light`}>
                    {analyticsData.notes.completionRate || 0}%
                  </span>
                </div>
                <div className={`w-full h-1.5 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${analyticsData.notes.completionRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Analysis */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-6`}>
            <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-4 uppercase`}>Events</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4 text-center`}>
                <p className={`text-xs ${textMuted} font-light mb-1`}>Total</p>
                <p className={`text-lg sm:text-xl font-light ${textPrimary}`}>
                  {analyticsData.events.total || 0}
                </p>
              </div>
              <div className={`${nestedBg} border ${borderColor} rounded-xl p-3 sm:p-4 text-center`}>
                <p className={`text-xs ${textMuted} font-light mb-1`}>Upcoming</p>
                <p className={`text-lg sm:text-xl font-light ${emeraldText}`}>
                  {analyticsData.events.upcoming || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics