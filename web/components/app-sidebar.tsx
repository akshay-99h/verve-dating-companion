"use client"

import * as React from "react"
import {
  BookOpenTextIcon,
  BookmarkIcon,
  MessageCircleMoreIcon,
  MessagesSquareIcon,
  SearchIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

type SectionKey = "replies" | "openers" | "topics" | "saved" | "about"

const sectionMeta: Record<
  SectionKey,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  replies: { icon: MessageCircleMoreIcon, label: "Replies" },
  openers: { icon: MessagesSquareIcon, label: "Openers" },
  topics: { icon: BookOpenTextIcon, label: "Topics" },
  saved: { icon: BookmarkIcon, label: "Saved" },
  about: { icon: SearchIcon, label: "About" },
}

export function AppSidebar({
  activeSection,
  counts,
  onSectionSelect,
  onSignOut,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeSection: SectionKey
  counts: Record<SectionKey, string>
  onSectionSelect: (section: SectionKey) => void
  onSignOut: () => void
  user: {
    email: string
    name: string
  }
}) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="gap-3 px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="min-h-12 rounded-xl px-3 data-[slot=sidebar-menu-button]:!p-3"
              onClick={() => onSectionSelect("replies")}
              size="lg"
            >
              <div className="flex size-9 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar-accent/75">
                <MessageCircleMoreIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="text-sm font-semibold tracking-[-0.02em]">Verve</span>
                <span className="text-xs text-muted-foreground">Conversation library</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(Object.keys(sectionMeta) as SectionKey[]).map((section) => {
                const meta = sectionMeta[section]
                const Icon = meta.icon

                return (
                  <SidebarMenuItem key={section}>
                    <SidebarMenuButton
                      className="h-10 rounded-lg"
                      isActive={activeSection === section}
                      onClick={() => onSectionSelect(section)}
                      tooltip={meta.label}
                    >
                      <Icon />
                      <span>{meta.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{counts[section]}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3">
        <SidebarSeparator />
        <NavUser onSignOut={onSignOut} user={{ avatar: "", email: user.email, name: user.name }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
