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

export default function Sidebar({ isExpanded }) {
  return (
    <aside className={cn(
      "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300",
      isExpanded ? "w-64" : "w-20"
    )}>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              cn(
                "flex rounded-lg text-sm font-medium transition-colors hover:bg-secondary hover:text-primary",
                isExpanded ? "items-center gap-4 px-3 py-3" : "flex-col items-center gap-1 py-3 px-1 justify-center",
                isActive ? "bg-secondary text-primary font-semibold" : "text-muted-foreground"
              )
            }
          >
            <link.icon className={cn("shrink-0", isExpanded ? "h-5 w-5" : "h-6 w-6")} />
            <span className={cn(
              isExpanded ? "block" : "text-[10px] text-center"
            )}>
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className={cn(
        "p-4 border-t border-border flex",
        isExpanded ? "gap-2" : "flex-col gap-2 p-2"
      )}>
        <Link
          to="/tweet"
          className={cn(
            "flex flex-col items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-colors text-primary",
            isExpanded ? "flex-1 p-3" : "p-2 w-full"
          )}
        >
          <div className="flex items-center gap-1 text-primary font-semibold">
            <PlusSquare className="h-4 w-4" />
          </div>
          {isExpanded && <span className="text-xs font-semibold">Tweet</span>}
        </Link>

        <Link
          to="/upload"
          className={cn(
            "flex flex-col items-center justify-center gap-1 bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-colors text-primary",
            isExpanded ? "flex-1 p-3" : "p-2 w-full"
          )}
        >
          <div className="flex items-center gap-1 text-accent font-semibold">
            <PlusSquare className="h-4 w-4" />
          </div>
          {isExpanded && <span className="text-xs font-semibold">Video</span>}
        </Link>
      </div>
    </aside>
  )
}
