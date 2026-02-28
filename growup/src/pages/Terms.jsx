import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiShield, FiLock, FiGlobe, FiCpu, FiHeart } from 'react-icons/fi'

// Import images
import gokuBg from '../assets/goku.png'
import plantLogo from '../assets/plantlogo.png'

const Terms = () => {
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
          <h1 className={`text-2xl sm:text-3xl font-light ${textPrimary} mb-2`}>Terms & Privacy</h1>
          <p className={`text-sm ${textTertiary}`}>
            Welcome, growth seeker! Here's how we roll 
          </p>
        </div>

        {/* Main Content Card */}
        <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 sm:p-8 space-y-8`}>
          
          {/* Welcome Message */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiHeart size={20} />
              <h2 className="text-lg font-light">Welcome, Growth Seeker!</h2>
            </div>
            <div className={`pl-7 space-y-3 ${textSecondary} text-sm leading-relaxed`}>
              <p>
                <span className="text-emerald-500">"Welcome, my dead friends!"</span> — Just kidding, we're glad you're alive and ready to grow! 
              </p>
              <p>
                You want to grow like a plant and see your daily achievements? You've come to the right place. 
                Think of this as your personal greenhouse where every day you water your progress and watch yourself bloom.
              </p>
            </div>
          </section>

          {/* Data Safety */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiShield size={20} />
              <h2 className="text-lg font-light">Your Data is Safe & Backed Up</h2>
            </div>
            <div className={`pl-7 ${textSecondary} text-sm leading-relaxed`}>
              <p>
                Your journey matters, and so does your data. We keep it safe, backed up, and secure. 
                No sudden disappearances — unlike your motivation on Mondays. 
              </p>
            </div>
          </section>

          {/* Social Media Connection */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiLock size={20} />
              <h2 className="text-lg font-light">Social Media Connection</h2>
            </div>
            <div className={`pl-7 ${textSecondary} text-sm leading-relaxed space-y-2`}>
              <p>
                By using growup+, you agree to connect your social media accounts. 
                Why? Because we want to see you flex those achievements! 
              </p>
              <p className={`${textTertiary} text-xs p-3 ${isDark ? 'bg-white/5' : 'bg-black/5'} rounded-lg`}>
                <span className="text-emerald-500 font-medium">Note from the dev:</span> "Sorry family, I don't have that much complex techie skills to implement developer APIs to fetch some social media information. 
                So for now, you can manually enter your stats. Future me (or maybe you?) will add the fancy auto-fetch features!"
              </p>
            </div>
          </section>

          {/* Multi-language */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiGlobe size={20} />
              <h2 className="text-lg font-light">Multi-Language Support</h2>
            </div>
            <div className={`pl-7 ${textSecondary} text-sm leading-relaxed`}>
              <p>
                This is a multi-language portal, but we're using English as of now. 
                Why? Because we believe in universal communication — and also because Google Translate is our best friend. 
                More languages coming soon! 
              </p>
            </div>
          </section>

          {/* Future Updates */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-500">
              <FiCpu size={20} />
              <h2 className="text-lg font-light">The Future is Bright</h2>
            </div>
            <div className={`pl-7 ${textSecondary} text-sm leading-relaxed`}>
              <p>
                This is just the beginning. Future updates will include:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li> AI Integration — because even plants need smart advice</li>
                <li> Advanced analytics — watch yourself grow in 4K</li>
                <li> Real API connections — no more manual entry</li>
                <li> More languages — for our global growth family</li>
                <li> Gamification — level up your life</li>
              </ul>
            </div>
          </section>

          {/* Standard Terms */}
          <section className="space-y-3">
            <h2 className={`text-lg font-light ${textPrimary}`}>Standard Legal Stuff</h2>
            <div className={`${textTertiary} text-xs space-y-2`}>
              <p>
                By using growup+, you agree that:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>You're awesome (this is non-negotiable)</li>
                <li>You'll actually try to grow (otherwise what's the point?)</li>
                <li>You won't blame us if you become too successful</li>
                <li>You understand that results may vary — some plants grow faster than others</li>
                <li>You're okay with us sending you motivational quotes (they're free therapy)</li>
              </ul>
              <p className="mt-4">
                We reserve the right to add more features, fix bugs, and occasionally break things (then fix them again — that's called "progress").
              </p>
            </div>
          </section>

          {/* Agreement */}
          <div className={`pt-4 border-t ${borderColor}`}>
            <p className={`text-xs ${textTertiary} text-center`}>
              By continuing to use growup+, you agree to these terms and acknowledge that 
              you're on a journey to become the best version of yourself — one day at a time. 🌱
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

export default Terms