import { useState, useEffect } from "react"
import { api } from "../lib/axios"
import { useAuth } from "../context/AuthContext"
import { History as HistoryIcon, Loader2, PlaySquare } from "lucide-react"
import { Link } from "react-router-dom"
import VideoCard from "../components/ui/VideoCard"

export default function History() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/users/history')
      setHistory(data.data || [])
    } catch (err) {
      console.error("Failed to fetch history", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchHistory()
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center space-y-4">
        <HistoryIcon className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-primary">Watch History</h2>
        <p className="text-muted-foreground max-w-sm">Sign in to see the videos you've watched.</p>
        <Link to="/login" className="px-6 py-3 bg-white text-black hover:bg-gray-200 font-semibold rounded-full transition-colors mt-4">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <HistoryIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Watch History</h1>
            <p className="text-sm text-muted-foreground">The videos you've watched recently</p>
          </div>
        </div>
        
        <button 
          onClick={fetchHistory}
          disabled={loading}
          className="text-sm font-semibold text-primary hover:underline underline-offset-4"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-secondary/20">
          <PlaySquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-primary">Your history is empty</h3>
          <p className="text-muted-foreground mt-2">Videos you watch will show up here.</p>
          <Link to="/explore" className="inline-block mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl transition-all">
            Explore Videos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {history.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
