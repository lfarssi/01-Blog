import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InfiniteScrollService {
  observeElement(target: HTMLElement, callback: () => void): () => void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callback();
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }
}
