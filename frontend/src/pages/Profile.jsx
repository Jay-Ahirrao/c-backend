import { useState, useRef, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/axios"
import { Loader2, Camera, LogOut, History, User, Lock, Video, Edit2, X } from "lucide-react"
import { Link } from "react-router-dom"

export default function Profile() {
  const { user, checkAuth, logout } = useAuth()
  
  // Account Details State
  const [isEditingAccount, setIsEditingAccount] = useState(false)
  const [accountForm, setAccountForm] = useState({ fullName: "", email: "" })
  const [updatingAccount, setUpdatingAccount] = useState(false)
  const [accountMsg, setAccountMsg] = useState({ type: "", text: "" })

  // Password State
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" })
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" })

  // History State
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Refs for file inputs
  const avatarRef = useRef(null)
  const coverRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(null) // 'avatar' or 'cover'

  useEffect(() => {
    if (user) {
      setAccountForm({ fullName: user.fullName || "", email: user.email || "" })
      fetchHistory()
    }
  }, [user])

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const { data } = await api.get('/users/history')
      // getWatchHistory returns { data: user[0].watchHistory } inside ApiResponse usually
      setHistory(data.data || [])
    } catch (err) {
      console.error("Failed to fetch history", err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleUpdateAccount = async (e) => {
    e.preventDefault()
    setUpdatingAccount(true)
    setAccountMsg({ type: "", text: "" })
    try {
      await api.patch('/users/update-account', accountForm)
      await checkAuth() // Refresh user context
      setAccountMsg({ type: "success", text: "Account details updated successfully!" })
      setIsEditingAccount(false)
    } catch (err) {
      setAccountMsg({ type: "error", text: err.response?.data?.message || "Failed to update account" })
    } finally {
      setUpdatingAccount(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setUpdatingPassword(true)
    setPasswordMsg({ type: "", text: "" })
    try {
      await api.post('/users/change-password', passwordForm)
      setPasswordMsg({ type: "success", text: "Password changed successfully!" })
      setPasswordForm({ oldPassword: "", newPassword: "" })
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.response?.data?.message || "Failed to change password" })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleImageUpload = async (file, type) => {
    if (!file) return
    setUploadingImage(type)
    const formData = new FormData()
    formData.append(type === 'avatar' ? 'avatar' : 'coverImage', file)

    try {
      await api.patch(`/users/${type === 'avatar' ? 'avatar' : 'cover-image'}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      await checkAuth() // Refresh user context
    } catch (err) {
      console.error(`Failed to update ${type}`, err)
      alert(`Failed to update ${type}`)
    } finally {
      setUploadingImage(null)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Hero Section (Cover + Avatar) */}
      <div className="relative mb-20 group">
        <div className="h-48 md:h-64 w-full bg-secondary overflow-hidden relative">
          {user.coverImage ? (
            <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900"></div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={() => coverRef.current?.click()}
              disabled={uploadingImage === 'cover'}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium transition-colors"
            >
              {uploadingImage === 'cover' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              Update Cover Image
            </button>
            <input type="file" ref={coverRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], 'cover')} />
          </div>
        </div>

        <div className="absolute -bottom-12 left-6 md:left-12 flex items-end gap-4">
          <div className="relative group/avatar">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background overflow-hidden bg-secondary">
              <img src={user.avatar} alt={user.userName} className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingImage === 'avatar'}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full flex items-center justify-center text-white"
            >
              {uploadingImage === 'avatar' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
            </button>
            <input type="file" ref={avatarRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], 'avatar')} />
          </div>
          <div className="mb-2 md:mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">{user.fullName}</h1>
            <p className="text-muted-foreground">@{user.userName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Settings */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Account Details */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-primary">
                <User className="h-5 w-5" />
                <h2 className="text-lg font-bold">Account Details</h2>
              </div>
              <button 
                onClick={() => {
                  setIsEditingAccount(!isEditingAccount)
                  setAccountMsg({ type: "", text: "" })
                  setAccountForm({ fullName: user.fullName || "", email: user.email || "" })
                }}
                className="p-2 text-muted-foreground hover:bg-secondary hover:text-primary rounded-full transition-colors"
                title={isEditingAccount ? "Cancel Edit" : "Edit Details"}
              >
                {isEditingAccount ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              </button>
            </div>
            
            {accountMsg.text && (
              <div className={`mb-6 p-3 rounded-lg text-sm ${accountMsg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                {accountMsg.text}
              </div>
            )}

            {!isEditingAccount ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                  <p className="text-base font-medium text-primary">{user.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                  <p className="text-base font-medium text-primary">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Username</p>
                  <p className="text-base font-medium text-primary">@{user.userName}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateAccount} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  <input type="text" value={accountForm.fullName} onChange={e => setAccountForm({...accountForm, fullName: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input type="email" value={accountForm.email} onChange={e => setAccountForm({...accountForm, email: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={updatingAccount} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                    {updatingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password Form */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Lock className="h-5 w-5" />
              <h2 className="text-lg font-bold">Change Password</h2>
            </div>
            {passwordMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${passwordMsg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                {passwordMsg.text}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
              </div>
              <button type="submit" disabled={updatingPassword} className="w-full py-2 bg-secondary hover:bg-secondary/80 text-primary rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {updatingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Password
              </button>
            </form>
          </div>

          <button onClick={logout} className="w-full py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

        {/* Right Column: Watch History */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-full">
            <div className="flex items-center gap-2 mb-6 text-primary border-b border-border/50 pb-4">
              <History className="h-5 w-5" />
              <h2 className="text-xl font-bold">Watch History</h2>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-primary">No watch history</h3>
                <p className="text-muted-foreground mt-1 text-sm">Videos you watch will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((video) => (
                  <Link key={video._id} to={`/watch/${video._id}`} className="flex gap-4 group p-2 hover:bg-secondary/30 rounded-lg transition-colors">
                    <div className="w-40 aspect-video rounded-md overflow-hidden shrink-0 bg-black relative border border-border/40">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex flex-col py-1">
                      <h4 className="text-sm md:text-base font-semibold text-primary line-clamp-2 group-hover:text-blue-400 transition-colors">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.owner?.userName || "Unknown Channel"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{video.views || 0} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
