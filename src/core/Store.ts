import type { ComposerListener, ComposerState } from "./types";

export class Store {
  private state: ComposerState;
  private listeners = new Set<ComposerListener>();

  constructor(initialState: ComposerState) {
    this.state = initialState;
  }

  getState(): ComposerState {
    return this.state;
  }

  setState(nextState: ComposerState): void {
    this.state = nextState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: ComposerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
