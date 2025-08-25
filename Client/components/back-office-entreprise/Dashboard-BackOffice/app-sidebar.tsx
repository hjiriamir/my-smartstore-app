"use client"

import * as React from "react"
import { usePathname } from 'next/navigation'
import { BarChart3, Building2, Home, LogOut, Menu, MessageSquare, Settings, Users, UserCheck, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/demande-abonnements",
      icon: Home,
    },
    {
      title: "Demandes d'Abonnement",
      url: "/demande-abonnements/demandes",
      icon: UserCheck,
      badge: "3",
    },
    {
      title: "Entreprises",
      url: "/demande-abonnements/entreprises",
      icon: Building2,
    },
    {
      title: "Utilisateurs",
      url: "/demande-abonnements/utilisateurs",
      icon: Users,
    },
    {
      title: "Analytics",
      url: "/demande-abonnements/analytics",
      icon: BarChart3,
    },
    {
      title: "Messages & Emails",
      url: "/demande-abonnements/messages",
      icon: MessageSquare,
      badge: "12",
    },
  ],
}

export function AppSidebar() {
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <>
      {/* Bouton de menu pour mobile */}
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out",
          isDesktop ? "translate-x-0" : 
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar className="h-full border-r">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="/demande-abonnements" onClick={closeSidebar}>
                    <div className="flex items-center gap-2">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Building2 className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">AdminHub</span>
                        <span className="truncate text-xs">Gestion d'entreprises</span>
                      </div>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {data.navMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                      >
                        <a 
                          href={item.url} 
                          className="flex items-center w-full"
                          onClick={closeSidebar}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge className="ml-auto">{item.badge}</Badge>
                            )}
                          </div>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Admin User</span>
                      <span className="truncate text-xs">admin@adminhub.com</span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={closeSidebar}
                  >
                    <div className="flex items-center gap-2">
                      <LogOut />
                      <span>Déconnexion</span>
                    </div>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Overlay pour mobile */}
      {!isDesktop && isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  )
}