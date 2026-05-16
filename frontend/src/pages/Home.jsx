import { useState, useEffect } from "react"
import { api } from "../lib/axios"
import VideoCard from "../components/ui/VideoCard"
import TweetCard from "../components/ui/TweetCard"
import { PlaySquare, MessageSquare, Loader2, LogIn } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"

export default function Home() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [videosRes, tweetsRes] = await Promise.all([
          api.get('/videos'),
          api.get(`/tweets/user/${user._id}`).catch(() => ({ data: { data: [] } }))
        ])
        
        const videosData = videosRes.data?.data
        setVideos(videosData?.videos || videosData?.docs || (Array.isArray(videosData) ? videosData : []))
        
        const tweetsData = tweetsRes.data?.data
        setTweets(Array.isArray(tweetsData) ? tweetsData : [])
      } catch (error) {
        console.error("Failed to fetch home feed", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <PlaySquare className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-primary">Welcome to EveryTube</h2>
        <p className="text-muted-foreground max-w-sm">Sign in to discover videos, subscribe to your favorite channels, and interact with the community.</p>
        <Link to="/login" className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 font-semibold rounded-full transition-colors mt-4">
          <LogIn className="h-5 w-5" /> Sign in
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      {/* Top Tweets Section (Twitter vibe) */}
      {tweets.length > 0 && (
        <>
          <section>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-xl font-bold tracking-tight">Your Tweets</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {tweets.map((tweet) => (
                <div key={tweet._id} className="min-w-[300px] md:min-w-[400px] snap-start">
                  <TweetCard tweet={tweet} />
                </div>
              ))}
            </div>
          </section>
          <hr className="border-border" />
        </>
      )}

      {/* Video Feed Section (YouTube vibe) */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-primary">
          <PlaySquare className="h-5 w-5" />
          <h2 className="text-xl font-bold tracking-tight">Recommended Videos</h2>
        </div>
        
        {videos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <PlaySquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-primary">No videos found</h3>
            <p className="text-muted-foreground mt-1">Check back later or upload your own!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
