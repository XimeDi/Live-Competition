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
import { loginSchema, type LoginFormValues } from "@/lib/schemas"
import { loginAccount } from "@/services/api/auth"
import { ApiError } from "@/services/api/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useUiStore } from "@/store/useUiStore"
import { translations } from "@/lib/translations"

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { language } = useUiStore()
  const t = translations[language].login
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginFormValues) {
    setApiError(null)
    try {
      const { user, token } = await loginAccount(values)
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
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/80 to-primary/10" />
        
        {/* Dynamic Spotlights */}
        <motion.div 
          animate={{ x: ['-20%', '20%'], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute top-0 left-1/4 w-96 h-full bg-primary/20 blur-[120px] -rotate-12" 
        />
        <motion.div 
          animate={{ x: ['20%', '-20%'], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute top-0 right-1/4 w-96 h-full bg-white/5 blur-[120px] rotate-12" 
        />
      </div>

      <div className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-green-600 via-primary to-green-600 z-50 shadow-[0_0_20px_oklch(var(--primary))]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-10 gap-4">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] border border-white/20"
          >
            <Trophy className="h-10 w-10 text-black fill-black" />
          </motion.div>
          <div className="text-center">
            <p className="text-[10px] font-oswald font-black text-primary uppercase tracking-[0.6em] italic mb-1">
              {t.brand}
            </p>
            <h1 className="text-4xl font-oswald font-black text-white italic uppercase tracking-tighter leading-none">
              {t.brandTitle}
            </h1>
          </div>
        </div>

        {/* Form Card (Glassmorphism) */}
        <div className="rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-oswald font-bold text-white uppercase italic tracking-tight">{t.title}</h2>
              <p className="text-sm text-white/40 font-medium">{t.subtitle}</p>
            </div>

            {apiError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3"
              >
                <p className="text-sm text-destructive font-medium">{apiError}</p>
              </motion.div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black font-barlow text-white/40 uppercase tracking-widest leading-none ml-1">
                        {t.emailLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.emailPlaceholder}
                          className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-white placeholder:text-white/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold text-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black font-barlow text-white/40 uppercase tracking-widest leading-none ml-1">
                        {t.passwordLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t.passwordPlaceholder}
                          className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 transition-all text-white placeholder:text-white/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase font-bold text-destructive" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-14 bg-primary text-black font-oswald font-black italic text-lg uppercase tracking-wider rounded-2xl hover:bg-primary/80 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {form.formState.isSubmitting ? t.submitting : t.submit}
                </Button>
              </form>
            </Form>
          </div>

          <div className="px-10 py-6 border-t border-white/5 bg-white/[0.02] text-center">
            <p className="text-sm text-white/30 font-medium">
              {t.noAccount}{" "}
              <Link to="/register" className="text-primary font-bold hover:text-primary/70 transition-colors tracking-tight">
                {t.createAccount}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Ambient Text */}
        <p className="mt-8 text-center text-[10px] font-black font-barlow text-white/10 uppercase tracking-[0.8em] italic">
          ESTABLISHED 2026 // FIFA OFFICIAL
        </p>
      </motion.div>
    </div>
  )
}
