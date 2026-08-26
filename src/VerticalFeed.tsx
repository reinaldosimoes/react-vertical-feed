import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
} from 'react';

export interface VideoItem {
  src: string;
  id?: string;
  metadata?: Record<string, unknown>;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  loop?: boolean;
  poster?: string;
  preload?: 'none' | 'metadata' | 'auto';
}

export interface VerticalFeedRef {
  scrollToItem: (index: number, behavior?: ScrollBehavior) => void;
  getCurrentItem: () => number;
}

export interface VerticalFeedProps {
  items: VideoItem[];
  onEndReached?: () => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onItemVisible?: (item: VideoItem, index: number) => void;
  onItemHidden?: (item: VideoItem, index: number) => void;
  onItemClick?: (item: VideoItem, index: number) => void;
  threshold?: number;
  scrollBehavior?: ScrollBehavior;
  renderItemOverlay?: (item: VideoItem, index: number) => React.ReactNode;
  /** Distance from bottom to trigger onEndReached (default: 100) */
  endReachedThreshold?: number;
  /** Callback when video playback fails */
  onVideoError?: (item: VideoItem, index: number, error: Error) => void;
  /** Callback when current visible item changes */
  onCurrentItemChange?: (index: number) => void;
  /** Default preload strategy for videos (default: 'metadata') */
  defaultPreload?: 'none' | 'metadata' | 'auto';
  /** Returns a stable key for items that may be reordered or prepended */
  getItemKey?: (item: VideoItem, index: number) => React.Key;
}

