import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { api } from "../lib/axios"
import { useAuth } from "../context/AuthContext"
import { Loader2, Users, Play, Bell } from "lucide-react"
import VideoCard from "../components/ui/VideoCard"

export default function Channel() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [isTogglingSub, setIsTogglingSub] = useState(false)

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true)
        // 1. Fetch channel profile
        const profileRes = await api.get(`/users/c/${username}`)
        const channelData = profileRes.data?.data
        setChannel(channelData)
        setIsSubscribed(channelData?.isSubscribed)
        setSubscriberCount(channelData?.subscriberCount || 0)

        // 2. Fetch channel videos
        const videosRes = await api.get(`/videos?userId=${channelData._id}`)
        setVideos(videosRes.data?.data?.videos || [])
      } catch (error) {
        console.error("Failed to fetch channel data", error)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchChannelData()
    }
  }, [username])

  const handleToggleSubscription = async () => {
    if (!currentUser) {
      alert("Please login to subscribe")
      return
    }
    if (isTogglingSub || !channel?._id) return

    try {
      setIsTogglingSub(true)
      const { data } = await api.post(`/subscriptions/c/${channel._id}`)
      const nowSubscribed = data.data.isSubscribed
      setIsSubscribed(nowSubscribed)
      setSubscriberCount(prev => nowSubscribed ? prev + 1 : prev - 1)
    } catch (error) {
      console.error("Failed to toggle subscription", error)
    } finally {
      setIsTogglingSub(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Channel not found</h2>
        <p className="text-muted-foreground">The user @{username} does not exist or has no channel.</p>
      </div>
    )
  }

  return (
    <div className="pb-12">
      {/* Cover Image */}
      <div className="h-40 md:h-64 w-full bg-secondary overflow-hidden relative">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800"></div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Channel Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-8 md:-mt-12 mb-8 relative z-10">
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background overflow-hidden bg-secondary shadow-xl">
            <img src={channel.avatar} alt={channel.userName} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 text-center md:text-left md:pt-14">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{channel.fullName}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-2 text-muted-foreground font-medium">
              <span>@{channel.userName}</span>
              <span className="hidden md:inline">•</span>
              <span>{subscriberCount} subscribers</span>
              <span className="hidden md:inline">•</span>
              <span>{channel.channelsSubscribedToCount} subscribed</span>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              {currentUser?._id !== channel._id && (
                <button 
                  onClick={handleToggleSubscription}
                  disabled={isTogglingSub}
                  className={`px-8 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg ${
                    isSubscribed 
                    ? "bg-secondary text-primary hover:bg-secondary/80 border border-primary/20" 
                    : "bg-primary text-primary-foreground hover:brightness-110"
                  }`}
                >
                  {isTogglingSub ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isSubscribed ? (
                    <>
                      <Bell className="h-5 w-5" />
                      Subscribed
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              )}
              {currentUser?._id === channel._id && (
                <Link to="/library" className="px-8 py-2.5 bg-secondary text-primary hover:bg-secondary/80 rounded-full font-bold transition-all shadow-md">
                  Manage Videos
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs / Videos Section */}
        <div className="border-b border-border mb-8">
          <div className="flex gap-8">
            <button className="pb-4 border-b-2 border-primary font-bold text-primary flex items-center gap-2">
              <Play className="h-4 w-4" />
              Videos
            </button>
            {/* Future tabs could go here: About, Playlists, etc */}
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-xl font-semibold text-primary">No videos yet</h3>
            <p className="text-muted-foreground">This creator hasn't uploaded any content yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map(v => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
