import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';

export interface MediaItem {
  type: 'video' | 'image';
  src: string;
  id?: string;
  metadata?: Record<string, unknown>;
}

export interface VerticalFeedProps {
  items: MediaItem[];
  onEndReached?: () => void;
  showControls?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  mediaProps?: {
    video?: React.VideoHTMLAttributes<HTMLVideoElement>;
    image?: React.ImgHTMLAttributes<HTMLImageElement>;
  };
  renderItem?: (item: MediaItem, index: number) => React.ReactNode;
  itemHeight?: string | number;
  className?: string;
  style?: React.CSSProperties;
  onItemVisible?: (item: MediaItem, index: number) => void;
  onItemHidden?: (item: MediaItem, index: number) => void;
  onItemClick?: (item: MediaItem, index: number) => void;
  threshold?: number;
  scrollBehavior?: ScrollBehavior;
}

export const VerticalFeed: React.FC<VerticalFeedProps> = ({
  items,
  onEndReached,
  showControls = false,
  loadingComponent,
  errorComponent,
  mediaProps = {},
  renderItem,
  itemHeight = '100vh',
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
            if (item.type === 'video') {
              const video = entry.target.querySelector('video') as HTMLVideoElement;
              if (video) {
                video.play().catch(error => {
                  console.error('Error playing video:', error);
                });
              }
            }
            onItemVisible?.(item, index);
          } else {
            if (item.type === 'video') {
              const video = entry.target.querySelector('video') as HTMLVideoElement;
              if (video) {
                video.pause();
              }
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
      mediaElements.forEach(media => observer.unobserve(media));
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
    (item: MediaItem, index: number) => {
      const isLoading = loadingStates[index] ?? true;
      const hasError = errorStates[index] ?? false;

      return (
        <div
          key={item.id || index}
          data-index={index}
          onClick={() => onItemClick?.(item, index)}
          style={{
            height: itemHeight,
            scrollSnapAlign: 'start',
            position: 'relative',
            cursor: onItemClick ? 'pointer' : 'default',
          }}
          role="region"
          aria-label={`${item.type} ${index + 1}`}
        >
          {isLoading && loadingComponent}
          {hasError && errorComponent}
          {item.type === 'video' ? (
            <video
              src={item.src}
              muted
              playsInline
              controls={showControls}
              onLoadedData={() => handleMediaLoad(index)}
              onError={() => handleMediaError(index)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isLoading || hasError ? 'none' : 'block',
              }}
              {...mediaProps.video}
            />
          ) : (
            <img
              src={item.src}
              onLoad={() => handleMediaLoad(index)}
              onError={() => handleMediaError(index)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isLoading || hasError ? 'none' : 'block',
              }}
              {...mediaProps.image}
            />
          )}
        </div>
      );
    },
    [
      loadingStates,
      errorStates,
      loadingComponent,
      errorComponent,
      showControls,
      mediaProps,
      itemHeight,
      handleMediaLoad,
      handleMediaError,
      onItemClick,
    ]
  );

  const mediaElements = useMemo(
    () =>
      items.map((item, index) =>
        renderItem ? renderItem(item, index) : defaultRenderItem(item, index)
      ),
    [items, renderItem, defaultRenderItem]
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="feed"
      aria-label="Vertical media feed"
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
