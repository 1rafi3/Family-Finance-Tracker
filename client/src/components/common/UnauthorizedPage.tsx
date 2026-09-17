import { Link } from 'react-router'
import { ShieldAlert, Home } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-destructive/20">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">403 - Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this resource or administrative area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Contact your family administrator if you believe you should have access to this feature.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/" className={buttonVariants({ variant: 'default', className: 'gap-2' })}>
            <Home className="h-4 w-4" />
            Return to Safety
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
