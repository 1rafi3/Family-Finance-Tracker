import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, Sparkles, UserPlus, Zap } from 'lucide-react'
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/apiClient'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { login, register: registerUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Login form
  const {
    register: registerLoginForm,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm<LoginInput>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Register form
  const {
    register: registerRegForm,
    handleSubmit: handleRegSubmit,
    formState: { errors: regErrors },
  } = useForm<RegisterInput>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const onLoginSubmit = async (data: LoginInput) => {
    setServerError(null)

    const parseResult = loginSchema.safeParse(data)
    if (!parseResult.success) {
      setServerError(parseResult.error.issues[0]?.message || 'Invalid form input')
      return
    }

    setIsSubmitting(true)
    try {
      await login(parseResult.data)
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onRegisterSubmit = async (data: RegisterInput) => {
    setServerError(null)

    const parseResult = registerSchema.safeParse(data)
    if (!parseResult.success) {
      setServerError(parseResult.error.issues[0]?.message || 'Invalid form input')
      return
    }

    setIsSubmitting(true)
    try {
      await registerUser(parseResult.data)
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError('Registration failed. Please check your details and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillAndLogin = async (email: string, pass: string) => {
    setServerError(null)
    setActiveTab('login')
    setLoginValue('email', email)
    setLoginValue('password', pass)
    setIsSubmitting(true)
    try {
      await login({ email, password: pass })
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError('Quick login failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background/95 p-4 relative overflow-hidden">
      {/* Background subtle glow aesthetics */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-3 transition-transform hover:scale-105">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FinFlow</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personal Finance & Wealth Management
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-muted/60 p-1 border border-border/50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setServerError(null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-background text-foreground shadow-sm shadow-black/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register')
              setServerError(null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-background text-foreground shadow-sm shadow-black/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </button>
        </div>

        {/* Card Form */}
        <Card className="shadow-xl border-border/80 backdrop-blur-sm bg-card/90">
          <CardHeader>
            <CardTitle className="text-xl">
              {activeTab === 'login' ? 'Welcome back' : 'Get started with FinFlow'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'login'
                ? 'Sign in to access your personal dashboard & accounts'
                : 'Create your private personal finance workspace in seconds'}
            </CardDescription>
          </CardHeader>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
              <CardContent className="space-y-4">
                {serverError && (
                  <div
                    role="alert"
                    className="flex items-center space-x-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                )}

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={loginErrors.email?.message}
                  {...registerLoginForm('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Invalid email address',
                    },
                  })}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={loginErrors.password?.message}
                  {...registerLoginForm('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Quick Login Helpers */}
                <div className="w-full pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Quick 1-Click Login:
                    </span>
                    <span>No typing required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => fillAndLogin('rafi@example.com', 'Rafi1234!')}
                      className="text-left p-2.5 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all text-xs group"
                    >
                      <div className="font-semibold text-foreground group-hover:text-primary flex items-center justify-between">
                        <span>Rafi</span>
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground group-hover:text-primary opacity-60" />
                      </div>
                      <div className="text-muted-foreground text-[11px] truncate">rafi@example.com</div>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => fillAndLogin('admin@family.com', 'Admin1234!')}
                      className="text-left p-2.5 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-primary/5 transition-all text-xs group"
                    >
                      <div className="font-semibold text-foreground group-hover:text-primary flex items-center justify-between">
                        <span>Admin</span>
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground group-hover:text-primary opacity-60" />
                      </div>
                      <div className="text-muted-foreground text-[11px] truncate">admin@family.com</div>
                    </button>
                  </div>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleRegSubmit(onRegisterSubmit)}>
              <CardContent className="space-y-4">
                {serverError && (
                  <div
                    role="alert"
                    className="flex items-center space-x-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="John"
                    error={regErrors.firstName?.message}
                    {...registerRegForm('firstName', {
                      required: 'First name is required',
                      minLength: { value: 1, message: 'Required' },
                    })}
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    error={regErrors.lastName?.message}
                    {...registerRegForm('lastName', {
                      required: 'Last name is required',
                      minLength: { value: 1, message: 'Required' },
                    })}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={regErrors.email?.message}
                  {...registerRegForm('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Invalid email address',
                    },
                  })}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  error={regErrors.password?.message}
                  {...registerRegForm('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  <span>Create Account & Log In</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login')
                      setServerError(null)
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign In instead
                  </button>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Protected personal wealth portal. All financial data is encrypted and private.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
