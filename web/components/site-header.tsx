import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function SiteHeader({
  breadcrumb,
  ghostText,
  query,
  sectionLabel,
  onQueryChange,
}: {
  breadcrumb: string[]
  ghostText?: string
  query: string
  sectionLabel: string
  onQueryChange: (value: string) => void
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border/70 bg-background/88 backdrop-blur-xl transition-[width,height] ease-linear">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            {breadcrumb.map((item, index) => (
              <BreadcrumbItem key={item}>
                {index === breadcrumb.length - 1 ? (
                  <BreadcrumbPage>{item}</BreadcrumbPage>
                ) : (
                  <>
                    <span>{item}</span>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hidden text-sm font-medium text-foreground/80 md:block">{sectionLabel}</div>
        <div className="relative ml-auto w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center rounded-md px-10 text-sm text-muted-foreground/65",
              !ghostText && "opacity-0",
            )}
          >
            <span className="truncate">
              {query}
              {ghostText?.slice(query.length)}
            </span>
          </div>
          <Input
            className="relative bg-background/70 pl-10"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search replies, openers, topics..."
            value={query}
          />
        </div>
      </div>
    </header>
  )
}
