import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function RootLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Topbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar isExpanded={isSidebarExpanded} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
