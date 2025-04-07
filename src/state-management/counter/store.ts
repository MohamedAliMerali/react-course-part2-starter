import { create } from "zustand";

interface CounterStore {
  counter: number;
  increament: () => void;
  reset: () => void;
}

// Create function of zustand
// this will return a custom hook that
// we can use anywhere in our application
const useCounterStore = create<CounterStore>((set) => ({
  counter: 0,
  increament: () => set((store) => ({ counter: store.counter + 1 })),
  reset: () => set(() => ({ counter: 0 })),
}));

export default useCounterStore;
