import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';

export interface VideoItem {
  src: string;
  id?: string;
  metadata?: Record<string, unknown>;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
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
}

export const VerticalFeed: React.FC<VerticalFeedProps> = ({
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});

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
                console.error('Error playing video:', error);
              });
            }
            onItemVisible?.(item, index);
          } else {
            const video = entry.target.querySelector('video') as HTMLVideoElement;
            if (video) {
              video.pause();
            }
            onItemHidden?.(item, index);
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
  }, [items, onItemVisible, onItemHidden, threshold]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !onEndReached) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      onEndReached();
    }
  }, [onEndReached]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!containerRef.current) return;

      const { scrollTop, clientHeight } = containerRef.current;
      const scrollAmount = clientHeight;

      if (!containerRef.current.scrollTo) return;

      switch (e.key) {
        case 'ArrowDown':
          containerRef.current.scrollTo({
            top: scrollTop + scrollAmount,
            behavior: scrollBehavior,
          });
          break;
        case 'ArrowUp':
          containerRef.current.scrollTo({
            top: scrollTop - scrollAmount,
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
          aria-label={`video ${index + 1}`}
        >
          {isLoading && loadingComponent}
          {hasError && errorComponent}
          <video
            src={item.src}
            muted={item.muted ?? true}
            playsInline={item.playsInline ?? true}
            controls={item.controls ?? false}
            autoPlay={item.autoPlay ?? true}
            onLoadedData={() => handleMediaLoad(index)}
            onError={() => handleMediaError(index)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isLoading || hasError ? 'none' : 'block',
            }}
          />
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
};
