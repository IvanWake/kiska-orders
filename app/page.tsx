"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Loader2, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()
  const [items, setItems] = useState<string[]>([])
  const [currentItem, setCurrentItem] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentItem.trim()) {
      setItems([...items, currentItem.trim()])
      setCurrentItem("")
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, comment }),
      })

      if (response.ok) {
        setItems([])
        setComment("")
        router.push("/orders")
      }
    } catch (error) {
      console.error("Failed to create order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="mb-4 sm:mb-6 flex justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 animate-bounce-slow">
              <Image
                src="/images/hello.jpg"
                alt="Hello Kitty"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance mb-2 sm:mb-3">
            Список вкусняшек
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty px-4">
            Добавь что хочешь, и я закажу для тебя ✨
          </p>
        </div>

        <Card className="p-4 sm:p-6 border-border bg-card/80 backdrop-blur-sm shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <label htmlFor="item" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Добавить вкусняшку
              </label>
              <div className="flex gap-2">
                <Input
                  id="item"
                  placeholder="Например: шоколадка 🍫"
                  value={currentItem}
                  onChange={(e) => setCurrentItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddItem(e)
                    }
                  }}
                  className="border-border bg-secondary text-base"
                />
                <Button
                  type="button"
                  onClick={handleAddItem}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 shrink-0 h-10 w-10 sm:h-11 sm:w-11"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Items list */}
            {items.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Список заказа ({items.length})</label>
                <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 sm:p-4 bg-secondary rounded-xl border border-border group hover:border-primary/50 transition-all hover:shadow-md"
                    >
                      <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-primary/20 text-primary rounded-full text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-foreground text-sm sm:text-base break-words">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 hover:bg-destructive/20 hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment input */}
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium text-foreground">
                Комментарий 💕
              </label>
              <Textarea
                id="comment"
                placeholder="Добавь милый комментарий..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="border-border bg-secondary resize-none text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 sm:h-11 text-base font-medium shadow-lg shadow-primary/20"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Отправить заказ {items.length > 0 && `(${items.length})`}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/orders")}
                className="border-primary/30 hover:border-primary hover:bg-primary/10 h-12 sm:h-11 text-base"
              >
                Все заказы
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
