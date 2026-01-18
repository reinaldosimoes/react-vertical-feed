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
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
    const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
    const currentIndexRef = useRef(0);
    const endReachedCalledRef = useRef(false);

    // Stable refs for callbacks to avoid recreating IntersectionObserver
    const onItemVisibleRef = useRef(onItemVisible);
    const onItemHiddenRef = useRef(onItemHidden);
    const onVideoErrorRef = useRef(onVideoError);
    const onCurrentItemChangeRef = useRef(onCurrentItemChange);

    useLayoutEffect(() => {
      onItemVisibleRef.current = onItemVisible;
      onItemHiddenRef.current = onItemHidden;
      onVideoErrorRef.current = onVideoError;
      onCurrentItemChangeRef.current = onCurrentItemChange;
    });

    // Imperative handle for programmatic control
    useImperativeHandle(
      ref,
      () => ({
        scrollToItem: (index: number, behavior: ScrollBehavior = scrollBehavior) => {
          if (!containerRef.current || index < 0 || index >= items.length) return;
          const targetElement = containerRef.current.querySelector(`[data-index="${index}"]`);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior, block: 'start' });
          }
        },
        getCurrentItem: () => currentIndexRef.current,
      }),
      [scrollBehavior, items.length]
    );

    const handleMediaLoad = useCallback((index: number) => {
      setLoadingStates(prev => ({ ...prev, [index]: false }));
    }, []);

    const handleMediaError = useCallback((index: number) => {
      setErrorStates(prev => ({ ...prev, [index]: true }));
      setLoadingStates(prev => ({ ...prev, [index]: false }));
    }, []);

    useEffect(() => {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            const item = items[index];

            if (entry.isIntersecting) {
              const video = entry.target.querySelector('video') as HTMLVideoElement;
              if (video) {
                video.play().catch(error => {
                  if (onVideoErrorRef.current) {
                    onVideoErrorRef.current(item, index, error);
                  } else {
                    console.error('Error playing video:', error);
                  }
                });
              }
              currentIndexRef.current = index;
              onCurrentItemChangeRef.current?.(index);
              onItemVisibleRef.current?.(item, index);
            } else {
              const video = entry.target.querySelector('video') as HTMLVideoElement;
              if (video) {
                video.pause();
              }
              onItemHiddenRef.current?.(item, index);
            }
          });
        },
        {
          threshold,
        }
      );

      const mediaElements = containerRef.current?.querySelectorAll('[data-index]') || [];
      mediaElements.forEach(media => observer.observe(media));

      return () => {
        observer.disconnect();
      };
    }, [items, threshold]);

    const handleScroll = useCallback(() => {
      if (!containerRef.current || !onEndReached) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearEnd = scrollTop + clientHeight >= scrollHeight - endReachedThreshold;

      if (isNearEnd && !endReachedCalledRef.current) {
        endReachedCalledRef.current = true;
        onEndReached();
      } else if (!isNearEnd) {
        // Reset the flag when user scrolls away from the end
        endReachedCalledRef.current = false;
      }
    }, [onEndReached, endReachedThreshold]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!containerRef.current) return;

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
            containerRef.current.scrollTo?.({
              top: scrollTop + scrollAmount,
              behavior: scrollBehavior,
            });
            break;
          case 'ArrowUp':
            containerRef.current.scrollTo?.({
              top: scrollTop - scrollAmount,
              behavior: scrollBehavior,
            });
            break;
          case 'Home':
            containerRef.current.scrollTo?.({
              top: 0,
              behavior: scrollBehavior,
            });
            break;
          case 'End':
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
        const isLoading = loadingStates[index] ?? true;
        const hasError = errorStates[index] ?? false;

        return (
          <div
            key={item.id || index}
            data-index={index}
            onClick={() => onItemClick?.(item, index)}
            style={{
              height: '100vh',
              scrollSnapAlign: 'start',
              position: 'relative',
              cursor: onItemClick ? 'pointer' : 'default',
            }}
            role="region"
            aria-label={`Video ${index + 1}`}
          >
            {isLoading && loadingComponent}
            {hasError && errorComponent}
            <video
              src={item.src}
              muted={item.muted ?? true}
              playsInline={item.playsInline ?? true}
              controls={item.controls ?? false}
              autoPlay={item.autoPlay ?? true}
              loop={item.loop ?? false}
              poster={item.poster}
              preload={item.preload ?? defaultPreload}
              onLoadedData={() => handleMediaLoad(index)}
              onError={() => handleMediaError(index)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isLoading || hasError ? 'none' : 'block',
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
          scrollSnapType: 'y mandatory',
          outline: 'none',
          ...style,
        }}
      >
        {mediaElements}
      </div>
    );
  }
);

VerticalFeed.displayName = 'VerticalFeed';
