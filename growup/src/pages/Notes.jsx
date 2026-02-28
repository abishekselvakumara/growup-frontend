import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { FiBook, FiStar, FiTrash2, FiEdit2, FiPlus, FiLoader, FiX } from 'react-icons/fi'
import { api } from '../services/api'

const Notes = () => {
  const { isDark } = useTheme()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    important: false,
    date: new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
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

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const data = await api.getNotes()
      setNotes(data)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in both title and content')
      return
    }
    
    try {
      const note = await api.createNote({
        ...newNote,
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      })
      setNotes([...notes, note])
      setShowAddModal(false)
      setNewNote({ 
        title: '', 
        content: '', 
        important: false, 
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      })
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const updateNote = async () => {
    if (!editingNote.title.trim() || !editingNote.content.trim()) {
      alert('Please fill in both title and content')
      return
    }
    
    try {
      const updated = await api.updateNote(editingNote.id, editingNote)
      setNotes(notes.map(note => note.id === editingNote.id ? updated : note))
      setEditingNote(null)
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return
    try {
      await api.deleteNote(id)
      setNotes(notes.filter(note => note.id !== id))
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const toggleImportant = async (id) => {
    const note = notes.find(n => n.id === id)
    try {
      const updated = await api.updateNote(id, { ...note, important: !note.important })
      setNotes(notes.map(n => n.id === id ? updated : n))
    } catch (error) {
      console.error('Error toggling important:', error)
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
            <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${textPrimary}`}>Notes</h1>
            <p className={`text-xs sm:text-sm ${textTertiary} font-light`}>
              Capture your thoughts and ideas
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-xs sm:text-sm self-end sm:self-auto`}
          >
            <FiPlus size={14} className="sm:w-4 sm:h-4" />
            <span>New Note</span>
          </button>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className={`${cardBg} border ${borderColor} rounded-2xl p-8 sm:p-12 text-center`}>
            <FiBook className={`mx-auto mb-4 ${textVeryMuted}`} size={48} />
            <h3 className={`text-lg sm:text-xl font-light ${textSecondary} mb-2`}>No notes yet</h3>
            <p className={`text-xs sm:text-sm ${textMuted} font-light mb-6`}>
              Start capturing your thoughts
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className={`px-6 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm inline-flex items-center gap-2`}
            >
              <FiPlus size={16} />
              Create First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className={`group ${cardBg} border ${borderColor} hover:border-emerald-500/30 rounded-xl p-4 sm:p-5 transition-all duration-300 relative`}
              >
                {note.important && (
  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
    <FiStar className={`${emeraldText} fill-current`} size={14} />
  </div>
)}
                
                <h3 className={`text-sm sm:text-base font-light ${textPrimary} mb-2 pr-6 sm:pr-8 line-clamp-2`}>
                  {note.title}
                </h3>
                
                <p className={`text-xs sm:text-sm ${textTertiary} font-light mb-3 sm:mb-4 line-clamp-3`}>
                  {note.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] sm:text-xs ${textVeryMuted} font-light`}>{note.date}</span>
                  <div className="flex gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button 
                      onClick={() => toggleImportant(note.id)}
                      className={`p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition ${
                        note.important ? emeraldText : `${textMuted} hover:${textSecondary}`
                      }`}
                    >
                      <FiStar size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button 
                      onClick={() => setEditingNote(note)}
                      className={`p-1.5 sm:p-2 rounded-lg hover:bg-white/5 ${textMuted} hover:${textSecondary} transition`}
                    >
                      <FiEdit2 size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className={`p-1.5 sm:p-2 rounded-lg hover:bg-white/5 ${textMuted} hover:${roseText} transition`}
                    >
                      <FiTrash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Note Modal */}
        {(showAddModal || editingNote) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-lg ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-light ${emeraldText}`}>
                  {editingNote ? 'Edit Note' : 'New Note'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingNote(null)
                  }}
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
                    value={editingNote ? editingNote.title : newNote.title}
                    onChange={(e) => editingNote 
                      ? setEditingNote({...editingNote, title: e.target.value})
                      : setNewNote({...newNote, title: e.target.value})
                    }
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    placeholder="Note title"
                    autoFocus
                  />
                </div>

                {/* Content */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Content</label>
                  <textarea 
                    value={editingNote ? editingNote.content : newNote.content}
                    onChange={(e) => editingNote
                      ? setEditingNote({...editingNote, content: e.target.value})
                      : setNewNote({...newNote, content: e.target.value})
                    }
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light h-32 resize-none`}
                    placeholder="Write your thoughts..."
                  />
                </div>

                {/* Important Checkbox */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => editingNote
                      ? setEditingNote({...editingNote, important: !editingNote.important})
                      : setNewNote({...newNote, important: !newNote.important})
                    }
                    className={`w-5 h-5 rounded border transition flex items-center justify-center ${
                      (editingNote ? editingNote.important : newNote.important)
                        ? `bg-emerald-500 border-emerald-500 text-white`
                        : `border ${borderColor} hover:border-emerald-500/30`
                    }`}
                  >
                    {(editingNote ? editingNote.important : newNote.important) && (
                      <span className="text-xs">✓</span>
                    )}
                  </button>
                  <span className={`text-sm ${textSecondary} font-light`}>Mark as important</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={editingNote ? updateNote : addNote}
                  className={`flex-1 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm`}
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingNote(null)
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

export default Notes