import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type LearnMoreProps = {
  children: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  triggerProps?: ComponentPropsWithoutRef<typeof Button>
  contentProps?: ComponentPropsWithoutRef<typeof PopoverContent>
}

export function LearnMore({
  children,
  defaultOpen,
  open,
  onOpenChange,
  triggerProps,
  contentProps,
}: LearnMoreProps) {
  return (
    <Popover defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button type='button' variant='ghost' size='icon' {...triggerProps}>
          ?
        </Button>
      </PopoverTrigger>
      <PopoverContent {...contentProps}>{children}</PopoverContent>
    </Popover>
  )
}