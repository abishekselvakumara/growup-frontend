import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiEye, FiDatabase, FiPhone, FiMail, FiShield } from 'react-icons/fi'

// Import images
import gokuBg from '../assets/goku.png'
import plantLogo from '../assets/plantlogo.png'

const Privacy = () => {
  const { isDark } = useTheme()

  // Theme-aware classes
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f7]'
  const textPrimary = isDark ? 'text-white' : 'text-[#1d1d1f]'
  const textSecondary = isDark ? 'text-white/70' : 'text-gray-700'
  const textTertiary = isDark ? 'text-white/50' : 'text-gray-500'
  const cardBg = isDark ? 'bg-[#121212]/80 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200/50'

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300 relative overflow-hidden`}>
      {/* Goku Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 mix-blend-multiply"></div>
        <img 
          src={gokuBg} 
          alt=""
          className="w-full h-full object-cover object-center opacity-[0.06] dark:opacity-[0.04] scale-105"
          style={{ filter: 'grayscale(0.2) contrast(1.1)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Back Button */}
        <Link 
          to="/register" 
          className={`inline-flex items-center gap-2 mb-6 text-sm ${textTertiary} hover:text-emerald-500 transition`}
        >
          <FiArrowLeft size={16} />
          Back to Registration
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src={plantLogo} 
              alt="growup+" 
              className="w-8 h-8 object-contain"
              style={{ filter: isDark ? 'brightness(1.2) contrast(1.1)' : 'none' }}
            />
            <span className={`text-2xl font-light tracking-tight ${textPrimary}`}>growup+</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-light ${textPrimary} mb-2`}>Privacy Policy</h1>
          <p className={`text-sm ${textTertiary}`}>
            We respect your privacy (and your plants) 
          </p>
        </div>

        {/* Main Content Card */}
        <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8 space-y-6`}>
          
          {/* What We Collect */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiEye size={18} />
              <h2 className="text-base font-light">What We Collect</h2>
            </div>
            <div className={`pl-7 ${textSecondary} text-sm`}>
              <ul className="list-disc list-inside space-y-1">
                <li>Your name (so we know who's growing)</li>
                <li>Your email (for motivational spam — kidding, just important updates)</li>
                <li>Social media stats (to track your glow-up)</li>
                <li>Your daily achievements (so we can celebrate with you)</li>
                <li>Your plant watering streak (don't let it die!)</li>
              </ul>
            </div>
          </section>

          {/* What We Don't Collect */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiShield size={18} />
              <h2 className="text-base font-light">What We DON'T Collect</h2>
            </div>
            <div className={`pl-7 ${textSecondary} text-sm`}>
              <ul className="list-disc list-inside space-y-1">
                <li>Your passwords (we're not that kind of creepy)</li>
                <li>Your credit card info (we're free, remember?)</li>
                <li>Your location (unless you're growing in a secret garden)</li>
                <li>Your browsing history (we don't care what you do on other sites)</li>
              </ul>
            </div>
          </section>

          {/* Data Storage */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiDatabase size={18} />
              <h2 className="text-base font-light">Data Storage</h2>
            </div>
            <div className={`pl-7 ${textSecondary} text-sm`}>
              <p>
                Your data is stored safely in our digital greenhouse. We back it up regularly 
                so you never lose your precious growth history. Even if our servers have a bad day, 
                your progress lives on.
              </p>
            </div>
          </section>

          {/* Third Parties */}
          <section className="space-y-2">
            <h2 className={`text-base font-light ${textPrimary} pl-7`}>Third Parties</h2>
            <div className={`pl-7 ${textSecondary} text-sm`}>
              <p>
                We don't sell your data to third parties. We're not that kind of platform. 
                The only third parties involved are:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your future self (thankful for starting this journey)</li>
                <li>Your plants (they're rooting for you)</li>
                <li>Goku (watching over your progress from the background)</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section className="space-y-2">
            <h2 className={`text-base font-light ${textPrimary} pl-7`}>Your Rights</h2>
            <div className={`pl-7 ${textSecondary} text-sm`}>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access your data anytime</li>
                <li>Delete your account (but why would you?)</li>
                <li>Export your growth history</li>
                <li>Brag about your achievements on social media</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiMail size={18} />
              <h2 className="text-base font-light">Contact Us</h2>
            </div>
            <div className={`pl-7 ${textSecondary} text-sm`}>
              <p>
                Questions? Concerns? Want to share your plant photos? 
                Reach out to us at{' '}
                <a href="mailto:privacy@growup.plus" className="text-emerald-500 hover:text-emerald-600">
                  privacy@growup.plus
                </a>
              </p>
              <p className="mt-2 text-xs text-emerald-500">
                We promise to respond faster than your plants grow 🌱
              </p>
            </div>
          </section>

          {/* Last Updated */}
          <div className={`pt-4 border-t ${borderColor}`}>
            <p className={`text-xs ${textTertiary} text-center`}>
              Last updated: {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link to="/terms" className={`text-xs ${textTertiary} hover:text-emerald-500 transition`}>
            Terms
          </Link>
          <span className={`text-xs ${textTertiary}`}>•</span>
          <Link to="/privacy" className={`text-xs ${textTertiary} hover:text-emerald-500 transition`}>
            Privacy
          </Link>
          <span className={`text-xs ${textTertiary}`}>•</span>
          <Link to="/register" className={`text-xs ${textTertiary} hover:text-emerald-500 transition`}>
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Privacy