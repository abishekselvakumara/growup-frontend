import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { useState, useEffect } from 'react'
import { api } from '../services/api'

const Chart = ({ type = 'line', height = 250 }) => {
  const { isDark } = useTheme()
  const [chartData, setChartData] = useState({
    multiPlatform: [],
    financeTrend: []
  })
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 768
  const adjustedHeight = isMobile ? height * 0.8 : height

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    setLoading(true)
    try {
      const [socialStats, transactions] = await Promise.all([
        api.getSocialStats().catch(() => ({})),
        api.getTransactions().catch(() => [])
      ])

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const platforms = ['github', 'leetcode', 'youtube', 'linkedin', 'instagram', 'facebook', 'snapchat']
      const platformValues = {}
      
      platforms.forEach(platform => {
        const data = socialStats[platform]
        platformValues[platform] = data?.value || 0
      })

      const hasData = Object.values(platformValues).some(v => v > 0)
      
      let multiData = []
      if (hasData) {
        multiData = days.map((day, index) => {
          const variation = 0.95 + (Math.random() * 0.1)
          const dataPoint = { day }
          
          platforms.forEach(platform => {
            dataPoint[platform] = Math.round(platformValues[platform] * variation)
          })
          
          return dataPoint
        })
      } else {
        multiData = days.map(day => {
          const dataPoint = { day }
          platforms.forEach(platform => {
            dataPoint[platform] = 0
          })
          return dataPoint
        })
      }

      const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
      const now = new Date()
      
      const financeData = months.map((month, index) => {
        const monthIndex = (now.getMonth() - 5 + index + 12) % 12
        const year = now.getFullYear() - (monthIndex > now.getMonth() ? 1 : 0)
        const monthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
        
        const monthTransactions = transactions.filter(t => {
          if (!t.date) return false
          return t.date.startsWith(monthStr)
        })
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount || 0), 0)
        
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount || 0), 0)
        
        return {
          month: isMobile ? month : month, // Keep as is for now
          income,
          expenses
        }
      })

      setChartData({
        multiPlatform: multiData,
        financeTrend: financeData
      })
    } catch (error) {
      console.error('Error loading chart data:', error)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const platforms = ['github', 'leetcode', 'youtube', 'linkedin', 'instagram', 'facebook', 'snapchat']
      const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
      
      const emptyMultiData = days.map(day => {
        const dataPoint = { day }
        platforms.forEach(platform => {
          dataPoint[platform] = 0
        })
        return dataPoint
      })
      
      const emptyFinanceData = months.map(month => ({
        month,
        income: 0,
        expenses: 0
      }))
      
      setChartData({
        multiPlatform: emptyMultiData,
        financeTrend: emptyFinanceData
      })
    } finally {
      setLoading(false)
    }
  }

  const getThemeColors = () => ({
    text: isDark ? 'rgba(255,255,255,0.9)' : '#1d1d1f',
    textMuted: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
    grid: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)',
    axis: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    tooltipBg: isDark ? '#121212' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    legendText: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
  })

  const colors = getThemeColors()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const allZero = payload.every(entry => entry.value === 0)
      if (allZero) return null
      
      return (
        <div className={`${isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-200'} border rounded-xl p-3 md:p-4 shadow-lg backdrop-blur-sm`}>
          <p className={`text-[10px] md:text-xs ${isDark ? 'text-white/40' : 'text-gray-500'} mb-2 font-light tracking-wide`}>{label}</p>
          {payload.map((entry, index) => (
            entry.value > 0 && (
              <div key={index} className="flex items-center gap-2 py-0.5 md:py-1">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <p className={`text-xs md:text-sm font-light ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  {entry.name}: {entry.name === 'Income' || entry.name === 'Expenses' 
                    ? `$${Number(entry.value).toLocaleString()}` 
                    : entry.value.toLocaleString()}
                </p>
              </div>
            )
          ))}
        </div>
      )
    }
    return null
  }

  // Filter platforms for mobile to avoid overcrowding
  const getVisiblePlatforms = () => {
    if (!isMobile) return ['github', 'leetcode', 'youtube', 'linkedin', 'instagram', 'facebook', 'snapchat']
    
    // On mobile, show only top 4 platforms with data
    const platforms = ['github', 'leetcode', 'youtube', 'linkedin', 'instagram', 'facebook', 'snapchat']
    const platformColors = {
      github: '#6e5494',
      leetcode: '#ffa116',
      youtube: '#ff0000',
      linkedin: '#0a66c2',
      instagram: '#e4405f',
      facebook: '#1877f2',
      snapchat: '#fffc00'
    }
    
    // Get platforms with non-zero data
    const lastDataPoint = chartData.multiPlatform[chartData.multiPlatform.length - 1] || {}
    const platformsWithData = platforms
      .map(p => ({ name: p, value: lastDataPoint[p] || 0, color: platformColors[p] }))
      .filter(p => p.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 4) // Show only top 4 on mobile
      .map(p => p.name)
    
    return platformsWithData.length > 0 ? platformsWithData : ['leetcode', 'github', 'youtube'] // fallback
  }

  if (loading) {
    return (
      <div style={{ height: adjustedHeight }} className="w-full flex items-center justify-center">
        <div className="inline-block w-5 h-5 md:w-6 md:h-6 border border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (type === 'multi') {
    const visiblePlatforms = getVisiblePlatforms()
    
    return (
      <ResponsiveContainer width="100%" height={adjustedHeight}>
        <LineChart data={chartData.multiPlatform} margin={{ top: 5, right: isMobile ? 5 : 10, left: isMobile ? -20 : 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            stroke={colors.axis}
            fontSize={isMobile ? 9 : 11}
            tick={{ fill: colors.textMuted, fontWeight: 300 }}
            dy={isMobile ? 5 : 10}
            interval={isMobile ? 1 : 0} // Show every other day on mobile
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            stroke={colors.axis}
            fontSize={isMobile ? 9 : 11}
            tick={{ fill: colors.textMuted, fontWeight: 300 }}
            dx={isMobile ? -5 : -10}
            width={isMobile ? 30 : 40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: isMobile ? '10px' : '20px',
              opacity: 0.7,
              fontSize: isMobile ? '8px' : '11px',
              fontWeight: 300
            }}
            iconType="circle"
            iconSize={isMobile ? 4 : 6}
            formatter={(value) => {
              // Capitalize platform names
              const displayName = value.charAt(0).toUpperCase() + value.slice(1)
              return <span style={{ color: colors.legendText }}>{displayName}</span>
            }}
          />
          {visiblePlatforms.includes('github') && (
            <Line 
              type="monotone" 
              dataKey="github" 
              stroke="#6e5494" 
              strokeWidth={isMobile ? 1.5 : 2} 
              dot={false} 
              name="github" 
              activeDot={{ r: isMobile ? 3 : 4, fill: '#6e5494', stroke: 'transparent' }}
            />
          )}
          {visiblePlatforms.includes('leetcode') && (
            <Line 
              type="monotone" 
              dataKey="leetcode" 
              stroke="#ffa116" 
              strokeWidth={isMobile ? 1.5 : 2} 
              dot={false} 
              name="leetcode"
              activeDot={{ r: isMobile ? 3 : 4, fill: '#ffa116', stroke: 'transparent' }}
            />
          )}
          {visiblePlatforms.includes('youtube') && (
            <Line 
              type="monotone" 
              dataKey="youtube" 
              stroke="#ff0000" 
              strokeWidth={isMobile ? 1.5 : 2} 
              dot={false} 
              name="youtube"
              activeDot={{ r: isMobile ? 3 : 4, fill: '#ff0000', stroke: 'transparent' }}
            />
          )}
          {visiblePlatforms.includes('linkedin') && (
            <Line 
              type="monotone" 
              dataKey="linkedin" 
              stroke="#0a66c2" 
              strokeWidth={isMobile ? 1.5 : 2} 
              dot={false} 
              name="linkedin"
              activeDot={{ r: isMobile ? 3 : 4, fill: '#0a66c2', stroke: 'transparent' }}
            />
          )}
          {visiblePlatforms.includes('instagram') && (
            <Line 
              type="monotone" 
              dataKey="instagram" 
              stroke="#e4405f" 
              strokeWidth={isMobile ? 1.5 : 2} 
              dot={false} 
              name="instagram"
              activeDot={{ r: isMobile ? 3 : 4, fill: '#e4405f', stroke: 'transparent' }}
            />
          )}
          {visiblePlatforms.includes('facebook') && (
            <Line 
              type="monotone" 
              dataKey="facebook" 
              stroke="#1877f2" 
              strokeWidth={isMobile ? 1.5 : 2} 
              dot={false} 
              name="facebook"
              activeDot={{ r: isMobile ? 3 : 4, fill: '#1877f2', stroke: 'transparent' }}
            />
          )}
          {visiblePlatforms.includes('snapchat') && (
            <Line 
              type="monotone" 
              dataKey="snapchat" 
              stroke="#fffc00" 
              strokeWidth={isMobile ? 1.5 : 2} 
              dot={false} 
              name="snapchat"
              activeDot={{ r: isMobile ? 3 : 4, fill: '#fffc00', stroke: 'transparent' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'finance-trend') {
    return (
      <ResponsiveContainer width="100%" height={adjustedHeight}>
        <LineChart data={chartData.financeTrend} margin={{ top: isMobile ? 10 : 20, right: isMobile ? 10 : 20, left: isMobile ? -10 : 10, bottom: isMobile ? 5 : 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            stroke={colors.axis}
            fontSize={isMobile ? 9 : 11}
            tick={{ fill: colors.textMuted, fontWeight: 300 }}
            dy={isMobile ? 5 : 10}
            interval={isMobile ? 1 : 0}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            stroke={colors.axis}
            fontSize={isMobile ? 9 : 11}
            tick={{ fill: colors.textMuted, fontWeight: 300 }}
            tickFormatter={(value) => value > 0 ? `$${isMobile ? (value / 1000).toFixed(0) + 'k' : (value / 1000).toFixed(0) + 'k'}` : ''}
            dx={isMobile ? -5 : -10}
            width={isMobile ? 35 : 45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: isMobile ? '10px' : '20px',
              opacity: 0.7,
              fontSize: isMobile ? '8px' : '11px',
              fontWeight: 300
            }}
            iconType="circle"
            iconSize={isMobile ? 4 : 6}
            formatter={(value) => <span style={{ color: colors.legendText }}>{value}</span>}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={isMobile ? 2 : 2.5} 
            dot={{ fill: '#10b981', r: isMobile ? 2 : 3, stroke: 'transparent' }}
            activeDot={{ r: isMobile ? 4 : 5, fill: '#10b981', stroke: 'transparent' }}
            name="Income" 
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#f43f5e" 
            strokeWidth={isMobile ? 2 : 2.5} 
            dot={{ fill: '#f43f5e', r: isMobile ? 2 : 3, stroke: 'transparent' }}
            activeDot={{ r: isMobile ? 4 : 5, fill: '#f43f5e', stroke: 'transparent' }}
            name="Expenses" 
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={adjustedHeight}>
      <LineChart data={chartData.multiPlatform} margin={{ top: 5, right: isMobile ? 5 : 10, left: isMobile ? -20 : 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis 
          dataKey="day" 
          axisLine={false}
          tickLine={false}
          stroke={colors.axis}
          fontSize={isMobile ? 9 : 11}
          tick={{ fill: colors.textMuted, fontWeight: 300 }}
          dy={isMobile ? 5 : 10}
          interval={isMobile ? 1 : 0}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          stroke={colors.axis}
          fontSize={isMobile ? 9 : 11}
          tick={{ fill: colors.textMuted, fontWeight: 300 }}
          dx={isMobile ? -5 : -10}
          width={isMobile ? 30 : 40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="leetcode" 
          stroke="#ffa116" 
          strokeWidth={isMobile ? 1.5 : 2} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default Chart