import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

type ReuseMode = 'static' | 'byQuery';

interface ScrollPosition {
  left: number;
  top: number;
  selector?: string;
}

interface ScrollRestoreState {
  position: ScrollPosition;
  attemptsLeft: number;
}

interface CachedRouteHandle {
  handle: DetachedRouteHandle;
  scrollPosition: ScrollPosition;
  lastUsedAt: number;
  usageOrder: number;
}

@Injectable()
export class AppRouteReuseStrategy implements RouteReuseStrategy {
  private readonly maxCachedRoutes = 10;
  private readonly storedRoutes = new Map<string, CachedRouteHandle>();
  private usageSequence = 0;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {}

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data?.['reuse'] === true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const routeKey = this.getRouteKey(route);

    if (!handle) {
      return;
    }

    const scrollPosition = this.readScrollPosition(route);
    this.storedRoutes.set(routeKey, {
      handle,
      scrollPosition,
      lastUsedAt: Date.now(),
      usageOrder: ++this.usageSequence,
    });
    this.trimCache();
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const routeKey = this.getRouteKey(route);
    return route.data?.['reuse'] === true && this.storedRoutes.has(routeKey);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (route.data?.['reuse'] !== true) {
      return null;
    }

    const routeKey = this.getRouteKey(route);
    const cachedRoute = this.storedRoutes.get(routeKey);

    if (!cachedRoute) {
      return null;
    }

    cachedRoute.lastUsedAt = Date.now();
    cachedRoute.usageOrder = ++this.usageSequence;
    this.restoreScrollAfterAttach(cachedRoute.scrollPosition);

    return cachedRoute.handle;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === current.routeConfig;
  }

  clearAll(): void {
    this.storedRoutes.clear();
    this.usageSequence = 0;
  }

  clearRoute(routeKey: string): void {
    this.storedRoutes.delete(routeKey);
  }

  private getRouteKey(route: ActivatedRouteSnapshot): string {
    const path = route.pathFromRoot
      .map((snapshot) => snapshot.routeConfig?.path ?? '')
      .join('/');
    const mode = (route.data?.['reuseMode'] as ReuseMode | undefined) ?? 'static';

    if (mode !== 'byQuery') {
      return path;
    }

    const queryKeys = (route.data?.['reuseQueryKeys'] as string[] | undefined) ?? [];
    const query = queryKeys
      .map((key) => `${key}=${route.queryParamMap.get(key) ?? ''}`)
      .join('&');

    return `${path}?${query}`;
  }

  private readScrollPosition(route: ActivatedRouteSnapshot): ScrollPosition {
    const selector = this.getScrollContainerSelector(route);
    const element = selector ? this.queryScrollContainer(selector) : null;

    if (element) {
      return {
        left: element.scrollLeft,
        top: element.scrollTop,
        selector,
      };
    }

    if (!this.isBrowser()) {
      return { left: 0, top: 0 };
    }

    return {
      left: window.scrollX,
      top: window.scrollY,
    };
  }

  private restoreScrollAfterAttach(position: ScrollPosition): void {
    if (!this.isBrowser()) {
      return;
    }

    this.restoreScrollWhenReady({
      position,
      attemptsLeft: 12,
    });
  }

  private restoreScrollWhenReady(state: ScrollRestoreState): void {
    requestAnimationFrame(() => {
      this.restoreScrollPosition(state.position);
      const after = this.getCurrentScrollPosition(state.position);
      const restored = this.isScrollRestored(state.position, after);

      if (!restored && state.attemptsLeft > 1) {
        this.restoreScrollWhenReady({
          position: state.position,
          attemptsLeft: state.attemptsLeft - 1,
        });
      }
    });
  }

  private restoreScrollPosition(position: ScrollPosition): void {
    if (position.selector) {
      const element = this.queryScrollContainer(position.selector);
      if (element) {
        element.scrollTo({
          left: position.left,
          top: position.top,
          behavior: 'auto',
        });
      }
      return;
    }

    window.scrollTo({
      left: position.left,
      top: position.top,
      behavior: 'auto',
    });
  }

  private getScrollContainerSelector(route: ActivatedRouteSnapshot): string | undefined {
    return route.data?.['scrollContainerSelector'] as string | undefined;
  }

  private queryScrollContainer(selector: string): HTMLElement | null {
    if (!this.isBrowser()) {
      return null;
    }

    return this.document.querySelector<HTMLElement>(selector);
  }

  private getCurrentScrollPosition(position: ScrollPosition): ScrollPosition {
    if (position.selector) {
      const element = this.queryScrollContainer(position.selector);

      return {
        left: element?.scrollLeft ?? 0,
        top: element?.scrollTop ?? 0,
        selector: position.selector,
      };
    }

    return {
      left: window.scrollX,
      top: window.scrollY,
    };
  }

  private isScrollRestored(target: ScrollPosition, current: ScrollPosition): boolean {
    return Math.abs(target.top - current.top) <= 2 && Math.abs(target.left - current.left) <= 2;
  }

  private trimCache(): void {
    if (this.storedRoutes.size <= this.maxCachedRoutes) {
      return;
    }

    const oldestRoute = [...this.storedRoutes.entries()]
      .sort(([, left], [, right]) => left.usageOrder - right.usageOrder)[0];

    if (oldestRoute) {
      this.storedRoutes.delete(oldestRoute[0]);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
