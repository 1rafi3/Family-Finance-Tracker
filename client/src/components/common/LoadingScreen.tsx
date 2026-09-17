import { Loader2, Wallet } from 'lucide-react'

export function LoadingScreen({ message = 'Loading application...' }: { message?: string }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <Wallet className="h-7 w-7" />
        </div>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}
