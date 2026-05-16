import { useState, useRef, useEffect } from "react"
import { Search, Bell, Video, Menu, LogIn, LogOut, Settings, HelpCircle, Moon, Globe, Keyboard, UserSquare2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Topbar() {
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card shrink-0 relative z-50">
      <div className="flex items-center gap-4 md:hidden">
        <button className="p-2 hover:bg-secondary rounded-full">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <Link to="/" className="flex items-center justify-center flex-1">
          <img src="/image.png" alt="EveryTube" className="h-7 w-auto object-contain" />
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-2xl mx-auto px-6">
        <div className="flex items-center w-full bg-background border border-border rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-shadow">
          <div className="px-4 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent py-2 px-2 outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 hover:bg-secondary rounded-full md:hidden">
          <Search className="h-5 w-5 text-muted-foreground" />
        </button>

        {user ? (
          <>
            <button className="p-2 hover:bg-secondary rounded-full hidden sm:block">
              <Video className="h-5 w-5 text-primary" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 border-2 border-card shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
            </button>

            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`block h-8 w-8 rounded-full bg-secondary overflow-hidden cursor-pointer flex-shrink-0 transition-all focus:outline-none ${isProfileOpen ? 'ring-1 ring-white ring-offset-2 ring-offset-card' : 'hover:ring-1 hover:ring-white/50 hover:ring-offset-2 hover:ring-offset-card'
                  }`}
              >
                <img src={user.avatar} alt={user.userName} className="h-full w-full object-cover" />
              </button>

              {/* YouTube Style Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-4 w-[300px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden py-2 text-white animate-in fade-in slide-in-from-top-2 duration-200">

                  {/* User Info Header */}
                  <div className="flex items-start gap-4 px-4 py-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-white/20">
                      <img src={user.avatar} alt={user.userName} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0 justify-center">
                      <p className="text-[15px] font-medium leading-tight truncate text-white">{user.fullName}</p>
                      <p className="text-[15px] text-neutral-300 mt-0.5 truncate">@{user.userName}</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10 my-2"></div>

                  {/* Action Links */}
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 transition-colors"
                  >
                    <UserSquare2 className="h-5 w-5 text-neutral-400 shrink-0" />
                    <span className="text-[14px]">View Account</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 hover:text-red-400 transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5 text-neutral-400 shrink-0" />
                    <span className="text-[14px]">Sign out</span>
                  </button>

                  <div className="w-full h-px bg-white/10 my-2"></div>

                  {/* Future Implementation Stubs */}
                  <button className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                    <Moon className="h-5 w-5 text-neutral-400 shrink-0" />
                    <div className="flex flex-1 justify-between items-center">
                      <span className="text-[14px]">Appearance: Device theme</span>
                      <span className="text-xs text-neutral-500">&gt;</span>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                    <Globe className="h-5 w-5 text-neutral-400 shrink-0" />
                    <div className="flex flex-1 justify-between items-center">
                      <span className="text-[14px]">Language: English</span>
                      <span className="text-xs text-neutral-500">&gt;</span>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                    <Keyboard className="h-5 w-5 text-neutral-400 shrink-0" />
                    <span className="text-[14px]">Keyboard shortcuts</span>
                  </button>

                  <div className="w-full h-px bg-white/10 my-2"></div>

                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-neutral-400 shrink-0" />
                    <span className="text-[14px]">Settings</span>
                  </Link>

                  <div className="w-full h-px bg-white/10 my-2"></div>

                  <button className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                    <HelpCircle className="h-5 w-5 text-neutral-400 shrink-0" />
                    <span className="text-[14px]">Help</span>
                  </button>

                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-secondary transition-colors text-primary font-medium text-sm"
          >
            <LogIn className="h-4 w-4" /> Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
