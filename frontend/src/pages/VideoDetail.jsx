import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../lib/axios"
import { Loader2, ThumbsUp, Share2, ListPlus, Bell } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import Comments from "../components/ui/Comments"

export default function VideoDetail() {
  const { videoId } = useParams()
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [isTogglingSub, setIsTogglingSub] = useState(false)

  // Like state
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data } = await api.get(`/videos/${videoId}`)
        const videoData = data.data?.video
        setVideo(videoData)
        setLikesCount(videoData?.likesCount || 0)
        setIsLiked(videoData?.isLiked || false)
        
        if (videoData?.owner?._id) {
          // Fetch subscriber count
          const subRes = await api.get(`/subscriptions/c/${videoData.owner._id}`)
          setSubscribersCount(subRes.data?.data?.length || 0)
          
          // Check if current user is subscribed
          if (user) {
            const userSubsRes = await api.get(`/subscriptions/u/${user._id}`)
            const isSub = userSubsRes.data?.data?.some(c => c._id === videoData.owner._id)
            setIsSubscribed(isSub)
          }
        }
      } catch (error) {
        console.error("Failed to fetch video details", error)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchVideo()
    }
  }, [videoId, user])

  const handleToggleLike = async () => {
    if (!user) {
      alert("Please login to like videos")
      return
    }
    if (isTogglingLike) return

    try {
      setIsTogglingLike(true)
      const { data } = await api.post(`/likes/toggle/v/${videoId}`)
      const nowLiked = data.data.isLiked
      setIsLiked(nowLiked)
      setLikesCount(prev => nowLiked ? prev + 1 : prev - 1)
    } catch (error) {
      console.error("Failed to toggle like", error)
    } finally {
      setIsTogglingLike(false)
    }
  }

  const handleToggleSubscription = async () => {
    if (!user) {
      alert("Please login to subscribe")
      return
    }
    if (isTogglingSub || !video?.owner?._id) return

    try {
      setIsTogglingSub(true)
      const { data } = await api.post(`/subscriptions/c/${video.owner._id}`)
      const nowSubscribed = data.data.isSubscribed
      setIsSubscribed(nowSubscribed)
      setSubscribersCount(prev => nowSubscribed ? prev + 1 : prev - 1)
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

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Video not found</h2>
        <p className="text-muted-foreground">The video you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M"
    if (views >= 1000) return (views / 1000).toFixed(1) + "K"
    return views
  }

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hours ago"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " minutes ago"
    return Math.floor(seconds) + " seconds ago"
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-0">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Video Player and Details */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border border-border">
            <video 
              src={video.videoFile} 
              poster={video.thumbnail}
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              autoPlay
              className="w-full h-full object-contain outline-none"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="mt-4">
            <h1 className="text-xl md:text-2xl font-bold text-primary mb-2">{video.title}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link to={`/channel/${video.owner?.userName}`} className="h-10 w-10 rounded-full overflow-hidden bg-secondary border border-border hover:opacity-80 transition-opacity">
                  <img src={video.owner?.avatar} alt={video.owner?.userName} className="w-full h-full object-cover" />
                </Link>
                <div>
                  <Link to={`/channel/${video.owner?.userName}`} className="font-semibold text-primary hover:text-blue-400 transition-colors">
                    {video.owner?.fullName || "Unknown User"}
                  </Link>
                  <p className="text-xs text-muted-foreground">{subscribersCount} subscribers</p>
                </div>
                <button 
                  onClick={handleToggleSubscription}
                  disabled={isTogglingSub || user?._id === video.owner?._id}
                  className={`ml-4 px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg ${
                    isSubscribed 
                    ? "bg-secondary text-primary hover:bg-secondary/80 border border-primary/20" 
                    : "bg-primary text-primary-foreground hover:brightness-110"
                  } ${user?._id === video.owner?._id ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isTogglingSub ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    <>
                      <Bell className="h-4 w-4" />
                      Subscribed
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
                <div className="flex items-center bg-secondary rounded-full overflow-hidden border border-border">
                  <button 
                    onClick={handleToggleLike}
                    disabled={isTogglingLike}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-secondary/80 transition-colors border-r border-border ${isLiked ? "text-blue-500" : "text-primary"}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    <span className="text-sm font-bold">{likesCount}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-secondary/80 transition-colors">
                    <ThumbsUp className="h-4 w-4 rotate-180" />
                  </button>
                </div>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full hover:bg-secondary/80 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-full hover:bg-secondary/80 transition-colors">
                  <ListPlus className="h-4 w-4" />
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
            </div>

            {/* Description Box */}
            <div className="mt-4 p-4 bg-secondary/50 rounded-xl border border-border">
              <div className="flex gap-2 text-sm font-medium text-primary mb-2">
                <span>{formatViews(video.views || 0)} views</span>
                <span>•</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {video.description}
              </p>
            </div>

            {/* Comments Section */}
            <Comments videoId={videoId} />
          </div>
        </div>

        {/* Right Column: Recommendations (Placeholder for now) */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-primary mb-2">Up Next</h3>
          {/* We'd map through other videos here, but keeping it empty/placeholder for now to focus on the player */}
          <div className="text-sm text-muted-foreground p-4 bg-secondary/30 border border-border rounded-lg text-center">
            More videos will appear here.
          </div>
        </div>

      </div>
    </div>
  )
}
