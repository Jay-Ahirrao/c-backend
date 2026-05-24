import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlaySquare, UploadCloud } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!avatar) {
      setError("Avatar is required")
      setIsLoading(false)
      return
    }

    const data = new FormData()
    data.append('fullName', formData.fullName)
    data.append('email', formData.email)
    data.append('userName', formData.userName)
    data.append('password', formData.password)
    data.append('avatar', avatar)
    if (coverImage) {
      data.append('coverImage', coverImage)
    }

    try {
      await register(data)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <PlaySquare className="h-12 w-12 text-red-600 fill-current mb-4" />
          <h1 className="text-2xl font-bold text-primary">Create an account</h1>
          <p className="text-muted-foreground mt-2">Join EveryTube today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Avatar *</label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => avatarInputRef.current?.click()}
            >
              <UploadCloud className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {avatar ? avatar.name : 'Click to upload avatar'}
              </span>
              <input 
                type="file" 
                ref={avatarInputRef}
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setAvatar(e.target.files[0])}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Cover Image (Optional)</label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => coverInputRef.current?.click()}
            >
              <UploadCloud className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {coverImage ? coverImage.name : 'Click to upload cover image'}
              </span>
              <input 
                type="file" 
                ref={coverInputRef}
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setCoverImage(e.target.files[0])}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition-colors disabled:opacity-50 mt-6"
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
