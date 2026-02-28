import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { FiCalendar, FiClock, FiPlus, FiTrash2, FiLoader, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { api } from '../services/api'

const Events = () => {
  const { isDark } = useTheme()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    type: 'normal',
    description: ''
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
  const roseBg = isDark ? 'bg-rose-500/10' : 'bg-rose-100'

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const data = await api.getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const addEvent = async () => {
    if (!newEvent.title.trim()) {
      alert('Please enter an event title')
      return
    }
    
    try {
      const event = await api.createEvent(newEvent)
      setEvents([...events, event])
      setShowAddModal(false)
      setNewEvent({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        type: 'normal',
        description: ''
      })
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    try {
      await api.deleteEvent(id)
      setEvents(events.filter(e => e.id !== id))
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.date === dateStr)
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const daysInMonth = getDaysInMonth(selectedDate)
  const firstDay = getFirstDayOfMonth(selectedDate)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getEventTypeColor = (type) => {
    switch(type) {
      case 'urgent': return isDark ? 'bg-rose-500' : 'bg-rose-500'
      case 'important': return isDark ? 'bg-emerald-500' : 'bg-emerald-500'
      default: return isDark ? 'bg-white/20' : 'bg-gray-300'
    }
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
            <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${textPrimary}`}>Events Calendar</h1>
            <p className={`text-xs sm:text-sm ${textTertiary} font-light`}>
              Schedule and track important dates
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-xs sm:text-sm self-end sm:self-auto`}
          >
            <FiPlus size={14} className="sm:w-4 sm:h-4" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className={`text-base sm:text-lg font-light ${textPrimary}`}>
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
              className={`p-2 border ${borderColor} ${textMuted} hover:${textSecondary} hover:bg-white/5 rounded-xl transition`}
            >
              <FiChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => setSelectedDate(new Date())}
              className={`px-3 sm:px-4 py-2 border ${borderColor} ${textSecondary} hover:bg-white/5 rounded-xl transition font-light text-xs sm:text-sm`}
            >
              Today
            </button>
            <button 
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
              className={`p-2 border ${borderColor} ${textMuted} hover:${textSecondary} hover:bg-white/5 rounded-xl transition`}
            >
              <FiChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={`${cardBg} border ${borderColor} rounded-xl p-3 sm:p-4 lg:p-6 overflow-x-auto`}>
          <div className="min-w-[300px] sm:min-w-0">
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2">
              {/* Day headers */}
              {days.map(day => (
                <div key={day} className={`text-center text-[10px] sm:text-xs font-light ${textMuted} py-2 sm:py-3`}>
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square p-0.5 sm:p-1"></div>
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                const dayEvents = getEventsForDate(date)
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <div 
                    key={day}
                    className={`aspect-square p-0.5 sm:p-1 cursor-pointer group`}
                    onClick={() => {
                      setNewEvent({...newEvent, date: date.toISOString().split('T')[0]})
                      setShowAddModal(true)
                    }}
                  >
                    <div className={`h-full rounded-lg sm:rounded-xl p-1 sm:p-2 transition-all duration-200 ${
                      isToday 
                        ? `${emeraldBg} border ${isDark ? 'border-emerald-500/30' : 'border-emerald-500'}` 
                        : `${nestedBg} border ${borderColor} hover:border-emerald-500/30 hover:bg-white/5`
                    }`}>
                      <div className="h-full flex flex-col">
                        <span className={`text-[10px] sm:text-xs font-light mb-0.5 sm:mb-1 ${
                          isToday ? emeraldText : textSecondary
                        }`}>
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div 
                                key={event.id}
                                className={`text-[6px] sm:text-[8px] p-0.5 sm:p-1 rounded truncate ${
                                  event.type === 'urgent' 
                                    ? `${roseBg} ${roseText}` 
                                    : event.type === 'important'
                                      ? `${emeraldBg} ${emeraldText}`
                                      : isDark ? 'bg-white/5 text-white/40' : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className={`text-[6px] sm:text-[8px] ${textVeryMuted}`}>
                                +{dayEvents.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-6`}>
          <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-3 sm:mb-4 uppercase`}>
            Upcoming Events
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {events
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .filter(e => new Date(e.date) >= new Date())
              .slice(0, 5)
              .map((event) => (
                <div 
                  key={event.id} 
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 ${nestedBg} border ${borderColor} rounded-xl hover:border-emerald-500/30 transition`}
                >
                  <div className="flex items-start gap-3 sm:items-center">
                    <div className={`w-1 h-10 sm:h-12 rounded-full ${getEventTypeColor(event.type)} flex-shrink-0 mt-1 sm:mt-0`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-light ${textPrimary} truncate`}>{event.title}</h4>
                      <p className={`text-xs ${textMuted} font-light mt-1`}>
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} at {event.time}
                      </p>
                      {event.description && (
                        <p className={`text-[10px] sm:text-xs ${textVeryMuted} font-light mt-1 line-clamp-1`}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteEvent(event.id)}
                    className={`opacity-0 group-hover:opacity-100 transition p-2 ${textMuted} hover:${roseText} rounded-lg mt-2 sm:mt-0 self-end sm:self-auto`}
                  >
                    <FiTrash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}
            
            {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <p className={`text-sm ${textVeryMuted} font-light`}>No upcoming events</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-light ${emeraldText}`}>New Event</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 ${textMuted} hover:${textPrimary} transition`}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Title</label>
                  <input 
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    placeholder="Event title"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Description</label>
                  <textarea 
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light h-20 resize-none`}
                    placeholder="Event description (optional)"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Date</label>
                    <input 
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Time</label>
                    <input 
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    />
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Event Type</label>
                  <select 
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={addEvent}
                  className={`flex-1 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm`}
                >
                  Add Event
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
      </div>
    </div>
  )
}

export default Events