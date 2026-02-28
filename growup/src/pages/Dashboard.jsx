import Card from '../components/Card'
import Chart from '../components/Chart'
import { useTheme } from '../context/ThemeContext'
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
  FiLoader,
  FiStar,
  FiSun,
  FiRefreshCw,
  FiMaximize2,
  FiX,
  FiActivity,
  FiChevronRight,
  FiDroplet
} from 'react-icons/fi'
import { SiLeetcode, SiSnapchat } from 'react-icons/si'
import { GiSprout, GiPlantSeed } from 'react-icons/gi'
import { useState, useEffect } from 'react'

const Dashboard = () => {
  const { isDark } = useTheme()
  const [events, setEvents] = useState([])
  const [notes, setNotes] = useState([])
  const [finance, setFinance] = useState({ income: 0, expenses: 0 })
  const [socialStats, setSocialStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState({})
  
  // Plant watering state - from backend
  const [plantStreak, setPlantStreak] = useState(0)
  const [lastWatered, setLastWatered] = useState(null)
  const [showPlantModal, setShowPlantModal] = useState(false)
  const [plantMessage, setPlantMessage] = useState('')
  const [plantEmoji, setPlantEmoji] = useState('🌱')
  const [plantLoading, setPlantLoading] = useState(false)
  
  // Current user - FIXED: Add this
  const [currentUser, setCurrentUser] = useState(null)
  
  // Modal states
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedFact, setSelectedFact] = useState(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const [showFactModal, setShowFactModal] = useState(false)
  
  // API-based content
  const [quote, setQuote] = useState({ text: 'Loading...', author: '' })
  const [book, setBook] = useState({ title: 'Loading...', author: '', description: '' })
  const [fact, setFact] = useState({ text: 'Loading...' })
  const [leetcodeStreak, setLeetcodeStreak] = useState(0)

  // Theme-aware classes
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'
  const cardBg = isDark ? 'bg-[#121212]' : 'bg-white'
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200'
  const textPrimary = isDark ? 'text-white' : 'text-[#1d1d1f]'
  const textSecondary = isDark ? 'text-white/60' : 'text-gray-600'
  const textTertiary = isDark ? 'text-white/40' : 'text-gray-500'
  const textMuted = isDark ? 'text-white/30' : 'text-gray-400'
  const textVeryMuted = isDark ? 'text-white/20' : 'text-gray-300'
  const hoverBorder = isDark ? 'hover:border-emerald-500/30' : 'hover:border-emerald-500'

  // Load current user - FIXED: Add this
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setCurrentUser(user)
    console.log('Current user loaded:', user.username)
  }, [])

  // Load plant data from backend
  useEffect(() => {
    if (currentUser?.username) { // Only load if we have a user
      loadPlantData()
    }
  }, [currentUser])

  const loadPlantData = async () => {
    try {
      const data = await api.getPlantStreak()
      setPlantStreak(data.currentStreak || 0)
      setLastWatered(data.lastWateredDate)
      
      // Check if last watered was today
      const today = new Date().toDateString()
      const lastWateredDate = data.lastWateredDate ? new Date(data.lastWateredDate).toDateString() : null
      
      if (lastWateredDate === today) {
        setPlantMessage('Already watered today! 🌿')
      } else {
        // Check if streak should be reset (missed a day)
        if (lastWateredDate) {
          const lastDate = new Date(lastWateredDate)
          const todayDate = new Date()
          const diffTime = Math.abs(todayDate - lastDate)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays > 1) {
            // Reset streak if missed more than 1 day
            await api.resetPlantStreak()
            setPlantStreak(0)
            setPlantMessage('Streak reset! Start fresh today 🌱')
          } else {
            // Prompt to water
            setShowPlantModal(true)
          }
        } else {
          // First time or no previous watering
          setShowPlantModal(true)
        }
      }
      
      updatePlantEmoji(data.currentStreak || 0)
    } catch (error) {
      console.error('Error loading plant streak:', error)
      // Fallback to localStorage if backend fails
      loadPlantDataFallback()
    }
  }

  // Fallback to localStorage if backend fails - FIXED with user-specific key
  const loadPlantDataFallback = () => {
    if (!currentUser?.username) {
      console.log('No user found, cannot load plant data')
      return
    }
    
    const plantKey = `plantData_${currentUser.username}` // User-specific key
    console.log('Loading plant data with key:', plantKey)
    const saved = localStorage.getItem(plantKey)
    
    if (saved) {
      const data = JSON.parse(saved)
      setPlantStreak(data.streak || 0)
      setLastWatered(data.lastWatered)
      
      const today = new Date().toDateString()
      if (data.lastWatered === today) {
        setPlantMessage('Already watered today! 🌿')
      } else {
        checkAndPromptWateringFallback()
      }
      
      updatePlantEmoji(data.streak || 0)
    } else {
      console.log('No saved plant data for user:', currentUser.username)
      // First time user
      setTimeout(() => {
        setShowPlantModal(true)
      }, 2000)
    }
  }

  const updatePlantEmoji = (streak) => {
    if (streak >= 30) setPlantEmoji('🌳')
    else if (streak >= 14) setPlantEmoji('🌿')
    else if (streak >= 7) setPlantEmoji('🌱')
    else if (streak >= 3) setPlantEmoji('🌿')
    else setPlantEmoji('🌱')
  }

  // FIXED: Add user check and user-specific key
  const checkAndPromptWateringFallback = () => {
    if (!currentUser?.username) return
    
    const today = new Date().toDateString()
    if (lastWatered !== today) {
      if (lastWatered) {
        const lastDate = new Date(lastWatered)
        const todayDate = new Date()
        const diffTime = Math.abs(todayDate - lastDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays > 1) {
          const plantKey = `plantData_${currentUser.username}`
          setPlantStreak(0)
          localStorage.setItem(plantKey, JSON.stringify({ 
            streak: 0, 
            lastWatered: null 
          }))
          updatePlantEmoji(0)
        }
      }
      setShowPlantModal(true)
    }
  }

  const handleWaterPlant = async (watered) => {
    setPlantLoading(true)
    try {
      if (watered) {
        // Call backend to water plant
        const response = await api.waterPlant()
        const newStreak = response.streak?.currentStreak || response.streak || 1
        setPlantStreak(newStreak)
        setLastWatered(new Date().toISOString())
        setPlantMessage(`Day ${newStreak}! Keep it growing! 🌿`)
        updatePlantEmoji(newStreak)
      } else {
        // Reset streak
        const response = await api.resetPlantStreak()
        setPlantStreak(0)
        setLastWatered(null)
        setPlantMessage('Oh no! Your plant withered 💀 Start fresh tomorrow!')
        setPlantEmoji('🌱')
      }
    } catch (error) {
      console.error('Error updating plant streak:', error)
      // Fallback to localStorage
      handleWaterPlantFallback(watered)
    } finally {
      setPlantLoading(false)
      setShowPlantModal(false)
    }
  }

  // FIXED: Add user check and user-specific key
  const handleWaterPlantFallback = (watered) => {
    if (!currentUser?.username) return
    
    const plantKey = `plantData_${currentUser.username}` // User-specific key
    const today = new Date().toDateString()
    
    if (watered) {
      const newStreak = plantStreak + 1
      setPlantStreak(newStreak)
      setLastWatered(today)
      setPlantMessage(`Day ${newStreak}! Keep it growing! 🌿`)
      updatePlantEmoji(newStreak)
      
      localStorage.setItem(plantKey, JSON.stringify({ 
        streak: newStreak, 
        lastWatered: today 
      }))
      console.log('Saved plant data for user:', currentUser.username, 'streak:', newStreak)
    } else {
      setPlantStreak(0)
      setLastWatered(null)
      setPlantMessage('Oh no! Your plant withered 💀 Start fresh tomorrow!')
      setPlantEmoji('🌱')
      
      localStorage.setItem(plantKey, JSON.stringify({ 
        streak: 0, 
        lastWatered: null 
      }))
      console.log('Reset plant data for user:', currentUser.username)
    }
  }

  // Fetch new quote from API
  const fetchNewQuote = async () => {
    setRefreshing(prev => ({ ...prev, quote: true }))
    try {
      const response = await fetch('https://api.quotable.io/random')
      if (response.ok) {
        const data = await response.json()
        setQuote({ text: data.content, author: data.author })
      } else {
        const fallback = await fetch('https://zenquotes.io/api/random')
        const fallbackData = await fallback.json()
        setQuote({ text: fallbackData[0].q, author: fallbackData[0].a })
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
      const fallbackQuotes = [
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" }
      ]
      const random = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
      setQuote(random)
    } finally {
      setRefreshing(prev => ({ ...prev, quote: false }))
    }
  }

  // Fetch new book from Open Library API
  const fetchNewBook = async () => {
    setRefreshing(prev => ({ ...prev, book: true }))
    try {
      const subjects = ['philosophy', 'literature', 'science', 'art']
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
      
      const response = await fetch(
        `https://openlibrary.org/subjects/${randomSubject}.json?limit=50`
      )
      
      if (response.ok) {
        const data = await response.json()
        const works = data.works || []
        if (works.length > 0) {
          const randomBook = works[Math.floor(Math.random() * works.length)]
          setBook({ 
            title: randomBook.title,
            author: randomBook.authors?.[0]?.name || 'Unknown author',
            description: `First published ${randomBook.first_publish_year || 'unknown'}`
          })
        }
      } else {
        throw new Error('Open Library API failed')
      }
    } catch (error) {
      console.error('Error fetching book:', error)
      const fallbackBooks = [
        { title: "Neuromancer", author: "William Gibson", description: "A classic cyberpunk novel." },
        { title: "Snow Crash", author: "Neal Stephenson", description: "A vision of the metaverse." },
        { title: "The Singularity is Near", author: "Ray Kurzweil", description: "Future of humanity." }
      ]
      setBook(fallbackBooks[Math.floor(Math.random() * fallbackBooks.length)])
    } finally {
      setRefreshing(prev => ({ ...prev, book: false }))
    }
  }

  // Fetch new fact from API
  const fetchNewFact = async () => {
    setRefreshing(prev => ({ ...prev, fact: true }))
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random')
      if (response.ok) {
        const data = await response.json()
        setFact({ text: data.text })
      } else {
        const fallback = await fetch('https://api.popcat.xyz/fact')
        const fallbackData = await fallback.json()
        setFact({ text: fallbackData.fact })
      }
    } catch (error) {
      console.error('Error fetching fact:', error)
      const fallbackFacts = [
        { text: "The first computer virus was created in 1983." },
        { text: "The average person walks around the world 3 times in a lifetime." },
        { text: "There are more chess iterations than atoms in the universe." }
      ]
      setFact(fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)])
    } finally {
      setRefreshing(prev => ({ ...prev, fact: false }))
    }
  }

  // Refresh all content
  const refreshAll = () => {
    fetchNewQuote()
    fetchNewBook()
    fetchNewFact()
  }

  useEffect(() => {
    fetchNewQuote()
    fetchNewBook()
    fetchNewFact()
    loadData()
    
    const interval = setInterval(() => {
      refreshAll()
    }, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [eventsData, notesData, financeData, socialData] = await Promise.all([
        api.getEvents().catch(() => []),
        api.getNotes().catch(() => []),
        api.getFinanceSummary().catch(() => ({ totalIncome: 0, totalExpenses: 0 })),
        api.getSocialStats().catch(() => ({}))
      ])

      setEvents(eventsData)
      setNotes(notesData)
      setFinance({ 
        income: financeData.totalIncome || 0, 
        expenses: financeData.totalExpenses || 0 
      })

      if (socialData.leetcode) {
        setLeetcodeStreak(socialData.leetcode.streak || 0)
      }

      const platforms = ['github', 'leetcode', 'youtube', 'linkedin', 'instagram', 'facebook', 'snapchat']
      const formattedStats = {}
      
      platforms.forEach(platform => {
        const data = socialData[platform]
        formattedStats[platform] = {
          value: data?.value || 0,
          label: platform === 'github' ? 'Repos' : 
                 platform === 'leetcode' ? 'Problems' : 'Followers',
          connected: !!data && (data.value !== undefined || data.totalSolved !== undefined || data.public_repos !== undefined),
          loading: false,
          source: data?.source || null,
          ...(data && { ...data })
        }
      })
      
      setSocialStats(formattedStats)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date).toDateString()
    const today = new Date().toDateString()
    return eventDate === today
  })

  const importantNotes = notes.filter(note => note.important).slice(0, 3)

  const growthStats = [
    { 
      icon: <FiStar size={18} />, 
      label: 'Quote', 
      value: quote.text.length > 40 ? quote.text.substring(0, 40) + '…' : quote.text, 
      subValue: quote.author ? `— ${quote.author}` : '',
      onRefresh: fetchNewQuote,
      onViewFull: () => {
        setSelectedQuote(quote)
        setShowQuoteModal(true)
      },
      refreshing: refreshing.quote
    },
    { 
      icon: <FiBook size={18} />, 
      label: 'Book', 
      value: book.title.length > 30 ? book.title.substring(0, 30) + '…' : book.title, 
      subValue: book.author || '',
      onRefresh: fetchNewBook,
      onViewFull: () => {
        setSelectedBook(book)
        setShowBookModal(true)
      },
      refreshing: refreshing.book
    },
    { 
      icon: <FiSun size={18} />, 
      label: 'Fact', 
      value: fact.text.length > 40 ? fact.text.substring(0, 40) + '…' : fact.text, 
      onRefresh: fetchNewFact,
      onViewFull: () => {
        setSelectedFact(fact)
        setShowFactModal(true)
      },
      refreshing: refreshing.fact
    },
    { 
      icon: <FiCode size={18} />, 
      label: 'Streak', 
      value: `${leetcodeStreak} day${leetcodeStreak !== 1 ? 's' : ''}`, 
      change: leetcodeStreak > 0 ? '🔥' : 'Start',
    },
  ]

  const socialPlatforms = [
    { key: 'github', icon: <FiGithub size={18} />, label: 'GitHub', color: isDark ? '#fff' : '#333' },
    { key: 'leetcode', icon: <SiLeetcode size={18} />, label: 'LeetCode', color: '#ffa116' },
    { key: 'youtube', icon: <FiYoutube size={18} />, label: 'YouTube', color: '#ff0000' },
    { key: 'linkedin', icon: <FiLinkedin size={18} />, label: 'LinkedIn', color: '#0a66c2' },
    { key: 'instagram', icon: <FiInstagram size={18} />, label: 'Instagram', color: '#e4405f' },
    { key: 'facebook', icon: <FiFacebook size={18} />, label: 'Facebook', color: '#1877f2' },
    { key: 'snapchat', icon: <SiSnapchat size={18} />, label: 'Snapchat', color: '#fffc00' }
  ]

  // Calculate connected platforms count
  const connectedCount = Object.values(socialStats).filter(stat => stat?.connected).length

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgColor} font-['Inter',system-ui,-apple-system,sans-serif] transition-colors duration-300`}>
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#10b981_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header with Plant */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${textPrimary}`}>Dashboard</h1>
              <p className={`text-xs sm:text-sm ${textTertiary} font-light`}>Track your growth across platforms</p>
            </div>
            
            {/* Plant Status */}
            <button
              onClick={() => setShowPlantModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${borderColor} ${cardBg} hover:border-emerald-500/30 transition-all`}
              disabled={plantLoading}
            >
              {plantLoading ? (
                <FiLoader className="animate-spin text-emerald-500" size={16} />
              ) : (
                <span className="text-xl">{plantEmoji}</span>
              )}
              <div className="text-left">
                <p className={`text-[10px] ${textMuted} font-light`}>Plant Streak</p>
                <p className={`text-xs font-medium ${plantStreak > 0 ? 'text-emerald-500' : textMuted}`}>
                  {plantStreak} day{plantStreak !== 1 ? 's' : ''}
                </p>
              </div>
            </button>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={refreshAll}
              className={`p-2 ${textMuted} hover:text-emerald-500 transition-colors`}
              title="Refresh all content"
            >
              <FiRefreshCw size={18} className={(refreshing.quote || refreshing.book || refreshing.fact) ? 'animate-spin' : ''} />
            </button>
            <div className={`text-xs sm:text-sm ${textMuted} font-light tabular-nums`}>
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Daily Inspiration Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {growthStats.map((stat, index) => (
            <div
              key={index}
              onClick={stat.onViewFull}
              className={`group ${cardBg} border ${borderColor} ${hoverBorder} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
                    {stat.icon}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-medium ${textMuted} tracking-wider uppercase`}>
                    {stat.label}
                  </span>
                </div>
                <div className="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {stat.onViewFull && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        stat.onViewFull()
                      }}
                      className={`p-1 ${textMuted} hover:text-emerald-400`}
                    >
                      <FiMaximize2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                    </button>
                  )}
                  {stat.onRefresh && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        stat.onRefresh()
                      }}
                      className={`p-1 ${textMuted} hover:text-emerald-400`}
                    >
                      <FiRefreshCw size={12} className={`sm:w-[14px] sm:h-[14px] ${stat.refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className={`text-xs sm:text-sm ${textPrimary} group-hover:text-emerald-400 transition-colors line-clamp-2 font-light leading-relaxed`}>
                {stat.value}
              </div>
              {stat.subValue && (
                <div className={`text-[10px] sm:text-xs ${textMuted} mt-2 font-light truncate`}>{stat.subValue}</div>
              )}
              {stat.change && (
                <div className={`text-[10px] sm:text-xs text-emerald-400/70 mt-2 sm:mt-3 font-light`}>{stat.change}</div>
              )}
            </div>
          ))}
        </div>

        {/* Connected Platforms */}
        <div className={`${cardBg} border ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className={`text-xs sm:text-sm font-medium ${textTertiary} tracking-wider uppercase`}>Connected Networks</h2>
            <span className={`text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-500 px-2 sm:px-3 py-1 rounded-full font-light w-fit`}>
              {connectedCount} active
            </span>
          </div>

          {/* Responsive grid - 3 columns on mobile, 4 on tablet, 7 on desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {socialPlatforms.map((platform) => {
              const stat = socialStats[platform.key]
              const isConnected = stat?.connected
              
              // Get display value based on platform
              let displayValue = '—'
              if (isConnected) {
                if (platform.key === 'github') {
                  displayValue = stat?.public_repos || stat?.value || 0
                } else if (platform.key === 'leetcode') {
                  displayValue = stat?.totalSolved || stat?.value || 0
                } else {
                  displayValue = stat?.value?.toLocaleString() || 0
                }
              }
              
              return (
                <div
                  key={platform.key}
                  className={`p-2 sm:p-4 rounded-lg sm:rounded-xl border transition-all ${
                    isConnected 
                      ? 'bg-emerald-500/5 border-emerald-500/20' 
                      : `${cardBg} border ${borderColor} opacity-40`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span style={{ color: platform.color }} className="text-base sm:text-lg">{platform.icon}</span>
                    {stat?.source && (
                      <span className={`text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-light ${
                        stat.source === 'manual'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {stat.source === 'manual' ? 'MAN' : 'API'}
                      </span>
                    )}
                  </div>
                  
                  <span className={`text-[10px] sm:text-xs font-light ${textMuted} block mb-1 truncate`}>{platform.label}</span>
                  
                  {isConnected ? (
                    <div className={`text-xs sm:text-sm font-light ${textPrimary} truncate`}>{displayValue}</div>
                  ) : (
                    <div className={`text-xs sm:text-sm font-light ${textVeryMuted}`}>—</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Analytics Section - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Today's Events */}
          <div className={`${cardBg} border ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <FiCalendar size={14} className="sm:w-4 sm:h-4 text-emerald-400/70" />
              <h3 className={`text-xs sm:text-sm font-medium ${textTertiary} tracking-wider uppercase`}>Today</h3>
            </div>

            {todayEvents.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {todayEvents.map((event, index) => (
                  <div key={index} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 ${isDark ? 'bg-black/20' : 'bg-gray-50'} rounded-lg sm:rounded-xl border ${borderColor}`}>
                    <div className={`w-0.5 h-8 sm:h-10 rounded-full ${
                      event.type === 'urgent' ? 'bg-rose-500' : 
                      event.type === 'important' ? 'bg-emerald-500' : 
                      isDark ? 'bg-white/10' : 'bg-gray-200'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs sm:text-sm ${textPrimary} truncate font-light`}>{event.title}</h4>
                      <p className={`text-[10px] sm:text-xs ${textMuted} mt-0.5 sm:mt-1 font-light`}>{event.time}</p>
                    </div>
                    <FiChevronRight size={14} className={`sm:w-4 sm:h-4 ${textVeryMuted}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className={`text-xs sm:text-sm ${textVeryMuted} font-light`}>No events scheduled</p>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className={`lg:col-span-2 ${cardBg} border ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <FiActivity size={14} className="sm:w-4 sm:h-4 text-emerald-400/70" />
                <h3 className={`text-xs sm:text-sm font-medium ${textTertiary} tracking-wider uppercase`}>Analytics</h3>
              </div>
              <div className="flex gap-2">
                <button className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-emerald-500/10 text-emerald-500 rounded-lg font-light">Week</button>
                <button className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs ${textMuted} hover:text-emerald-500 rounded-lg font-light transition`}>Month</button>
              </div>
            </div>
            
            <div className="h-48 sm:h-56 lg:h-64">
              <Chart type="multi" />
            </div>
          </div>
        </div>

        {/* Notes & Finance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Important Notes */}
          <div className={`${cardBg} border ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <FiBook size={14} className="sm:w-4 sm:h-4 text-emerald-400/70" />
              <h3 className={`text-xs sm:text-sm font-medium ${textTertiary} tracking-wider uppercase`}>Important Notes</h3>
            </div>

            {importantNotes.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {importantNotes.map((note, index) => (
                  <div key={index} className={`p-3 sm:p-4 ${isDark ? 'bg-black/20' : 'bg-gray-50'} rounded-lg sm:rounded-xl border ${borderColor}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className={`text-xs sm:text-sm ${textPrimary} font-light truncate flex-1`}>{note.title}</h4>
                      <span className="text-[8px] sm:text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-light whitespace-nowrap">
                        important
                      </span>
                    </div>
                    <p className={`text-[10px] sm:text-xs ${textMuted} font-light line-clamp-2`}>{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className={`text-xs sm:text-sm ${textVeryMuted} font-light`}>No important notes</p>
              </div>
            )}
          </div>

          {/* Finance Summary */}
          <div className={`${cardBg} border ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <FiDollarSign size={14} className="sm:w-4 sm:h-4 text-emerald-400/70" />
              <h3 className={`text-xs sm:text-sm font-medium ${textTertiary} tracking-wider uppercase`}>Finance</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className={`p-3 sm:p-4 ${isDark ? 'bg-black/20' : 'bg-gray-50'} rounded-lg sm:rounded-xl border ${borderColor}`}>
                <p className={`text-[10px] sm:text-xs ${textMuted} mb-1 sm:mb-2 font-light`}>Income</p>
                <p className={`text-lg sm:text-2xl font-light ${textPrimary}`}>${finance.income?.toLocaleString() || '0'}</p>
              </div>
              <div className={`p-3 sm:p-4 ${isDark ? 'bg-black/20' : 'bg-gray-50'} rounded-lg sm:rounded-xl border ${borderColor}`}>
                <p className={`text-[10px] sm:text-xs ${textMuted} mb-1 sm:mb-2 font-light`}>Expenses</p>
                <p className="text-lg sm:text-2xl font-light text-rose-500">${finance.expenses?.toLocaleString() || '0'}</p>
              </div>
            </div>

            <div className={`p-3 sm:p-4 ${isDark ? 'bg-black/20' : 'bg-gray-50'} rounded-lg sm:rounded-xl border ${borderColor}`}>
              <p className={`text-[10px] sm:text-xs ${textMuted} mb-2 sm:mb-3 font-light`}>Savings Rate</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                <span className="text-lg sm:text-2xl font-light text-emerald-500">
                  {finance.income ? Math.round(((finance.income - finance.expenses) / finance.income) * 100) : 0}%
                </span>
                <span className={`text-[10px] sm:text-xs ${textMuted} font-light`}>
                  ${((finance.income || 0) - (finance.expenses || 0)).toLocaleString()} saved
                </span>
              </div>
              <div className={`w-full h-1.5 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" 
                  style={{ width: `${finance.income ? ((finance.income - finance.expenses) / finance.income) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Watering Modal */}
        {showPlantModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-sm ${cardBg} border ${borderColor} rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{plantEmoji}</span>
                <div>
                  <h3 className={`text-lg font-light ${textPrimary}`}>Water Your Plant</h3>
                  <p className={`text-xs ${textMuted} font-light`}>Current streak: {plantStreak} days</p>
                </div>
              </div>
              
              <p className={`text-sm ${textSecondary} mb-6 font-light`}>
                Have you watered your plant today? 🌿
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleWaterPlant(true)}
                  disabled={plantLoading}
                  className="py-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition font-light text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {plantLoading ? 'Loading...' : 'Yeah dude! 💧'}
                </button>
                <button
                  onClick={() => handleWaterPlant(false)}
                  disabled={plantLoading}
                  className="py-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition font-light text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {plantLoading ? 'Loading...' : 'Nah bro I forgot 😢'}
                </button>
              </div>
              
              <button
                onClick={() => setShowPlantModal(false)}
                className={`w-full mt-3 py-2 text-xs ${textMuted} hover:text-emerald-500 transition font-light`}
                disabled={plantLoading}
              >
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* Premium Modals - Mobile Responsive */}
        {showQuoteModal && selectedQuote && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-sm font-medium text-emerald-500 tracking-wider uppercase`}>Quote</h3>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className={`p-2 ${textMuted} hover:text-emerald-500 transition`}
                >
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <p className={`text-base sm:text-lg ${textPrimary} font-light leading-relaxed`}>"{selectedQuote.text}"</p>
                {selectedQuote.author && (
                  <p className={`text-xs sm:text-sm ${textMuted} font-light text-right`}>— {selectedQuote.author}</p>
                )}
                
                <button
                  onClick={() => {
                    fetchNewQuote()
                    setShowQuoteModal(false)
                  }}
                  className="w-full py-2 sm:py-3 text-xs sm:text-sm bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition font-light"
                >
                  New Quote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Book Modal */}
        {showBookModal && selectedBook && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-sm font-medium text-emerald-500 tracking-wider uppercase`}>Book</h3>
                <button
                  onClick={() => setShowBookModal(false)}
                  className={`p-2 ${textMuted} hover:text-emerald-500 transition`}
                >
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <h4 className={`text-lg sm:text-xl ${textPrimary} font-light`}>{selectedBook.title}</h4>
                {selectedBook.author && (
                  <p className={`text-xs sm:text-sm ${textTertiary} font-light`}>by {selectedBook.author}</p>
                )}
                {selectedBook.description && (
                  <p className={`text-xs sm:text-sm ${textMuted} font-light leading-relaxed`}>{selectedBook.description}</p>
                )}
                
                <button
                  onClick={() => {
                    fetchNewBook()
                    setShowBookModal(false)
                  }}
                  className="w-full py-2 sm:py-3 text-xs sm:text-sm bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition font-light mt-2 sm:mt-4"
                >
                  New Book
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fact Modal */}
        {showFactModal && selectedFact && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-sm font-medium text-emerald-500 tracking-wider uppercase`}>Fact</h3>
                <button
                  onClick={() => setShowFactModal(false)}
                  className={`p-2 ${textMuted} hover:text-emerald-500 transition`}
                >
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <p className={`text-sm sm:text-base ${textPrimary} font-light leading-relaxed`}>{selectedFact.text}</p>
                
                <button
                  onClick={() => {
                    fetchNewFact()
                    setShowFactModal(false)
                  }}
                  className="w-full py-2 sm:py-3 text-xs sm:text-sm bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition font-light"
                >
                  New Fact
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard