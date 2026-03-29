'use client'

import { Bell, BellOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type NotificationBellProps = {
  count?: number
}

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full text-xs flex items-center justify-center px-1 pointer-events-none"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 pb-2">
          <span className="text-sm font-semibold">Notifications</span>
          <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2" disabled>
            Mark all read
          </Button>
        </div>
        <Separator />
        <div className="py-8 text-center">
          <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}