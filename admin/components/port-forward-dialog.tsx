"use client"

interface PortForwardDialogProps {
  service: any
  isOpen: boolean
  onClose: () => void
}

export function PortForwardDialog({ service, isOpen, onClose }: PortForwardDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Port Forward</h3>
        {service && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Service: <span className="font-mono text-foreground">{service.name}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Type: <span className="font-mono text-foreground">{service.type}</span>
            </p>
            <input
              type="text"
              placeholder="Local port (e.g., 8080)"
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm"
            />
          </div>
        )}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  )
}
