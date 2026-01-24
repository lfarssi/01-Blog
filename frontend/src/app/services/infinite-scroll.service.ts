import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InfiniteScrollService {
  private observers: IntersectionObserver[] = [];

  observeLastElement(container: HTMLElement, callback: () => void): void | (() => void) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    const observerTarget = container.lastElementChild;
    if (observerTarget) {
      observer.observe(observerTarget);
    }

    this.observers.push(observer);

    // ✅ Return cleanup function
    return () => {
      observer.disconnect();
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }
}
