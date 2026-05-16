import { NavLink, Link } from "react-router-dom"
import { Home, Compass, PlaySquare, Clock, ThumbsUp, User, PlusSquare, MessageSquare } from "lucide-react"
import { cn } from "../../lib/utils"

const NAV_LINKS = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: MessageSquare, label: "Tweets", path: "/tweets" },
  { icon: PlaySquare, label: "Subscriptions", path: "/subscriptions" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: User, label: "My Library", path: "/library" },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
      <div className="px-4 h-16 flex items-center justify-center border-b border-border">
        <Link to="/" className="flex items-center justify-center">
          <img src="/image.png" alt="EveryTube" className="h-8 w-auto object-contain" />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-secondary hover:text-primary",
                isActive ? "bg-secondary text-primary font-semibold" : "text-muted-foreground"
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border flex gap-2">
        <Link
          to="/tweet"
          className="flex-1 flex flex-col items-center justify-center gap-1 p-3 bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-colors text-primary"
        >
          <div className="flex items-center gap-1 text-primary font-semibold">
            <PlusSquare className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold">Tweet</span>
        </Link>

        <Link
          to="/upload"
          className="flex-1 flex flex-col items-center justify-center gap-1 p-3 bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-colors text-primary"
        >
          <div className="flex items-center gap-1 text-accent font-semibold">
            <PlusSquare className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold">Video</span>
        </Link>
      </div>
    </aside>
  )
}
