import { Heart, MessageCircle, Repeat2, Share, Loader2 } from "lucide-react"
import { useState } from "react"
import { api } from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"

export default function TweetCard({ tweet }) {
  const { user } = useAuth()
  const [likesCount, setLikesCount] = useState(tweet.likesCount || 0)
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "mo"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m"
    return Math.floor(seconds) + "s"
  }

  const handleToggleLike = async (e) => {
    e.stopPropagation()
    if (!user) {
      alert("Please login to like tweets")
      return
    }
    if (isTogglingLike) return

    try {
      setIsTogglingLike(true)
      const { data } = await api.post(`/likes/toggle/t/${tweet._id}`)
      const nowLiked = data.data.isLiked
      setIsLiked(nowLiked)
      setLikesCount(prev => nowLiked ? prev + 1 : prev - 1)
    } catch (error) {
      console.error("Failed to toggle tweet like", error)
    } finally {
      setIsTogglingLike(false)
    }
  }

  return (
    <div className="flex gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer w-full group/card">
      <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary shrink-0">
        {tweet.owner?.avatar ? (
          <img src={tweet.owner.avatar} alt={tweet.owner?.userName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-blue-500/20 text-blue-500">
            {(tweet.owner?.userName?.[0] || tweet.owner?.fullName?.[0] || 'U').toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm mb-1">
          <span className="font-bold text-primary hover:underline truncate">{tweet.owner?.fullName || tweet.owner?.userName || "Unknown User"}</span>
          <span className="text-muted-foreground truncate">@{tweet.owner?.userName || "unknown"}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground shrink-0">{formatTimeAgo(tweet.createdAt)}</span>
        </div>
        <p className="text-sm text-foreground mb-3 leading-relaxed whitespace-pre-wrap">
          {tweet.content}
        </p>
        <div className="flex items-center justify-between text-muted-foreground max-w-md">
          <button className="flex items-center gap-1.5 group hover:text-blue-400 transition-colors" onClick={(e) => e.stopPropagation()}>
            <div className="p-1.5 rounded-full group-hover:bg-blue-400/10 transition-colors">
              <MessageCircle className="h-4 w-4" />
            </div>
            <span className="text-xs">0</span>
          </button>
          <button className="flex items-center gap-1.5 group hover:text-green-400 transition-colors" onClick={(e) => e.stopPropagation()}>
            <div className="p-1.5 rounded-full group-hover:bg-green-400/10 transition-colors">
              <Repeat2 className="h-4 w-4" />
            </div>
            <span className="text-xs">0</span>
          </button>
          <button 
            className={`flex items-center gap-1.5 group transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
            onClick={handleToggleLike}
            disabled={isTogglingLike}
          >
            <div className={`p-1.5 rounded-full group-hover:bg-red-500/10 transition-colors`}>
              {isTogglingLike ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />}
            </div>
            <span className="text-xs font-bold">{likesCount}</span>
          </button>
          <button className="flex items-center gap-1.5 group hover:text-blue-400 transition-colors" onClick={(e) => e.stopPropagation()}>
            <div className="p-1.5 rounded-full group-hover:bg-blue-400/10 transition-colors">
              <Share className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
