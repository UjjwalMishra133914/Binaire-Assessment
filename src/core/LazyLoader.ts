/** Lazy loading from scratch on top of the browser IntersectionObserver primitive. */
export class LazyLoader {
  private observer: IntersectionObserver;
  private handlers = new WeakMap<Element, () => void>();

  constructor(rootMargin = "200px") {
    this.observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        this.handlers.get(e.target)?.();
        this.unobserve(e.target);
      }
    }, { rootMargin });
  }
  observe(el: Element, onVisible: () => void) { this.handlers.set(el, onVisible); this.observer.observe(el); }
  unobserve(el: Element) { this.handlers.delete(el); this.observer.unobserve(el); }
}
export const sharedLazyLoader = new LazyLoader();
