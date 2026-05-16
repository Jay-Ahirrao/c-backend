import { Routes, Route } from "react-router-dom"
import RootLayout from "./components/layout/RootLayout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import VideoDetail from "./pages/VideoDetail"
import UploadVideo from "./pages/UploadVideo"
import Tweet from "./pages/Tweet"
import Library from "./pages/Library"
import Profile from "./pages/Profile"
import Subscriptions from "./pages/Subscriptions"
import Channel from "./pages/Channel"
import Explore from "./pages/Explore"
import History from "./pages/History"
import Tweets from "./pages/Tweets"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="history" element={<History />} />
        <Route path="tweets" element={<Tweets />} />
        <Route path="watch/:videoId" element={<VideoDetail />} />
        <Route path="upload" element={<UploadVideo />} />
        <Route path="tweet" element={<Tweet />} />
        <Route path="library" element={<Library />} />
        <Route path="profile" element={<Profile />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="channel/:username" element={<Channel />} />
      </Route>
    </Routes>
  )
}

export default App
