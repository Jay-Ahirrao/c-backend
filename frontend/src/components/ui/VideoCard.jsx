import { Link } from "react-router-dom"
import { MoreVertical } from "lucide-react"

export default function VideoCard({ video }) {
  // Utility to format views
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views
  }

  // Utility to format time ago
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
    <Link to={`/watch/${video._id}`} className="flex flex-col gap-3 group cursor-pointer">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>
      
      <div className="flex gap-3 pr-2">
        <Link 
          to={`/channel/${video.owner?.userName || video.owner?.username}`} 
          onClick={(e) => e.stopPropagation()}
          className="h-9 w-9 rounded-full overflow-hidden bg-secondary shrink-0 mt-0.5 hover:opacity-80 transition-opacity"
        >
          {video.owner?.avatar ? (
            <img src={video.owner.avatar} alt={video.owner?.userName || video.owner?.username || 'User'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-blue-500/20 text-blue-500">
              {(video.owner?.userName?.[0] || video.owner?.username?.[0] || video.owner?.fullName?.[0] || 'U').toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex flex-col overflow-hidden">
          <h3 className="text-sm font-semibold text-primary line-clamp-2 leading-tight mb-1 group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          <div className="text-xs text-muted-foreground flex flex-col">
            <Link 
              to={`/channel/${video.owner?.userName || video.owner?.username}`} 
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary transition-colors truncate"
            >
              {video.owner?.fullName || video.owner?.userName || video.owner?.username || "Unknown User"}
            </Link>
            <span>{formatViews(video.views || 0)} views • {formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button className="p-1 hover:bg-secondary rounded-full text-muted-foreground hover:text-primary" onClick={(e) => e.preventDefault()}>
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
