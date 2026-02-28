import { useTheme } from '../context/ThemeContext'
import { FiSearch, FiBell, FiUser, FiX, FiCalendar, FiAlertCircle, FiClock, FiChevronRight, FiLogOut } from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const Navbar = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(() => {
    return JSON.parse(localStorage.getItem('user') || '{}')
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const searchRef = useRef(null)
  const notificationRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const userName = userData.fullName || 'Julia James'
  const userInitials = userData.initials || 'JJ'

  // Load profile picture on mount and listen for changes
  useEffect(() => {
    loadProfilePicture()
    
    // Listen for storage changes (when profile pic updates in settings)
    const handleStorageChange = (e) => {
      if (e.key === `profilePicture_${userData.username}`) {
        loadProfilePicture()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [userData.username])

  const loadProfilePicture = () => {
    if (userData.username) {
      const savedPic = localStorage.getItem(`profilePicture_${userData.username}`)
      setProfilePicture(savedPic)
    }
  }

  // Reload user data when component mounts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserData(user)
    loadProfilePicture()
  }, [])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const [todayEvents, upcomingEvents] = await Promise.all([
        api.getTodayEvents().catch(() => []),
        api.getUpcomingEvents().catch(() => [])
      ])

      const notificationsList = []
      const today = new Date().toDateString()
      
      // Get stored notification states
      const storedNotifications = JSON.parse(localStorage.getItem('notificationStates') || '{}')
      const lastShown = JSON.parse(localStorage.getItem('lastShownNotifications') || '{}')

      // Add today's events
      if (todayEvents && todayEvents.length > 0) {
        todayEvents.forEach(event => {
          const notificationId = `today-${event.id}`
          notificationsList.push({
            id: notificationId,
            title: event.title,
            description: `Today at ${event.time || '12:00'}`,
            type: 'event',
            priority: 'high',
            read: storedNotifications[notificationId]?.read || false,
            action: () => navigate('/events'),
            icon: <FiCalendar className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
          })
        })
      }

      // Add upcoming important events
      if (upcomingEvents && upcomingEvents.length > 0) {
        const importantEvents = upcomingEvents
          .filter(e => e.type === 'IMPORTANT' || e.type === 'URGENT')
          .slice(0, 5)

        importantEvents.forEach(event => {
          const notificationId = `upcoming-${event.id}`
          const eventDate = new Date(event.date)
          const today = new Date()
          const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
          
          notificationsList.push({
            id: notificationId,
            title: event.title,
            description: `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`,
            type: 'reminder',
            priority: event.type === 'URGENT' ? 'urgent' : 'important',
            read: storedNotifications[notificationId]?.read || false,
            action: () => navigate('/events'),
            icon: <FiAlertCircle className={event.type === 'URGENT' ? 'text-rose-500' : 'text-emerald-500'} />
          })
        })
      }

      // Only add daily reminder if there are no event notifications
      if (notificationsList.length === 0) {
        if (lastShown.dailyReminder !== today) {
          const now = new Date()
          const hours = now.getHours()
          
          let greeting = 'Good morning!'
          if (hours >= 12 && hours < 17) greeting = 'Good afternoon!'
          if (hours >= 17) greeting = 'Good evening!'

          notificationsList.push({
            id: 'daily-reminder',
            title: greeting,
            description: 'How is your growth journey going today?',
            type: 'reminder',
            priority: 'normal',
            read: storedNotifications['daily-reminder']?.read || false,
            action: () => navigate('/'),
            icon: <FiClock className={isDark ? 'text-emerald-400/70' : 'text-emerald-600/70'} />
          })

          localStorage.setItem('lastShownNotifications', JSON.stringify({
            ...lastShown,
            dailyReminder: today
          }))
        }
      }

      const priorityOrder = { urgent: 0, high: 1, important: 2, normal: 3 }
      notificationsList.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

      setNotifications(notificationsList)
      setUnreadCount(notificationsList.filter(n => !n.read).length)
      
      const newStoredStates = { ...storedNotifications }
      notificationsList.forEach(notification => {
        if (!newStoredStates[notification.id]) {
          newStoredStates[notification.id] = { read: notification.read }
        }
      })
      localStorage.setItem('notificationStates', JSON.stringify(newStoredStates))
      
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      
      const storedStates = JSON.parse(localStorage.getItem('notificationStates') || '{}')
      storedStates[notificationId] = { read: true }
      localStorage.setItem('notificationStates', JSON.stringify(storedStates))
      
      return updated
    })
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      
      const storedStates = {}
      updated.forEach(n => {
        storedStates[n.id] = { read: true }
      })
      localStorage.setItem('notificationStates', JSON.stringify(storedStates))
      
      return updated
    })
    setUnreadCount(0)
    
    if (window.innerWidth < 768) {
      setShowNotifications(false)
    }
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    if (notification.action) notification.action()
    setShowNotifications(false)
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch()
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const performSearch = async () => {
    setIsSearching(true)
    try {
      const [notes, diaryEntries, events] = await Promise.all([
        api.getNotes().catch(() => []),
        api.getDiaryEntries().catch(() => []),
        api.getEvents().catch(() => [])
      ])

      const query = searchQuery.toLowerCase()
      
      const filteredNotes = (notes || [])
        .filter(note => note.title?.toLowerCase().includes(query) || note.content?.toLowerCase().includes(query))
        .map(note => ({ ...note, type: 'note', url: '/notes', preview: note.content?.substring(0, 60) + '…' }))

      const filteredDiary = (diaryEntries || [])
        .filter(entry => entry.title?.toLowerCase().includes(query) || entry.content?.toLowerCase().includes(query))
        .map(entry => ({ ...entry, type: 'diary', url: '/diary', preview: entry.content?.substring(0, 60) + '…' }))

      const filteredEvents = (events || [])
        .filter(event => event.title?.toLowerCase().includes(query) || event.description?.toLowerCase().includes(query))
        .map(event => ({ ...event, type: 'event', url: '/events', preview: event.description?.substring(0, 60) + '…' }))

      const allResults = [
        ...filteredNotes.slice(0, 3),
        ...filteredDiary.slice(0, 3),
        ...filteredEvents.slice(0, 3)
      ].slice(0, 8)

      setSearchResults(allResults)
      setShowResults(allResults.length > 0)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleResultClick = (result) => {
    setShowResults(false)
    setSearchQuery('')
    setIsMobileMenuOpen(false)
    navigate(result.url)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'note': return '📝'
      case 'diary': return '📔'
      case 'event': return '📅'
      default: return '📄'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-rose-500'
      case 'high': return 'bg-emerald-500'
      case 'important': return 'bg-emerald-400'
      default: return isDark ? 'bg-white/20' : 'bg-gray-300'
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Don't remove profile picture - it should persist
    navigate('/login')
  }

  return (
    <nav className={`h-16 border-b flex items-center justify-between px-4 md:px-6 transition-colors ${
      isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-[#e5e5ea]'
    }`}>
      {/* Logo - always visible */}
      <div className="flex items-center">
        <h1 className={`text-lg md:text-xl font-light tracking-tight whitespace-nowrap ${
          isDark ? 'text-white/90' : 'text-[#1d1d1f]'
        }`}>
          <span className="hidden xs:inline">GROWUP GLOWUP</span>
          <span className="xs:hidden">GROWUP GLOWUP</span>
        </h1>
      </div>
      
      {/* Desktop Navigation - hidden on mobile */}
      <div className="hidden md:flex items-center gap-6">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-white/20' : 'text-gray-400'
            }`} size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              placeholder="Search..."
              className={`w-64 pl-10 pr-8 py-2 rounded-xl border text-sm transition font-light ${
                isDark 
                  ? 'bg-black/40 border-white/5 text-white/90 placeholder:text-white/20 focus:border-emerald-500/30' 
                  : 'bg-gray-50 border-gray-200 text-[#1d1d1f] placeholder:text-gray-400 focus:border-emerald-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200'
                }`}
              >
                <FiX size={14} className={isDark ? 'text-white/30' : 'text-gray-500'} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg overflow-hidden z-50 border ${
              isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-200'
            }`}>
              {isSearching ? (
                <div className="p-4 text-center">
                  <div className="inline-block w-4 h-4 border border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                  <p className={`text-xs mt-2 font-light ${
                    isDark ? 'text-white/30' : 'text-gray-500'
                  }`}>Searching...</p>
                </div>
              ) : (
                <>
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={`w-full text-left px-4 py-3 transition flex items-start gap-3 ${
                        isDark 
                          ? 'hover:bg-white/5 border-white/5' 
                          : 'hover:bg-gray-50 border-gray-200'
                      } ${index !== searchResults.length - 1 ? 'border-b' : ''}`}
                    >
                      <span className="text-lg opacity-50">{getTypeIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-light truncate ${
                            isDark ? 'text-white/90' : 'text-[#1d1d1f]'
                          }`}>
                            {result.title}
                          </h4>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                            isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {result.type}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 truncate font-light ${
                          isDark ? 'text-white/30' : 'text-gray-500'
                        }`}>
                          {result.preview || result.description || 'No preview'}
                        </p>
                      </div>
                    </button>
                  ))}
                  
                  {searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="p-4 text-center">
                      <p className={`text-xs font-light ${
                        isDark ? 'text-white/30' : 'text-gray-500'
                      }`}>No results for "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition ${
              isDark 
                ? 'text-white/30 hover:text-emerald-400 hover:bg-white/5' 
                : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-100'
            }`}
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center px-1 font-light">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </>
            )}
          </button>

          {/* Desktop Notifications Dropdown */}
          {showNotifications && (
            <div className={`absolute top-full right-0 mt-2 w-80 rounded-xl shadow-lg overflow-hidden z-50 border hidden md:block ${
              isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-200'
            }`}>
              <div className={`flex items-center justify-between p-4 border-b ${
                isDark ? 'border-white/5' : 'border-gray-200'
              }`}>
                <h3 className={`text-sm font-light ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={`text-xs transition font-light ${
                      isDark ? 'text-white/30 hover:text-emerald-400' : 'text-gray-500 hover:text-emerald-600'
                    }`}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 transition flex items-start gap-3 ${
                        isDark 
                          ? 'hover:bg-white/5' 
                          : 'hover:bg-gray-50'
                      } ${!notification.read ? (isDark ? 'bg-emerald-500/5' : 'bg-emerald-50') : ''}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-light ${
                            isDark ? 'text-white/90' : 'text-[#1d1d1f]'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(notification.priority)}`} />
                          )}
                        </div>
                        <p className={`text-xs mt-1 font-light ${
                          isDark ? 'text-white/30' : 'text-gray-500'
                        }`}>
                          {notification.description}
                        </p>
                      </div>
                      <FiChevronRight size={14} className={isDark ? 'text-white/20' : 'text-gray-400'} />
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className={`text-sm font-light ${
                      isDark ? 'text-white/20' : 'text-gray-400'
                    }`}>No notifications</p>
                  </div>
                )}
              </div>

              <div className={`p-2 border-t ${
                isDark ? 'border-white/5' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    setShowNotifications(false)
                    navigate('/events')
                  }}
                  className={`w-full text-center text-xs py-2 rounded-lg transition font-light ${
                    isDark ? 'text-white/30 hover:text-emerald-400' : 'text-gray-500 hover:text-emerald-600'
                  }`}
                >
                  View all events
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User - with profile picture support */}
        <div className={`flex items-center gap-3 pl-2 border-l ${
          isDark ? 'border-white/5' : 'border-gray-200'
        }`}>
          <div className="text-right hidden lg:block">
            <p className={`text-sm font-light ${
              isDark ? 'text-white/90' : 'text-[#1d1d1f]'
            }`}>{userName}</p>
            <p className={`text-xs font-light truncate max-w-[150px] ${
              isDark ? 'text-white/30' : 'text-gray-500'
            }`}>
              {userData.email || 'user@example.com'}
            </p>
          </div>
          
          {/* Profile Picture or Initials */}
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt={userName}
              className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500/30"
            />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-light text-sm flex-shrink-0">
              {userInitials}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex md:hidden items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 rounded-xl transition ${
            isDark 
              ? 'text-white/30 hover:text-emerald-400' 
              : 'text-gray-600 hover:text-emerald-600'
          }`}
        >
          <FiSearch size={20} />
        </button>

        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative p-2 rounded-xl transition ${
            isDark 
              ? 'text-white/30 hover:text-emerald-400' 
              : 'text-gray-600 hover:text-emerald-600'
          }`}
        >
          <FiBell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center px-1 font-light">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Mobile Profile Picture or Initials */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`w-9 h-9 flex-shrink-0 ${
            profilePicture 
              ? 'rounded-xl overflow-hidden border-2 border-emerald-500/30' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-light text-sm'
          }`}
        >
          {profilePicture ? (
            <img src={profilePicture} alt={userName} className="w-full h-full object-cover" />
          ) : (
            userInitials
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className={`absolute top-16 left-0 right-0 z-50 border-b md:hidden ${
            isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-200'
          }`}
        >
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-white/20' : 'text-gray-400'
                }`} size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  placeholder="Search notes, diary entries, events..."
                  className={`w-full pl-10 pr-8 py-3 rounded-xl border text-sm transition font-light ${
                    isDark 
                      ? 'bg-black/40 border-white/5 text-white/90 placeholder:text-white/30 focus:border-emerald-500/30' 
                      : 'bg-gray-50 border-gray-200 text-[#1d1d1f] placeholder:text-gray-400 focus:border-emerald-500'
                  }`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200'
                    }`}
                  >
                    <FiX size={14} className={isDark ? 'text-white/30' : 'text-gray-500'} />
                  </button>
                )}
              </div>

              {/* Mobile Search Results */}
              {showResults && (
                <div className={`mt-2 rounded-xl shadow-lg overflow-hidden border ${
                  isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-200'
                }`}>
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="inline-block w-4 h-4 border border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                      <p className={`text-xs mt-2 font-light ${
                        isDark ? 'text-white/30' : 'text-gray-500'
                      }`}>Searching...</p>
                    </div>
                  ) : (
                    <>
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className={`w-full text-left px-4 py-3 transition flex items-start gap-3 ${
                            isDark 
                              ? 'hover:bg-white/5 border-white/5' 
                              : 'hover:bg-gray-50 border-gray-200'
                          } ${index !== searchResults.length - 1 ? 'border-b' : ''}`}
                        >
                          <span className="text-lg opacity-50">{getTypeIcon(result.type)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-light truncate ${
                              isDark ? 'text-white/90' : 'text-[#1d1d1f]'
                            }`}>
                              {result.title}
                            </h4>
                            <p className={`text-xs mt-1 truncate font-light ${
                              isDark ? 'text-white/30' : 'text-gray-500'
                            }`}>
                              {result.preview || result.description || 'No preview'}
                            </p>
                          </div>
                        </button>
                      ))}
                      
                      {searchResults.length === 0 && searchQuery.length >= 2 && (
                        <div className="p-4 text-center">
                          <p className={`text-xs font-light ${
                            isDark ? 'text-white/30' : 'text-gray-500'
                          }`}>No results for "{searchQuery}"</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile User Info with Profile Picture */}
            <div className={`flex items-center gap-3 pt-2 border-t ${
              isDark ? 'border-white/5' : 'border-gray-200'
            }`}>
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt={userName}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-500/30"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-light text-base">
                  {userInitials}
                </div>
              )}
              <div className="flex-1">
                <p className={`text-sm font-light ${
                  isDark ? 'text-white/90' : 'text-[#1d1d1f]'
                }`}>{userName}</p>
                <p className={`text-xs font-light truncate ${
                  isDark ? 'text-white/30' : 'text-gray-500'
                }`}>
                  {userData.email || 'user@example.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-xl transition ${
                  isDark ? 'hover:bg-white/5 text-white/30' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FiLogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Notifications Dropdown */}
      {showNotifications && (
        <div className={`fixed inset-x-4 top-20 z-50 rounded-xl shadow-lg overflow-hidden border md:hidden ${
          isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-200'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-white/5' : 'border-gray-200'
          }`}>
            <h3 className={`text-sm font-light ${
              isDark ? 'text-white/60' : 'text-gray-600'
            }`}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={`text-xs transition font-light ${
                  isDark ? 'text-white/30 hover:text-emerald-400' : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 transition flex items-start gap-3 ${
                    isDark 
                      ? 'hover:bg-white/5' 
                      : 'hover:bg-gray-50'
                  } ${!notification.read ? (isDark ? 'bg-emerald-500/5' : 'bg-emerald-50') : ''}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-light ${
                        isDark ? 'text-white/90' : 'text-[#1d1d1f]'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(notification.priority)}`} />
                      )}
                    </div>
                    <p className={`text-xs mt-1 font-light ${
                      isDark ? 'text-white/30' : 'text-gray-500'
                    }`}>
                      {notification.description}
                    </p>
                  </div>
                  <FiChevronRight size={14} className={isDark ? 'text-white/20' : 'text-gray-400'} />
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className={`text-sm font-light ${
                  isDark ? 'text-white/20' : 'text-gray-400'
                }`}>No notifications</p>
              </div>
            )}
          </div>

          <div className={`p-2 border-t ${
            isDark ? 'border-white/5' : 'border-gray-200'
          }`}>
            <button
              onClick={() => {
                setShowNotifications(false)
                navigate('/events')
              }}
              className={`w-full text-center text-xs py-2 rounded-lg transition font-light ${
                isDark ? 'text-white/30 hover:text-emerald-400' : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              View all events
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar