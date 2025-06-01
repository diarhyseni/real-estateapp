"use client"

import type React from "react"

import { useEffect, useState } from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type ToastOptions = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const toasts: Toast[] = []

export const useToast = () => {
  const [mounted, setMounted] = useState(false)
  const [toastState, setToastState] = useState<Toast[]>([])

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      setToastState(toasts)
    }
  }, [mounted, toasts])

  return {
    toast: (options: ToastOptions) => {
      const id = genId()
      const toast: Toast = {
        id,
        ...options,
      }
      toasts.push(toast)
      setToastState([...toasts])
      return id
    },
    dismiss: (id: string) => {
      const index = toasts.findIndex((toast) => toast.id === id)
      if (index !== -1) {
        toasts.splice(index, 1)
        setToastState([...toasts])
      }
    },
    toasts: toastState,
  }
}

export function toast(options: ToastOptions) {
  const id = genId()
  const toast: Toast = {
    id,
    ...options,
  }
  toasts.push(toast)
  return id
}

toast.dismiss = (id: string) => {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
  }
}
