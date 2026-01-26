import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  inject,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { InfiniteScrollService } from '../services/infinite-scroll.service';

@Directive({
  selector: '[infiniteList]',
  standalone: true,
})
export class InfiniteListDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private infiniteScroll = inject(InfiniteScrollService);
  private cleanup?: () => void;

  @Output() loadMore = new EventEmitter<void>();

  ngAfterViewInit() {
    this.cleanup = this.infiniteScroll.observeElement(this.el.nativeElement, () => {
      this.loadMore.emit();
    });
  }

  ngOnDestroy() {
    this.cleanup?.();
  }
}
