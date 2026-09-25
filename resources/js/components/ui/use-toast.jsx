import { useState, useEffect } from "react";

const TOAST_LIMIT = 1

let count = 0
function generateId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const dismissMap = new Map();

const toastStore = {
  state: {
    toasts: [],
  },
  listeners: [],
  
  getState() {
    return this.state;
  },
  
  setState(nextState) {
    if (typeof nextState === 'function') {
      this.state = nextState(this.state);
    } else {
      this.state = { ...this.state, ...nextState };
    }

    this.listeners.forEach((listener) => listener(this.state));
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const toast = ({ ...props }) => {
  const id = generateId()

  const update = (next) => toastStore.setState((state) => ({
    ...state,
    toasts: state.toasts.map((t) =>
      t.id === id ? { ...t, ...next } : t
    ),
  }))

  const dismiss = () => {
    dismissMap.delete(id);
    toastStore.setState((state) => ({
      ...state,
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  }

  dismissMap.set(id, dismiss);

  toastStore.setState((state) => ({
    ...state,
    toasts: [
      { ...props, id, dismiss },
      ...state.toasts,
    ].slice(0, TOAST_LIMIT),
  }))

  return { id, dismiss, update }
}

export function useToast() {
  const [state, setState] = useState(toastStore.getState())
  
  useEffect(() => {
    const unsubscribe = toastStore.subscribe(setState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timeouts = []

    state.toasts.forEach((toast) => {
      if (toast.duration === Infinity) return;

      const dismiss = dismissMap.get(toast.id);
      if (!dismiss) return;

      const timeout = setTimeout(() => {
        dismiss()
      }, toast.duration || 5000)

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [state.toasts])

  return {
    toast,
    toasts: state.toasts,
  }
}