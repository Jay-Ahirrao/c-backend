import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/axios"
import { Loader2, Trash2, Edit2, Eye, EyeOff } from "lucide-react"

export default function Library() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit modal state
  const [editingVideo, setEditingVideo] = useState(null)
  const [editForm, setEditForm] = useState({ title: "", description: "" })
  const [updating, setUpdating] = useState(false)

  const fetchMyVideos = async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data } = await api.get(`/dashboard/videos`)
      const vids = data.data?.videos || data.data?.docs || (Array.isArray(data.data) ? data.data : [])
      setVideos(vids)
    } catch (error) {
      console.error("Failed to fetch library", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyVideos()
  }, [user])

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return
    try {
      await api.delete(`/videos/${videoId}`)
      setVideos(videos.filter(v => v._id !== videoId))
    } catch (error) {
      console.error("Failed to delete video", error)
      alert("Failed to delete video")
    }
  }

  const handleTogglePublish = async (videoId) => {
    try {
      const { data } = await api.patch(`/videos/toggle/publish/${videoId}`)
      const newStatus = data.data.isPublished
      
      setVideos(videos.map(v => {
        if (v._id === videoId) return { ...v, isPublished: newStatus }
        return v
      }))
    } catch (error) {
      console.error("Failed to toggle publish status", error)
      alert("Failed to toggle status")
    }
  }

  const handleEditClick = (video) => {
    setEditingVideo(video)
    setEditForm({ title: video.title, description: video.description })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      await api.patch(`/videos/${editingVideo._id}`, editForm)
      setVideos(videos.map(v => {
        if (v._id === editingVideo._id) return { ...v, title: editForm.title, description: editForm.description }
        return v
      }))
      setEditingVideo(null)
    } catch (error) {
      console.error("Failed to update video", error)
      alert("Failed to update video")
    } finally {
      setUpdating(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-primary mb-8">My Library</h1>
      
      {videos.length === 0 ? (
        <div className="text-center py-16 bg-secondary/30 border-2 border-dashed border-border rounded-xl flex flex-col items-center">
          <EyeOff className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">No videos yet</h2>
          <p className="text-muted-foreground max-w-sm mb-6">Upload your first video to see it here.</p>
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-secondary/30 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-6">Video</div>
            <div className="col-span-2 text-center">Visibility</div>
            <div className="col-span-2 text-center">Metrics</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border/40">
            {videos.map(video => (
              <div key={video._id} className="group flex flex-col md:grid md:grid-cols-12 gap-4 p-4 hover:bg-secondary/20 transition-all duration-200 items-center">
                
                {/* Video Info Column */}
                <div className="col-span-6 flex gap-4 w-full">
                  <div className="w-32 md:w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-black border border-border/40">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col py-1">
                    <h3 className="text-base font-semibold text-primary line-clamp-2 leading-snug">{video.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{video.description}</p>
                    <div className="text-xs text-muted-foreground font-medium mt-auto pt-2">
                      {new Date(video.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Visibility Column */}
                <div className="col-span-2 flex justify-center w-full md:w-auto mt-4 md:mt-0">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                      <input 
                        type="radio" 
                        name={`visibility-${video._id}`} 
                        checked={video.isPublished === true}
                        onChange={() => {
                          if(!video.isPublished) handleTogglePublish(video._id)
                        }}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                      <span className={video.isPublished ? "font-medium text-primary" : ""}>Public</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                      <input 
                        type="radio" 
                        name={`visibility-${video._id}`} 
                        checked={video.isPublished === false}
                        onChange={() => {
                          if(video.isPublished) handleTogglePublish(video._id)
                        }}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                      <span className={!video.isPublished ? "font-medium text-primary" : ""}>Private</span>
                    </label>
                  </div>
                </div>

                {/* Metrics Column */}
                <div className="col-span-2 flex justify-center w-full md:w-auto text-sm text-muted-foreground font-medium">
                  {video.views || 0} views
                </div>

                {/* Actions Column */}
                <div className="col-span-2 flex justify-end gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <button 
                    onClick={() => handleEditClick(video)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit details"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(video._id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete video"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal remains similar but cleaner */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 bg-secondary/30">
              <h2 className="text-xl font-bold text-primary">Edit Video Details</h2>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-5 py-2.5 rounded-xl font-semibold hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:brightness-110 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
