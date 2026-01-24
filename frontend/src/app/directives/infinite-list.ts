import { Directive, ElementRef, Output, EventEmitter, inject, OnDestroy } from '@angular/core';
import { InfiniteScrollService } from '../services/infinite-scroll.service';

@Directive({
  selector: '[infiniteList]',
  standalone: true,
})
export class InfiniteListDirective implements OnDestroy {
  private el = inject(ElementRef);
  private infiniteScroll = inject(InfiniteScrollService);
  private cleanup?: () => void; // ✅ DECLARED PROPERTY

  @Output() loadMore = new EventEmitter<void>();

  ngAfterViewInit() {
    this.infiniteScroll.observeLastElement(this.el.nativeElement as HTMLElement, () =>
      this.loadMore.emit(),
    );
  }
  ngOnDestroy() {
    this.cleanup?.(); // ✅ Disconnect observer
  }
}