export const VerticalFeed = forwardRef<VerticalFeedRef, VerticalFeedProps>(
  (
    {
      items,
      onEndReached,
      loadingComponent,
      errorComponent,
      className,
      style,
      onItemVisible,
      onItemHidden,
      onItemClick,
      threshold = 0.75,
      scrollBehavior = 'smooth',
      renderItemOverlay,
      endReachedThreshold = 100,
      onVideoError,
      onCurrentItemChange,
      defaultPreload = 'metadata',
      getItemKey,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});
    const currentIndexRef = useRef(0);
    const hasCurrentItemRef = useRef(false);
    const endReachedCalledRef = useRef(false);
    const activeEntriesRef = useRef<Map<Element, number>>(new Map());
    const itemsRef = useRef(items);

    const onItemVisibleRef = useRef(onItemVisible);
    const onItemHiddenRef = useRef(onItemHidden);
    const onVideoErrorRef = useRef(onVideoError);
    const onCurrentItemChangeRef = useRef(onCurrentItemChange);

    useLayoutEffect(() => {
      onItemVisibleRef.current = onItemVisible;
      onItemHiddenRef.current = onItemHidden;
      onVideoErrorRef.current = onVideoError;
      onCurrentItemChangeRef.current = onCurrentItemChange;
      itemsRef.current = items;
    });

    const getItemKeyValue = useCallback(
      (item: VideoItem, index: number) => getItemKey?.(item, index) ?? item.id ?? index,
      [getItemKey]
    );

    const getMediaStateKey = useCallback(
      (item: VideoItem, index: number) => {
        const itemKey = getItemKeyValue(item, index);
        return JSON.stringify([typeof itemKey, String(itemKey), item.src]);
      },
      [getItemKeyValue]
    );

    const mediaStateKeys = useMemo(
      () => new Set(items.map((item, index) => getMediaStateKey(item, index))),
      [items, getMediaStateKey]
    );

    const observerKey = useMemo(() => {
      const itemKeys = items.map((item, index) => {
        const itemKey = getItemKeyValue(item, index);
        return [typeof itemKey, String(itemKey)];
      });
      return JSON.stringify(itemKeys);
    }, [items, getItemKeyValue]);

    useEffect(() => {
      const pruneState = (state: Record<string, boolean>) => {
        const entries = Object.entries(state).filter(([key]) => mediaStateKeys.has(key));
        return entries.length === Object.keys(state).length ? state : Object.fromEntries(entries);
      };

      setLoadingStates(pruneState);
      setErrorStates(pruneState);

      if (items.length === 0) {
        currentIndexRef.current = 0;
        hasCurrentItemRef.current = false;
      } else if (currentIndexRef.current >= items.length) {
        currentIndexRef.current = items.length - 1;
        hasCurrentItemRef.current = false;
      }
    }, [items.length, mediaStateKeys]);

    useEffect(() => {
      endReachedCalledRef.current = false;
    }, [items.length]);

    useImperativeHandle(
      ref,
      () => ({
        scrollToItem: (index: number, behavior: ScrollBehavior = scrollBehavior) => {
          const container = containerRef.current;
          if (!container || index < 0 || index >= items.length) return;
          const targetElement = container.querySelector<HTMLElement>(`[data-index="${index}"]`);
          if (targetElement) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            container.scrollTo({
              top: container.scrollTop + targetRect.top - containerRect.top,
              behavior,
            });
          }
        },
        getCurrentItem: () => currentIndexRef.current,
      }),
      [scrollBehavior, items.length]
    );

    const handleMediaLoad = useCallback((stateKey: string) => {
      setLoadingStates(prev => ({ ...prev, [stateKey]: false }));
    }, []);

    const handleMediaError = useCallback((stateKey: string, item: VideoItem, index: number) => {
      setErrorStates(prev => ({ ...prev, [stateKey]: true }));
      setLoadingStates(prev => ({ ...prev, [stateKey]: false }));
      onVideoErrorRef.current?.(item, index, new Error(`Failed to load video: ${item.src}`));
    }, []);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const activeEntries = activeEntriesRef.current;
      activeEntries.clear();

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            const indexAttribute = entry.target.getAttribute('data-index');
            if (indexAttribute === null) return;

            const index = Number.parseInt(indexAttribute, 10);
            const item = itemsRef.current[index];
            if (!item || Number.isNaN(index)) return;

            const intersectionRatio = entry.intersectionRatio ?? (entry.isIntersecting ? 1 : 0);
            const isVisible = entry.isIntersecting && intersectionRatio >= threshold;
            const wasVisible = activeEntries.has(entry.target);
            const video = entry.target.querySelector('video') as HTMLVideoElement | null;

            if (isVisible) {
              activeEntries.set(entry.target, intersectionRatio);

              if (!wasVisible) {
                if (video && item.autoPlay !== false) {
                  video.play().catch(error => {
                    if (onVideoErrorRef.current) {
                      onVideoErrorRef.current(item, index, error);
                    } else {
                      console.error('Error playing video:', error);
                    }
                  });
                }
                onItemVisibleRef.current?.(item, index);
              }
            } else {
              activeEntries.delete(entry.target);
              video?.pause();

              if (wasVisible) {
                onItemHiddenRef.current?.(item, index);
              }
            }
          });

          let nextIndex: number | null = null;
          let highestRatio = -1;

          activeEntries.forEach((ratio, element) => {
            const indexAttribute = element.getAttribute('data-index');
            if (indexAttribute === null || ratio <= highestRatio) return;

            const index = Number.parseInt(indexAttribute, 10);
            if (!Number.isNaN(index) && itemsRef.current[index]) {
              nextIndex = index;
              highestRatio = ratio;
            }
          });

          if (
            nextIndex !== null &&
            (!hasCurrentItemRef.current || currentIndexRef.current !== nextIndex)
          ) {
            currentIndexRef.current = nextIndex;
            hasCurrentItemRef.current = true;
            onCurrentItemChangeRef.current?.(nextIndex);
          }
        },
        {
          root: container,
          threshold,
        }
      );

      const mediaElements = container.querySelectorAll('[data-index]');
      mediaElements.forEach(media => observer.observe(media));

      return () => {
        observer.disconnect();
        activeEntries.clear();
      };
    }, [observerKey, threshold]);

    const handleScroll = useCallback(() => {
      if (!containerRef.current || !onEndReached) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearEnd = scrollTop + clientHeight >= scrollHeight - endReachedThreshold;

      if (isNearEnd && !endReachedCalledRef.current) {
        endReachedCalledRef.current = true;
        onEndReached();
      } else if (!isNearEnd) {
        endReachedCalledRef.current = false;
      }
    }, [onEndReached, endReachedThreshold]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!containerRef.current) return;

        const target = e.target as HTMLElement;
        if (
          target !== e.currentTarget &&
          target.closest(
            'button, a, input, textarea, select, video[controls], [contenteditable="true"], [role="button"], [role="slider"], [role="link"], [role="textbox"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"]'
          )
        ) {
          return;
        }

        const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
        const scrollAmount = clientHeight;

        switch (e.key) {
          case ' ': {
            e.preventDefault();
            const currentElement = containerRef.current.querySelector(
              `[data-index="${currentIndexRef.current}"]`
            );
            const video = currentElement?.querySelector('video') as HTMLVideoElement | null;
            if (video) {
              if (video.paused) {
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            }
            break;
          }
          case 'ArrowDown':
            e.preventDefault();
            containerRef.current.scrollTo?.({
              top: scrollTop + scrollAmount,
              behavior: scrollBehavior,
            });
            break;
          case 'ArrowUp':
            e.preventDefault();
            containerRef.current.scrollTo?.({
              top: scrollTop - scrollAmount,
              behavior: scrollBehavior,
            });
            break;
          case 'Home':
            e.preventDefault();
            containerRef.current.scrollTo?.({
              top: 0,
              behavior: scrollBehavior,
            });
            break;
          case 'End':
            e.preventDefault();
            containerRef.current.scrollTo?.({
              top: scrollHeight,
              behavior: scrollBehavior,
            });
            break;
        }
      },
      [scrollBehavior]
    );

    const defaultRenderItem = useCallback(
      (item: VideoItem, index: number) => {
        const itemKey = getItemKeyValue(item, index);
        const stateKey = getMediaStateKey(item, index);
        const isLoading = loadingStates[stateKey] ?? true;
        const hasError = errorStates[stateKey] ?? false;

        return (
          <div
            key={itemKey}
            data-index={index}
            onClick={() => onItemClick?.(item, index)}
            onKeyDown={event => {
              if (event.target === event.currentTarget && onItemClick && event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                onItemClick(item, index);
              }
            }}
            tabIndex={onItemClick ? 0 : undefined}
            style={{
              height: '100%',
              scrollSnapAlign: 'start',
              position: 'relative',
              cursor: onItemClick ? 'pointer' : 'default',
            }}
            role="article"
            aria-label={`Video ${index + 1}`}
            aria-posinset={index + 1}
            aria-setsize={items.length}
          >
            {isLoading ? loadingComponent : null}
            {hasError ? errorComponent : null}
            <video
              src={item.src}
              muted={item.muted ?? true}
              playsInline={item.playsInline ?? true}
              controls={item.controls ?? false}
              autoPlay={item.autoPlay ?? true}
              loop={item.loop ?? false}
              poster={item.poster}
              preload={item.preload ?? defaultPreload}
              onLoadedData={() => handleMediaLoad(stateKey)}
              onError={() => handleMediaError(stateKey, item, index)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: hasError && errorComponent ? 'none' : 'block',
              }}
            />
            {renderItemOverlay && renderItemOverlay(item, index)}
          </div>
        );
      },
      [
        loadingStates,
        errorStates,
        loadingComponent,
        errorComponent,
        handleMediaLoad,
        handleMediaError,
        onItemClick,
        renderItemOverlay,
        defaultPreload,
        getItemKeyValue,
        getMediaStateKey,
        items.length,
      ]
    );

    const mediaElements = useMemo(
      () => items.map((item, index) => defaultRenderItem(item, index)),
      [items, defaultRenderItem]
    );

    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="feed"
        aria-label="Vertical video feed"
        className={className}
        style={{
          height: '100vh',
          overflowY: 'scroll',
          overscrollBehaviorY: 'contain',
          scrollSnapType: 'y mandatory',
          ...style,
        }}
      >
        {mediaElements}
      </div>
    );
  }
);

VerticalFeed.displayName = 'VerticalFeed';
