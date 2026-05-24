import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/axios'
import { Mail, KeyRound, Lock, ArrowLeft, PlaySquare, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)
    try {
      const response = await api.post('/users/forgot-password', { email })
      setMessage(response.data?.message || 'OTP sent successfully to your email.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)
    try {
      await api.post('/users/verify-otp', { email, otp })
      setMessage('OTP verified successfully! Now choose your new password.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/users/reset-password', { email, otp, newPassword })
      setMessage(response.data?.message || 'Password reset successfully!')
      setStep(4) // Success step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please request a new OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <PlaySquare className="h-12 w-12 text-red-600 fill-current mb-4" />
          <h1 className="text-2xl font-bold text-primary">Reset Password</h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            {step === 1 && 'Enter your email address to receive a password reset code.'}
            {step === 2 && 'Enter the 6-digit OTP code sent to your registered email.'}
            {step === 3 && 'Choose a strong, secure new password.'}
            {step === 4 && 'Your password has been successfully updated.'}
          </p>
        </div>

        {/* Progress indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center mb-8 gap-2">
            <span className={`w-8 h-2 rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <span className={`w-8 h-2 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <span className={`w-8 h-2 rounded ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && step !== 4 && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition-colors disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Verification Code (OTP)</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg tracking-widest text-center text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="123456"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition-colors disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" /> Change Email
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition-colors disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
              Password changed successfully! You can now log in with your new credentials.
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition-colors mt-4 cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {step < 4 && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
