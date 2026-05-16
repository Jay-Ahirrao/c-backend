import { useState, useEffect } from "react"
import { api } from "../lib/axios"
import TweetCard from "../components/ui/TweetCard"
import { MessageSquare, Loader2, TrendingUp, Clock, Heart } from "lucide-react"
import { cn } from "../lib/utils"

const SORT_OPTIONS = [
  { id: "createdAt", label: "Newest", icon: Clock },
  { id: "likes", label: "Most Liked", icon: Heart },
]

export default function Tweets() {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("createdAt")

  const fetchTweets = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/tweets?sortBy=${sortBy}&sortType=desc`)
      setTweets(data.data || [])
    } catch (error) {
      console.error("Failed to fetch tweets", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTweets()
  }, [sortBy])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Tweets</h1>
            <p className="text-sm text-muted-foreground">Join the conversation with the community</p>
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
      ) : tweets.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-secondary/20">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-primary">No tweets found</h3>
          <p className="text-muted-foreground mt-2">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <TweetCard key={tweet._id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  )
}
