import * as React from "react"

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open, onOpenChange, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open ?? false)

    React.useEffect(() => {
      if (open !== undefined) setIsOpen(open)
    }, [open])

    const handleOpenChange = (next: boolean) => {
      setIsOpen(next)
      onOpenChange?.(next)
    }

    return (
      <div ref={ref} {...props} data-state={isOpen ? "open" : "closed"}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child
          // Pass isOpen and handler to children if they want
          return React.cloneElement(child as any, { isOpen, onOpenChange: handleOpenChange })
        })}
      </div>
    )
  }
)
Collapsible.displayName = "Collapsible"

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ asChild, isOpen, onOpenChange, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange?.(!isOpen)
      props.onClick?.(e)
    }
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as any, {
        onClick: handleClick,
        ref,
        "aria-expanded": isOpen,
      })
    }
    return (
      <button
        type="button"
        ref={ref}
        aria-expanded={isOpen}
        {...props}
        onClick={handleClick}
      >
        {children}
      </button>
    )
  }
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

export const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ isOpen, style, ...props }, ref) => {
    return isOpen ? (
      <div ref={ref} {...props} style={style} />
    ) : null
  }
)
CollapsibleContent.displayName = "CollapsibleContent" 