import { useState, useEffect } from "react"
import { api } from "../../lib/axios"
import { useAuth } from "../../context/AuthContext"
import { Loader2, Send, ThumbsUp, Trash2, MessageSquare } from "lucide-react"

export default function Comments({ videoId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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

  const fetchComments = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/comments/${videoId}`)
      setComments(data.data || [])
    } catch (error) {
      console.error("Failed to fetch comments", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (videoId) {
      fetchComments()
    }
  }, [videoId])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user) {
      alert("Please login to comment")
      return
    }
    if (!newComment.trim() || submitting) return

    try {
      setSubmitting(true)
      const { data } = await api.post(`/comments/${videoId}`, { content: newComment })
      const commentWithUser = {
        ...data.data,
        owner: data.data.owner || {
          userName: user.userName,
          fullName: user.fullName,
          avatar: user.avatar,
          _id: user._id
        },
        likesCount: data.data.likesCount ?? 0,
        isLiked: data.data.isLiked ?? false
      }
      setComments([commentWithUser, ...comments])
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return
    try {
      await api.delete(`/comments/c/${commentId}`)
      setComments(comments.filter(c => c._id !== commentId))
    } catch (error) {
      console.error("Failed to delete comment", error)
    }
  }

  const handleToggleLike = async (commentId) => {
    if (!user) {
      alert("Please login to like comments")
      return
    }
    try {
      const { data } = await api.post(`/likes/toggle/c/${commentId}`)
      const nowLiked = data.data.isLiked
      setComments(comments.map(c => {
        if (c._id === commentId) {
          return {
            ...c,
            isLiked: nowLiked,
            likesCount: nowLiked ? c.likesCount + 1 : c.likesCount - 1
          }
        }
        return c
      }))
    } catch (error) {
      console.error("Failed to toggle comment like", error)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-primary">{comments.length} Comments</h2>
      </div>

      {/* Add Comment Input */}
      {user ? (
        <form onSubmit={handleAddComment} className="flex gap-4">
          <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 bg-secondary border border-border">
            <img src={user.avatar} alt={user.userName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-3">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-transparent border-b border-border py-2 focus:border-primary outline-none transition-colors text-sm"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-secondary/30 p-4 rounded-xl text-center border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Please login to join the conversation.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm italic">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 group">
              <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 bg-secondary border border-border">
                <img src={comment.owner?.avatar} alt={comment.owner?.userName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">@{comment.owner?.userName}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={() => handleToggleLike(comment._id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${comment.isLiked ? 'text-blue-500' : 'text-muted-foreground hover:text-primary'}`}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                    {comment.likesCount}
                  </button>
                  {user?._id === comment.owner?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
