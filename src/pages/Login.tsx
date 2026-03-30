import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema, type LoginFormValues } from "@/lib/schemas"
import { loginAccount } from "@/services/api/auth"
import { ApiError } from "@/services/api/client"
import { useAuthStore } from "@/store/useAuthStore"

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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
        setApiError("Something went wrong. Is the server running?")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      {/* Stadium Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 grayscale mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-foreground/5 backdrop-blur-3xl border-2 border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-t-8 border-t-primary">
          <CardHeader className="space-y-6 text-center p-10 pb-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-[0_20px_40px_oklch(var(--primary)/0.3)] rotate-3">
                <Shield className="h-10 w-10 text-black" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-1 w-4 bg-primary" />
                <span className="text-[10px] font-black font-barlow uppercase tracking-[0.4em] text-primary italic text-center">OFFICIAL ACCESS TERMINAL</span>
                <div className="h-1 w-4 bg-primary" />
              </div>
              <CardTitle className="text-5xl font-oswald font-black tracking-tighter uppercase italic text-foreground leading-none">
                WELCOME <span className="text-primary italic">BACK</span>
              </CardTitle>
              <CardDescription className="text-foreground/40 font-oswald font-black uppercase tracking-widest text-xs mt-4 italic">
                Secure link to Fantasy World Cup 2026
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            {apiError ? (
              <p className="mb-4 text-[10px] font-oswald font-black uppercase tracking-widest text-[#ff2a2a] italic text-center" role="alert">
                {apiError}
              </p>
            ) : null}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-oswald font-black uppercase tracking-widest text-[10px] text-primary italic">Manager Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="IDENTIFICACION EMAIL" 
                          className="h-14 bg-foreground/5 border-2 border-white/10 focus:border-primary/50 text-foreground font-oswald font-black italic rounded-xl px-6 placeholder:text-foreground/10 uppercase tracking-wider" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-black italic uppercase" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-oswald font-black uppercase tracking-widest text-[10px] text-primary italic">Access Code</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="h-14 bg-foreground/5 border-2 border-white/10 focus:border-primary/50 text-foreground font-oswald font-black italic rounded-xl px-6 placeholder:text-foreground/10 tracking-[0.5em]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-black italic uppercase" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                  className="w-full h-16 bg-primary text-black hover:bg-white transition-all font-oswald font-black text-xl uppercase tracking-[0.2em] italic rounded-xl shadow-2xl shadow-primary/20 border-b-4 border-black/20"
                >
                  {form.formState.isSubmitting ? "INITIALIZING..." : "INITIALIZE SESSION"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col p-10 pt-0">
            <div className="w-full h-[1px] bg-foreground/5 mb-6" />
            <div className="text-[10px] font-black font-oswald text-center text-foreground/20 w-full uppercase tracking-widest italic">
              New Commander?{" "}
              <Link to="/register" className="text-primary hover:text-foreground transition-colors underline-offset-8 underline decoration-primary/30 decoration-2">
                CREATE CREDENTIALS
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
