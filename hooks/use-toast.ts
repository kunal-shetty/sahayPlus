'use client'

/**
 * @file use-toast.ts
 * @description Custom hook and state manager for displaying non-blocking toast notifications.
 * Inspired by the react-hot-toast library, it provides a global dispatch system to trigger,
 * update, and dismiss toasts from anywhere in the application.
 */

import * as React from 'react'
import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

/** Maximum number of toasts allowed to be visible at once. */
const TOAST_LIMIT = 1
/** Delay in milliseconds before a dismissed toast is completely removed from the state. */
const TOAST_REMOVE_DELAY = 1000000

/** Internal representation of a toast with a unique identifier. */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

/** Action types for the toast reducer. */
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const

let count = 0

/** Generates a unique numeric ID for each toast. */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

/**
 * Discriminated union of possible actions that can modify the toast state.
 */
type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: ToasterToast['id']
    }

/** Shape of the toast manager state. */
interface State {
  toasts: ToasterToast[]
}

/** Map to track active timeouts for toast removal. */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Schedules a toast for complete removal from the state after the defined delay.
 * @param {string} toastId - The ID of the toast to remove.
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Reducer function that handles state transitions for the toast system.
 * @param {State} state - Current state.
 * @param {Action} action - The action to apply.
 * @returns {State} The updated state.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

/** List of subscribers to state changes. */
const listeners: Array<(state: State) => void> = []

/** The current state held in memory outside of the React tree. */
let memoryState: State = { toasts: [] }

/**
 * Dispatches an action to the reducer and notifies all registered listeners.
 * @param {Action} action - The action to perform.
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, 'id'>

/**
 * Imperative function to trigger a new toast notification.
 * @param {Toast} props - The properties of the toast to display.
 * @returns {{ id: string, dismiss: () => void, update: (props: ToasterToast) => void }}
 * An object containing the toast ID and methods to control the toast.
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Hook that provides access to the toast state and the trigger functions.
 * It subscribes to the global toast state and updates the local React state on changes.
 *
 * @returns {{ ...State, toast: typeof toast, dismiss: (toastId?: string) => void }}
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export { useToast, toast }
