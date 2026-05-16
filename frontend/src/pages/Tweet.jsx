import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../lib/axios"
import { MessageSquare, Loader2 } from "lucide-react"

export default function Tweet() {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError("Tweet content cannot be empty")
      return
    }

    setError("")
    setLoading(true)

    try {
      await api.post("/tweets", { content })
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post tweet")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-8 w-8 text-blue-500 fill-current" />
          <h1 className="text-2xl font-bold text-primary">Post a Tweet</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              rows="4"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-lg placeholder:text-muted-foreground"
            />
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {content.length}/280
            </span>
            <button
              type="submit"
              disabled={loading || content.length === 0 || content.length > 280}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 font-semibold rounded-full transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Posting..." : "Tweet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
