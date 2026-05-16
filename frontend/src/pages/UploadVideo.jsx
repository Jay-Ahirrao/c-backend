import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../lib/axios"
import { UploadCloud, PlaySquare, Loader2 } from "lucide-react"

export default function UploadVideo() {
  const [formData, setFormData] = useState({ title: "", description: "" })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const videoInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile || !thumbnail || !formData.title || !formData.description) {
      setError("All fields are required (Title, Description, Video, Thumbnail)")
      return
    }

    setError("")
    setLoading(true)

    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("videoFile", videoFile)
    data.append("thumbnail", thumbnail)

    try {
      const response = await api.post("/videos", data, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      // response.data.data has videoId
      navigate(`/watch/${response.data.data.videoId}`)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish video")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <PlaySquare className="h-8 w-8 text-red-600 fill-current" />
          <h1 className="text-2xl font-bold text-primary">Upload Video</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Video File *</label>
              <div 
                className={`border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${videoFile ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                onClick={() => videoInputRef.current?.click()}
              >
                <UploadCloud className="h-8 w-8 text-muted-foreground mb-3" />
                <span className="text-sm font-medium text-primary text-center">
                  {videoFile ? videoFile.name : "Click to select video"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">MP4, WebM or OGG</span>
                <input 
                  type="file" 
                  ref={videoInputRef}
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Thumbnail *</label>
              <div 
                className={`border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${thumbnail ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                onClick={() => thumbnailInputRef.current?.click()}
              >
                <UploadCloud className="h-8 w-8 text-muted-foreground mb-3" />
                <span className="text-sm font-medium text-primary text-center">
                  {thumbnail ? thumbnail.name : "Click to select thumbnail"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP</span>
                <input 
                  type="file" 
                  ref={thumbnailInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Add a catchy title"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell viewers about your video"
                rows="5"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Publishing..." : "Publish Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
