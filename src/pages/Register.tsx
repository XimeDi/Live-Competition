import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { registerSchema, type RegisterFormValues } from "@/lib/schemas"
import { registerAccount } from "@/services/api/auth"
import { ApiError } from "@/services/api/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useUiStore } from "@/store/useUiStore"
import { translations } from "@/lib/translations"

export function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { language } = useUiStore()
  const t = translations[language].register
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  })

  async function onSubmit(values: RegisterFormValues) {
    setApiError(null)
    try {
      const { user, token } = await registerAccount({
        username: values.username,
        email: values.email,
        password: values.password,
      })
      login(user, token)
      navigate("/")
    } catch (e) {
      if (e instanceof ApiError) {
        setApiError(e.message)
      } else {
        setApiError(t.serverError)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 py-16">
      <div className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-green-600 via-primary to-green-600 z-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Trophy className="h-8 w-8 text-black" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-primary uppercase tracking-widest">{t.brand}</p>
            <h1 className="text-2xl font-black text-foreground">{t.brandTitle}</h1>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-1">{t.title}</h2>
            <p className="text-sm text-foreground/50 mb-6">{t.subtitle}</p>

            {apiError && (
              <div className="mb-5 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive font-medium">{apiError}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground/70">{t.usernameLabel}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.usernamePlaceholder}
                          className="h-11 bg-background/60 border-border/60 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground/70">{t.emailLabel}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.emailPlaceholder}
                          className="h-11 bg-background/60 border-border/60 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground/70">{t.passwordLabel}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t.passwordPlaceholder}
                          className="h-11 bg-background/60 border-border/60 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground/70">{t.confirmPasswordLabel}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t.confirmPasswordPlaceholder}
                          className="h-11 bg-background/60 border-border/60 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-11 bg-primary text-black font-bold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 mt-2"
                >
                  {form.formState.isSubmitting ? t.submitting : t.submit}
                </Button>
              </form>
            </Form>
          </div>

          <div className="px-8 py-5 border-t border-border/40 bg-foreground/[0.02] text-center">
            <p className="text-sm text-foreground/50">
              {t.hasAccount}{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                {t.signIn}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
