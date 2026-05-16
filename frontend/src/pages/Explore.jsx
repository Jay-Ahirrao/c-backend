import { useState, useEffect } from "react"
import { api } from "../lib/axios"
import VideoCard from "../components/ui/VideoCard"
import { Compass, Loader2, TrendingUp, Clock, Eye } from "lucide-react"
import { cn } from "../lib/utils"

const SORT_OPTIONS = [
  { id: "createdAt", label: "Newest", icon: Clock },
  { id: "views", label: "Most Viewed", icon: Eye },
  { id: "trending", label: "Trending", icon: TrendingUp },
]

export default function Explore() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("createdAt")

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/videos?sortBy=${sortBy === 'trending' ? 'views' : sortBy}&sortType=desc`)
        const videosData = data.data
        setVideos(videosData?.videos || videosData?.docs || (Array.isArray(videosData) ? videosData : []))
      } catch (error) {
        console.error("Failed to fetch explore videos", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [sortBy])

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Explore</h1>
            <p className="text-sm text-muted-foreground">Discover the most popular and recent videos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-xl border border-border/50">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                sortBy === option.id 
                  ? "bg-background text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-primary hover:bg-secondary"
              )}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-secondary/20">
          <Compass className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-primary">No videos found</h3>
          <p className="text-muted-foreground mt-2">Check back later for fresh content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
