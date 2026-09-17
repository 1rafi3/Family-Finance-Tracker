import { Link } from 'react-router'
import { FileQuestion, Home } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
            <FileQuestion className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">404 - Page Not Found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please check the URL or return to the dashboard.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/" className={buttonVariants({ variant: 'default', className: 'gap-2' })}>
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
