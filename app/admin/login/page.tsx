"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Heart, Lock } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Simple password check - можно заменить на свой пароль
    if (password === "adminkasuka") {
      localStorage.setItem("isAdmin", "true")
      router.push("/orders")
    } else {
      setError("Неверный пароль")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 border-border bg-card shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Вход для админа</h1>
          <p className="mt-2 text-sm text-muted-foreground">Введите пароль для доступа</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-border bg-secondary"
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
            <Heart className="mr-2 h-4 w-4 fill-current" />
            Войти
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            Назад
          </Button>
        </form>
      </Card>
    </div>
  )
}
