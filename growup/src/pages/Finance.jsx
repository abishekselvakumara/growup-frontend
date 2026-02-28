import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload, FiPlus, FiTrash2, FiLoader, FiX } from 'react-icons/fi'
import * as XLSX from 'xlsx'
import { api } from '../services/api'

const Finance = () => {
  const { isDark } = useTheme()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0 })
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
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
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [transactionsData, summaryData] = await Promise.all([
        api.getTransactions(),
        api.getFinanceSummary()
      ])
      setTransactions(transactionsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async () => {
    if (!newTransaction.description.trim() || !newTransaction.amount || !newTransaction.category.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    try {
      const transaction = await api.createTransaction({
        ...newTransaction,
        amount: Number(newTransaction.amount)
      })
      setTransactions([...transactions, transaction])
      const newSummary = await api.getFinanceSummary()
      setSummary(newSummary)
      setShowAddModal(false)
      setNewTransaction({
        type: 'income',
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const deleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return
    try {
      await api.deleteTransaction(id)
      setTransactions(transactions.filter(t => t.id !== id))
      const newSummary = await api.getFinanceSummary()
      setSummary(newSummary)
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
      Type: t.type,
      Description: t.description,
      Amount: `$${t.amount}`,
      Category: t.category,
      Date: t.date
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
    XLSX.writeFile(workbook, `finance_${new Date().toISOString().split('T')[0]}.xlsx`)
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
            <h1 className={`text-2xl sm:text-3xl font-light tracking-tight ${textPrimary}`}>Finance</h1>
            <p className={`text-xs sm:text-sm ${textTertiary} font-light`}>
              Track income, expenses, and export reports
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-xs sm:text-sm`}
            >
              <FiPlus size={14} className="sm:w-4 sm:h-4" />
              <span>Add Transaction</span>
            </button>
            <button 
              onClick={exportToExcel}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 border ${borderColor} ${textSecondary} rounded-xl hover:bg-white/5 transition font-light text-xs sm:text-sm`}
            >
              <FiDownload size={14} className="sm:w-4 sm:h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Balance Card */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className={`text-xs font-light ${textTertiary}`}>Total Balance</p>
              <FiDollarSign className={textTertiary} size={18} />
            </div>
            <p className={`text-2xl sm:text-3xl font-light ${textPrimary}`}>
              ${((summary.totalIncome || 0) - (summary.totalExpenses || 0)).toLocaleString()}
            </p>
            <p className={`text-xs ${textMuted} font-light mt-2 sm:mt-3`}>Across all accounts</p>
          </div>

          {/* Income Card */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className={`text-xs font-light ${textTertiary}`}>Total Income</p>
              <FiTrendingUp className={emeraldText} size={18} />
            </div>
            <p className={`text-2xl sm:text-3xl font-light ${emeraldText}`}>
              ${(summary.totalIncome || 0).toLocaleString()}
            </p>
            <p className={`text-xs ${textMuted} font-light mt-2 sm:mt-3`}>
              {transactions.filter(t => t.type === 'income').length} transactions
            </p>
          </div>

          {/* Expenses Card */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className={`text-xs font-light ${textTertiary}`}>Total Expenses</p>
              <FiTrendingDown className={roseText} size={18} />
            </div>
            <p className={`text-2xl sm:text-3xl font-light ${roseText}`}>
              ${(summary.totalExpenses || 0).toLocaleString()}
            </p>
            <p className={`text-xs ${textMuted} font-light mt-2 sm:mt-3`}>
              {transactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className={`${cardBg} border ${borderColor} rounded-xl p-4 sm:p-5 lg:p-6`}>
          <h3 className={`text-xs sm:text-sm font-light ${textTertiary} tracking-wider mb-3 sm:mb-4 uppercase`}>
            Recent Transactions
          </h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="min-w-[600px] lg:min-w-0">
              <table className="w-full">
                <thead>
                  <tr className={`text-left text-xs font-light ${textMuted} border-b ${borderColor}`}>
                    <th className="pb-2 sm:pb-3 font-light">Type</th>
                    <th className="pb-2 sm:pb-3 font-light">Description</th>
                    <th className="pb-2 sm:pb-3 font-light">Category</th>
                    <th className="pb-2 sm:pb-3 font-light">Amount</th>
                    <th className="pb-2 sm:pb-3 font-light">Date</th>
                    <th className="pb-2 sm:pb-3 font-light"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className={`border-b ${borderColor} last:border-0`}>
                        <td className="py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-light ${
                            transaction.type === 'income' 
                              ? `${emeraldBg} ${emeraldText}`
                              : `${roseBg} ${roseText}`
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`py-3 sm:py-4 text-xs sm:text-sm font-light ${textPrimary}`}>
                          {transaction.description}
                        </td>
                        <td className={`py-3 sm:py-4 text-xs sm:text-sm font-light ${textTertiary}`}>
                          {transaction.category}
                        </td>
                        <td className={`py-3 sm:py-4 text-xs sm:text-sm font-light ${
                          transaction.type === 'income' 
                            ? emeraldText 
                            : roseText
                        }`}>
                          ${Number(transaction.amount).toLocaleString()}
                        </td>
                        <td className={`py-3 sm:py-4 text-xs sm:text-sm font-light ${textTertiary}`}>
                          {transaction.date}
                        </td>
                        <td className="py-3 sm:py-4">
                          <button 
                            onClick={() => deleteTransaction(transaction.id)}
                            className={`${textMuted} hover:${roseText} transition`}
                          >
                            <FiTrash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 sm:py-12 text-center">
                        <p className={`text-sm ${textVeryMuted} font-light`}>No transactions yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md ${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-light ${emeraldText}`}>New Transaction</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 ${textMuted} hover:${textPrimary} transition`}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Type</label>
                  <select 
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                  >
                    <option value="income" className={cardBg}>Income</option>
                    <option value="expense" className={cardBg}>Expense</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Description</label>
                  <input 
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    placeholder="Enter description"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Category</label>
                  <input 
                    type="text"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    placeholder="e.g., Salary, Food, Rent"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Amount ($)</label>
                  <input 
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} placeholder:${textVeryMuted} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className={`block text-xs ${textTertiary} mb-2 font-light`}>Date</label>
                  <input 
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className={`w-full p-3 ${nestedBg} border ${borderColor} rounded-xl text-sm ${textPrimary} focus:outline-none focus:border-emerald-500/30 transition font-light`}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={addTransaction}
                  className={`flex-1 py-3 ${emeraldBg} ${emeraldText} rounded-xl hover:opacity-80 transition font-light text-sm`}
                >
                  Add Transaction
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

export default Finance