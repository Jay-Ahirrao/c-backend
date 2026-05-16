import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/axios"
import { Loader2, Users, Bell, UserX } from "lucide-react"
import { Link } from "react-router-dom"

export default function Subscriptions() {
  const { user } = useAuth()
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data } = await api.get(`/subscriptions/u/${user._id}`)
        setChannels(data.data || [])
      } catch (error) {
        console.error("Failed to fetch subscriptions", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [user])

  const handleUnsubscribe = async (channelId) => {
    try {
      await api.post(`/subscriptions/c/${channelId}`)
      // Toggle subscription returns isSubscribed: false, so we remove from UI
      setChannels(prev => prev.filter(c => c._id !== channelId))
    } catch (error) {
      console.error("Failed to unsubscribe", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-8">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/50">
        <div className="p-3 bg-secondary/50 rounded-xl">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the channels you are following</p>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center">
          <div className="h-20 w-20 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">No subscriptions yet</h2>
          <p className="text-muted-foreground max-w-sm mb-6">Discover new creators and subscribe to get updates on their latest videos.</p>
          <Link to="/" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors">
            Explore Videos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <div key={channel._id} className="bg-card border border-border/60 hover:border-border rounded-xl p-5 flex flex-col items-center text-center transition-all group shadow-sm">
              <Link to={`/channel/${channel.userName}`} className="mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-background bg-secondary shadow-md group-hover:scale-105 transition-transform">
                  <img src={channel.avatar} alt={channel.userName} className="h-full w-full object-cover" />
                </div>
              </Link>
              
              <Link to={`/channel/${channel.userName}`} className="w-full">
                <h3 className="text-lg font-bold text-primary truncate px-2">{channel.fullName}</h3>
                <p className="text-sm text-muted-foreground mb-4">@{channel.userName}</p>
              </Link>

              <div className="flex gap-2 w-full mt-auto pt-4 border-t border-border/40">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-secondary hover:bg-secondary/80 text-primary rounded-lg text-sm font-medium transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span>Subscribed</span>
                </button>
                <button 
                  onClick={() => handleUnsubscribe(channel._id)}
                  className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                  title="Unsubscribe"
                >
                  <UserX className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
