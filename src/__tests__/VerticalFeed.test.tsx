import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VerticalFeed, VerticalFeedRef, VideoItem } from '../VerticalFeed';

// Extend Window interface
declare global {
  interface Window {
    intersectionObserverCallback: IntersectionObserverCallback;
  }
}

// Mock IntersectionObserver
const mockDisconnect = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();

const mockIntersectionObserver = jest.fn().mockImplementation(callback => {
  window.intersectionObserverCallback = callback;
  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: () => [],
  };
});

window.IntersectionObserver = mockIntersectionObserver;

const createIntersectionEntry = (
  target: Element,
  isIntersecting: boolean,
  intersectionRatio: number
): IntersectionObserverEntry => ({
  target,
  isIntersecting,
  intersectionRatio,
  boundingClientRect: {} as DOMRectReadOnly,
  intersectionRect: {} as DOMRectReadOnly,
  rootBounds: null,
  time: 0,
});

describe('VerticalFeed', () => {
  const mockItems: VideoItem[] = [
    {
      src: 'test-video-1.mp4',
      id: '1',
      controls: true,
      autoPlay: true,
      muted: true,
      playsInline: true,
    },
    {
      src: 'test-video-2.mp4',
      id: '2',
      controls: true,
      autoPlay: true,
      muted: true,
      playsInline: true,
    },
  ];

  let mockDisconnect: jest.Mock;
  let mockObserve: jest.Mock;
  let mockUnobserve: jest.Mock;
  let mockObserver: { disconnect: jest.Mock; observe: jest.Mock; unobserve: jest.Mock };
  let mockIntersectionObserver: jest.Mock;
  let observerCallback: IntersectionObserverCallback;

  beforeEach(() => {
    // Mock scrollTo method
    Element.prototype.scrollTo = jest.fn();
    // Mock video methods
    HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLVideoElement.prototype.pause = jest.fn();
    // Reset IntersectionObserver mocks
    mockDisconnect = jest.fn();
    mockObserve = jest.fn();
    mockUnobserve = jest.fn();
    observerCallback = jest.fn();
    mockObserver = {
      disconnect: mockDisconnect,
      observe: mockObserve,
      unobserve: mockUnobserve,
    };
    mockIntersectionObserver = jest.fn().mockImplementation(callback => {
      observerCallback = callback;
      return mockObserver;
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<VerticalFeed items={mockItems} />);
    expect(screen.getByRole('feed')).toBeInTheDocument();
  });

  it('renders the correct number of items', () => {
    render(<VerticalFeed items={mockItems} />);
    const items = screen.getAllByRole('article');
    expect(items).toHaveLength(mockItems.length);
  });

  it('renders videos with correct attributes', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videos = container.querySelectorAll('video');

    videos.forEach((video, index) => {
      expect(video).toHaveAttribute('src', mockItems[index].src);
      expect(video.controls).toBe(true);
      expect(video.autoplay).toBe(true);
      expect(video.muted).toBe(true);
      expect(video.playsInline).toBe(true);
    });
  });

  it('calls onItemClick when an item is clicked', () => {
    const handleItemClick = jest.fn();
    render(<VerticalFeed items={mockItems} onItemClick={handleItemClick} />);

    const firstItem = screen.getAllByRole('article')[0];
    fireEvent.click(firstItem);

    expect(handleItemClick).toHaveBeenCalledWith(mockItems[0], 0);
  });

  it('renders loading components for each item initially', () => {
    const loadingComponent = <div data-testid="loading">Loading...</div>;
    render(<VerticalFeed items={mockItems} loadingComponent={loadingComponent} />);

    const loadingElements = screen.getAllByTestId('loading');
    expect(loadingElements).toHaveLength(mockItems.length);
  });

  it('renders error component when video fails to load', () => {
    const errorComponent = <div data-testid="error">Error occurred</div>;
    const { container } = render(
      <VerticalFeed items={mockItems} errorComponent={errorComponent} />
    );

    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toHaveAttribute('src', 'test-video-1.mp4');

    act(() => {
      fireEvent.error(video);
    });

    expect(screen.getByTestId('error')).toBeInTheDocument();
  });

  it('applies custom className and style', () => {
    const className = 'custom-feed';
    const style = { backgroundColor: 'red' };

    render(<VerticalFeed items={mockItems} className={className} style={style} />);

    const feed = screen.getByRole('feed');
    expect(feed).toHaveClass(className);
    expect(feed).toHaveStyle(style);
  });

  it('contains vertical overscroll while allowing a style override', () => {
    const { rerender } = render(<VerticalFeed items={mockItems} />);
    const feed = screen.getByRole('feed');

    expect(feed.style.overscrollBehaviorY).toBe('contain');

    rerender(<VerticalFeed items={mockItems} style={{ overscrollBehaviorY: 'auto' }} />);

    expect(feed.style.overscrollBehaviorY).toBe('auto');
  });

  it('handles video load events correctly', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);

    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toHaveAttribute('src', 'test-video-1.mp4');

    act(() => {
      fireEvent.loadedData(video);
    });

    expect(video).toHaveStyle({ display: 'block' });
  });

  it('handles keyboard navigation', () => {
    render(<VerticalFeed items={mockItems} />);
    const feed = screen.getByRole('feed');

    fireEvent.keyDown(feed, { key: 'ArrowDown' });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(feed, { key: 'ArrowUp' });
    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('plays video when it becomes visible', async () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    const videoContainer = video.parentElement!;

    // Get the callback from the mock
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    await act(async () => {
      observerCallback([{ isIntersecting: true, target: videoContainer }]);
    });

    expect(video.play).toHaveBeenCalled();
  });

  it('pauses video when it becomes hidden', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    const videoContainer = video.parentElement!;

    // Get the callback from the mock
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      observerCallback([{ isIntersecting: true, intersectionRatio: 1, target: videoContainer }]);
      observerCallback([{ isIntersecting: false, intersectionRatio: 0, target: videoContainer }]);
    });

    expect(video.pause).toHaveBeenCalled();
  });

  it('pauses an initially hidden autoplay video without emitting onItemHidden', () => {
    const handleItemHidden = jest.fn();
    const { container } = render(
      <VerticalFeed items={[mockItems[0]]} onItemHidden={handleItemHidden} />
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    const videoContainer = video.parentElement!;

    act(() => {
      observerCallback(
        [createIntersectionEntry(videoContainer, false, 0)],
        {} as IntersectionObserver
      );
    });

    expect(video.pause).toHaveBeenCalledTimes(1);
    expect(handleItemHidden).not.toHaveBeenCalled();
  });

  it('calls onEndReached when scrolling to bottom', () => {
    const handleEndReached = jest.fn();
    render(<VerticalFeed items={mockItems} onEndReached={handleEndReached} />);

    const feed = screen.getByRole('feed');
    Object.defineProperty(feed, 'scrollHeight', { value: 1000 });
    Object.defineProperty(feed, 'scrollTop', { value: 800 });
    Object.defineProperty(feed, 'clientHeight', { value: 200 });

    fireEvent.scroll(feed);
    expect(handleEndReached).toHaveBeenCalled();
  });

  it('does not re-arm onEndReached for an equivalent items array', () => {
    const handleEndReached = jest.fn();
    const { rerender } = render(<VerticalFeed items={mockItems} onEndReached={handleEndReached} />);
    const feed = screen.getByRole('feed');
    Object.defineProperty(feed, 'scrollHeight', { value: 1000 });
    Object.defineProperty(feed, 'scrollTop', { value: 800 });
    Object.defineProperty(feed, 'clientHeight', { value: 200 });

    fireEvent.scroll(feed);
    rerender(<VerticalFeed items={[...mockItems]} onEndReached={handleEndReached} />);
    fireEvent.scroll(feed);

    expect(handleEndReached).toHaveBeenCalledTimes(1);
  });

  it('calls onItemVisible and onItemHidden callbacks', () => {
    const handleItemVisible = jest.fn();
    const handleItemHidden = jest.fn();
    const { container } = render(
      <VerticalFeed
        items={mockItems}
        onItemVisible={handleItemVisible}
        onItemHidden={handleItemHidden}
      />
    );

    const videoContainer = container.querySelector('[data-index="0"]')!;

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: videoContainer,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        {} as IntersectionObserver
      );
    });
    expect(handleItemVisible).toHaveBeenCalledWith(mockItems[0], 0);

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: false,
            target: videoContainer,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 0,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        {} as IntersectionObserver
      );
    });
    expect(handleItemHidden).toHaveBeenCalledWith(mockItems[0], 0);
  });

  it('uses custom threshold for intersection observer', () => {
    const customThreshold = 0.5;
    render(<VerticalFeed items={mockItems} threshold={customThreshold} />);

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      root: screen.getByRole('feed'),
      threshold: customThreshold,
    });
  });

  it('handles video play errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    HTMLVideoElement.prototype.play = jest.fn().mockRejectedValue(new Error('Play failed'));

    render(<VerticalFeed items={mockItems} />);
    const videoContainer = screen.getAllByRole('article')[0];
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    await act(async () => {
      observerCallback([{ isIntersecting: true, target: videoContainer }]);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error playing video:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('uses custom scroll behavior for keyboard navigation', () => {
    const customScrollBehavior = 'auto';
    render(<VerticalFeed items={mockItems} scrollBehavior={customScrollBehavior} />);

    const feed = screen.getByRole('feed');
    fireEvent.keyDown(feed, { key: 'ArrowDown' });

    expect(Element.prototype.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: customScrollBehavior,
      })
    );
  });

  it('scrolls within the feed without moving ancestor scrollers', () => {
    const ref = React.createRef<VerticalFeedRef>();
    render(<VerticalFeed ref={ref} items={mockItems} />);

    const feed = screen.getByRole('feed');
    const target = screen.getAllByRole('article')[1];
    Object.defineProperty(feed, 'scrollTop', { value: 40, configurable: true });
    jest.spyOn(feed, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);
    jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 500 } as DOMRect);

    ref.current?.scrollToItem(1, 'auto');

    expect(Element.prototype.scrollTo).toHaveBeenCalledWith({ top: 440, behavior: 'auto' });
  });

  it('handles scroll events when containerRef is null', () => {
    const handleEndReached = jest.fn();
    const { container } = render(
      <VerticalFeed items={mockItems} onEndReached={handleEndReached} />
    );
    const feed = container.querySelector('[role="feed"]')!;

    // Set containerRef to null
    Object.defineProperty(feed, 'scrollTop', { get: () => undefined });
    Object.defineProperty(feed, 'scrollHeight', { get: () => undefined });
    Object.defineProperty(feed, 'clientHeight', { get: () => undefined });

    fireEvent.scroll(feed);
    expect(handleEndReached).not.toHaveBeenCalled();
  });

  it('handles scroll events without onEndReached callback', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const feed = container.querySelector('[role="feed"]')!;

    Object.defineProperty(feed, 'scrollHeight', { value: 1000 });
    Object.defineProperty(feed, 'scrollTop', { value: 800 });
    Object.defineProperty(feed, 'clientHeight', { value: 200 });

    fireEvent.scroll(feed);
    // Test passes if no error is thrown
  });

  it('handles keydown events when containerRef is null', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const feed = container.querySelector('[role="feed"]')!;

    // Set containerRef to null
    Object.defineProperty(feed, 'scrollTop', { get: () => undefined });
    Object.defineProperty(feed, 'clientHeight', { get: () => undefined });

    fireEvent.keyDown(feed, { key: 'ArrowDown' });
    // Test passes if no error is thrown
  });

  it('handles non-arrow key presses', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const feed = container.querySelector('[role="feed"]')!;

    fireEvent.keyDown(feed, { key: 'Enter' });
    // Test passes if no error is thrown
  });

  it('handles video element not found in container', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videoContainer = container.querySelector('[data-index="0"]')!;

    // Remove video element
    const video = videoContainer.querySelector('video');
    video?.parentNode?.removeChild(video);

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      observerCallback([{ isIntersecting: true, target: videoContainer }]);
    });
    // Test passes if no error is thrown
  });

  it('handles missing data-index attribute', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videoContainer = container.querySelector('[data-index="0"]')!;

    // Remove data-index attribute
    videoContainer.removeAttribute('data-index');

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      observerCallback([{ isIntersecting: true, target: videoContainer }]);
    });
    // Test passes if no error is thrown
  });

  it('handles cleanup of intersection observer', () => {
    const { unmount } = render(<VerticalFeed items={mockItems} />);
    expect(mockObserve).toHaveBeenCalled();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles null containerRef during cleanup', () => {
    const { unmount } = render(<VerticalFeed items={[{ src: 'test-video.mp4' }]} />);
    expect(mockObserve).toHaveBeenCalled();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('handles video element not found during pause', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videoContainer = container.querySelector('[data-index="0"]')!;
    const video = videoContainer.querySelector('video');
    video?.parentNode?.removeChild(video);

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: false,
            target: videoContainer,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 0,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        {} as IntersectionObserver
      );
    });
  });

  it('handles video element not found during play', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const videoContainer = container.querySelector('[data-index="0"]')!;
    const video = videoContainer.querySelector('video');
    video?.parentNode?.removeChild(video);

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: videoContainer,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        {} as IntersectionObserver
      );
    });
  });

  it('handles keyboard navigation with null containerRef', () => {
    const { container } = render(<VerticalFeed items={mockItems} />);
    const feed = container.querySelector('[role="feed"]')!;

    // Mock scrollTo to ensure it's not called
    const scrollTo = jest.fn();
    Element.prototype.scrollTo = scrollTo;

    // Set containerRef to null
    Object.defineProperty(feed, 'scrollTop', { get: () => undefined });
    Object.defineProperty(feed, 'clientHeight', { get: () => undefined });
    Object.defineProperty(feed, 'scrollHeight', { get: () => undefined });
    Object.defineProperty(feed, 'scrollTo', { value: undefined });

    fireEvent.keyDown(feed, { key: 'ArrowDown' });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('cleans up intersection observer on unmount', () => {
    const { unmount } = render(<VerticalFeed items={mockItems} />);
    expect(mockObserve).toHaveBeenCalled();
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('does not programmatically play items with autoPlay disabled', () => {
    const items = [{ ...mockItems[0], autoPlay: false }];
    render(<VerticalFeed items={items} />);
    const videoContainer = screen.getByRole('article');

    act(() => {
      observerCallback(
        [createIntersectionEntry(videoContainer, true, 1)],
        {} as IntersectionObserver
      );
    });

    expect(HTMLVideoElement.prototype.play).not.toHaveBeenCalled();
  });

  it('uses threshold crossings for transition-only visibility callbacks', () => {
    const handleItemVisible = jest.fn();
    const handleItemHidden = jest.fn();
    const handleCurrentItemChange = jest.fn();
    render(
      <VerticalFeed
        items={[mockItems[0]]}
        threshold={0.75}
        onItemVisible={handleItemVisible}
        onItemHidden={handleItemHidden}
        onCurrentItemChange={handleCurrentItemChange}
      />
    );
    const videoContainer = screen.getByRole('article');

    act(() => {
      observerCallback(
        [createIntersectionEntry(videoContainer, true, 0.8)],
        {} as IntersectionObserver
      );
      observerCallback(
        [createIntersectionEntry(videoContainer, true, 0.9)],
        {} as IntersectionObserver
      );
    });

    expect(handleItemVisible).toHaveBeenCalledTimes(1);
    expect(handleCurrentItemChange).toHaveBeenCalledTimes(1);
    expect(HTMLVideoElement.prototype.play).toHaveBeenCalledTimes(1);

    act(() => {
      observerCallback(
        [createIntersectionEntry(videoContainer, true, 0.5)],
        {} as IntersectionObserver
      );
    });

    expect(handleItemHidden).toHaveBeenCalledTimes(1);
    expect(HTMLVideoElement.prototype.pause).toHaveBeenCalledTimes(1);
  });

  it('preserves visibility state for an equivalent items array', () => {
    const handleItemVisible = jest.fn();
    const handleCurrentItemChange = jest.fn();
    const { rerender } = render(
      <VerticalFeed
        items={mockItems}
        onItemVisible={handleItemVisible}
        onCurrentItemChange={handleCurrentItemChange}
      />
    );
    const videoContainer = screen.getAllByRole('article')[0];

    act(() => {
      observerCallback(
        [createIntersectionEntry(videoContainer, true, 1)],
        {} as IntersectionObserver
      );
    });

    rerender(
      <VerticalFeed
        items={[...mockItems]}
        onItemVisible={handleItemVisible}
        onCurrentItemChange={handleCurrentItemChange}
      />
    );

    act(() => {
      observerCallback(
        [createIntersectionEntry(videoContainer, true, 1)],
        {} as IntersectionObserver
      );
    });

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
    expect(handleItemVisible).toHaveBeenCalledTimes(1);
    expect(handleCurrentItemChange).toHaveBeenCalledTimes(1);
    expect(HTMLVideoElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it('reports native media loading errors', () => {
    const handleVideoError = jest.fn();
    const { container } = render(
      <VerticalFeed items={[mockItems[0]]} onVideoError={handleVideoError} />
    );

    fireEvent.error(container.querySelector('video')!);

    expect(handleVideoError).toHaveBeenCalledWith(mockItems[0], 0, expect.any(Error));
    expect(handleVideoError.mock.calls[0][2].message).toContain(mockItems[0].src);
  });

  it('keeps loading and error state attached to stable item keys', () => {
    const errorComponent = <div data-testid="error">Error occurred</div>;
    const firstItems = [mockItems[0], mockItems[1]];
    const { container, rerender } = render(
      <VerticalFeed items={firstItems} errorComponent={errorComponent} />
    );

    fireEvent.error(container.querySelector('video')!);
    expect(screen.getByTestId('error').closest('[data-index]')).toHaveAttribute('data-index', '0');

    rerender(<VerticalFeed items={[mockItems[1], mockItems[0]]} errorComponent={errorComponent} />);

    expect(screen.getByTestId('error').closest('[data-index]')).toHaveAttribute('data-index', '1');
    expect(container.querySelector('[data-index="0"] video')).toHaveStyle({ display: 'block' });
  });

  it('keeps media state keys collision-safe', () => {
    const firstItem = { id: 'foo', src: 'bar:baz' };
    const secondItem = { id: 'foo:bar', src: 'baz' };
    const errorComponent = <div data-testid="error">Error occurred</div>;
    const { container, rerender } = render(
      <VerticalFeed items={[firstItem]} errorComponent={errorComponent} />
    );

    fireEvent.error(container.querySelector('video')!);
    expect(screen.getByTestId('error')).toBeInTheDocument();

    rerender(<VerticalFeed items={[secondItem]} errorComponent={errorComponent} />);

    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    expect(container.querySelector('video')).toHaveStyle({ display: 'block' });
  });

  it('rebuilds observation for formerly colliding key sequences', () => {
    const firstItems = [
      { src: 'one.mp4', metadata: { key: 'a|number:1' } },
      { src: 'two.mp4', metadata: { key: 2 } },
    ];
    const secondItems = [
      { src: 'one.mp4', metadata: { key: 'a' } },
      { src: 'two.mp4', metadata: { key: 1 } },
      { src: 'three.mp4', metadata: { key: 2 } },
    ];
    const getItemKey = (item: VideoItem) => item.metadata?.key as React.Key;
    const { rerender } = render(<VerticalFeed items={firstItems} getItemKey={getItemKey} />);

    rerender(<VerticalFeed items={secondItems} getItemKey={getItemKey} />);

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(2);
  });

  it('renders preload-none videos while they wait for user playback', () => {
    const { container } = render(
      <VerticalFeed items={[{ src: 'manual.mp4', autoPlay: false, preload: 'none' }]} />
    );

    expect(container.querySelector('video')).toHaveStyle({ display: 'block' });
  });

  it('sizes items to an embedded feed and exposes ARIA feed metadata', () => {
    render(<VerticalFeed items={mockItems} style={{ height: 400 }} />);
    const articles = screen.getAllByRole('article');

    expect(articles[0]).toHaveStyle({ height: '100%' });
    expect(articles[0]).toHaveAttribute('aria-posinset', '1');
    expect(articles[0]).toHaveAttribute('aria-setsize', '2');
    expect(articles[1]).toHaveAttribute('aria-posinset', '2');
  });

  it('prevents native scrolling for handled navigation keys', () => {
    render(<VerticalFeed items={mockItems} />);
    const feed = screen.getByRole('feed');

    expect(fireEvent.keyDown(feed, { key: 'ArrowDown' })).toBe(false);
    expect(fireEvent.keyDown(feed, { key: 'Home' })).toBe(false);
  });

  it('activates clickable items with the keyboard', () => {
    const handleItemClick = jest.fn();
    render(<VerticalFeed items={[mockItems[0]]} onItemClick={handleItemClick} />);
    const item = screen.getByRole('article');

    fireEvent.keyDown(item, { key: 'Enter' });

    expect(handleItemClick).toHaveBeenCalledWith(mockItems[0], 0);
  });

  it('does not hijack navigation keys from interactive overlays', () => {
    render(
      <VerticalFeed
        items={[mockItems[0]]}
        renderItemOverlay={() => <button type="button">Open menu</button>}
      />
    );

    fireEvent.keyDown(screen.getByRole('button', { name: 'Open menu' }), { key: 'ArrowDown' });

    expect(Element.prototype.scrollTo).not.toHaveBeenCalled();
  });

  it('does not hijack navigation keys from native video controls or ARIA widgets', () => {
    const { container } = render(
      <VerticalFeed
        items={[mockItems[0]]}
        renderItemOverlay={() => <div role="slider" aria-label="Seek" tabIndex={0} />}
      />
    );

    fireEvent.keyDown(container.querySelector('video')!, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Seek' }), { key: 'Home' });

    expect(Element.prototype.scrollTo).not.toHaveBeenCalled();
  });

  it('keeps keyboard navigation inside a nested scrollable page', () => {
    render(
      <main
        data-testid="page-scroller"
        style={{ height: 600, overflowY: 'auto' }}
        onScroll={event => event.stopPropagation()}
      >
        <div style={{ height: 1200 }}>
          <VerticalFeed items={mockItems} style={{ height: 320 }} scrollBehavior="auto" />
        </div>
      </main>
    );

    const page = screen.getByTestId('page-scroller');
    const feed = screen.getByRole('feed');
    const feedScrollTo = jest.fn();
    Object.defineProperties(page, {
      scrollTop: { value: 480, writable: true },
      clientHeight: { value: 600 },
      scrollHeight: { value: 1200 },
    });
    Object.defineProperties(feed, {
      scrollTop: { value: 320, writable: true },
      clientHeight: { value: 320 },
      scrollHeight: { value: 640 },
      scrollTo: { value: feedScrollTo },
    });

    fireEvent.keyDown(feed, { key: 'ArrowDown' });
    fireEvent.keyDown(feed, { key: 'Home' });
    fireEvent.keyDown(feed, { key: 'End' });

    expect(feedScrollTo.mock.calls).toEqual([
      [{ top: 640, behavior: 'auto' }],
      [{ top: 0, behavior: 'auto' }],
      [{ top: 640, behavior: 'auto' }],
    ]);
    expect(page.scrollTop).toBe(480);
    expect(feed.style.overscrollBehaviorY).toBe('contain');
  });

  it('lets native editing controls and contenteditable overlays own their keys', () => {
    const { container } = render(
      <VerticalFeed
        items={[mockItems[0]]}
        renderItemOverlay={() => (
          <div>
            <input aria-label="Caption" defaultValue="A caption" />
            <textarea aria-label="Comment" defaultValue="A comment" />
            <a href="#details">Details</a>
            <div contentEditable suppressContentEditableWarning>
              Editable caption
            </div>
            <div role="switch" aria-checked="false" tabIndex={0}>
              Autoplay
            </div>
          </div>
        )}
      />
    );

    const ownedKeyEvents: Array<[Element, string]> = [
      [screen.getByRole('textbox', { name: 'Caption' }), 'Home'],
      [screen.getByRole('textbox', { name: 'Comment' }), 'End'],
      [screen.getByRole('link', { name: 'Details' }), 'ArrowDown'],
      [container.querySelector('[contenteditable="true"]')!, ' '],
      [screen.getByRole('switch', { name: 'Autoplay' }), 'ArrowUp'],
    ];

    for (const [target, key] of ownedKeyEvents) {
      expect(fireEvent.keyDown(target, { key })).toBe(true);
    }

    expect(Element.prototype.scrollTo).not.toHaveBeenCalled();
    expect(HTMLVideoElement.prototype.play).not.toHaveBeenCalled();
    expect(HTMLVideoElement.prototype.pause).not.toHaveBeenCalled();
  });

  it('toggles playback for the current item with Space', async () => {
    render(<VerticalFeed items={mockItems} />);
    const feed = screen.getByRole('feed');
    const articles = screen.getAllByRole('article');
    const videos = document.querySelectorAll('video');
    const firstPlay = jest.fn().mockResolvedValue(undefined);
    const secondPlay = jest.fn().mockResolvedValue(undefined);
    const secondPause = jest.fn();
    let secondIsPaused = true;
    Object.defineProperties(videos[0], {
      play: { value: firstPlay },
    });
    Object.defineProperties(videos[1], {
      paused: { get: () => secondIsPaused },
      play: { value: secondPlay },
      pause: { value: secondPause },
    });

    await act(async () => {
      observerCallback(
        [
          createIntersectionEntry(articles[0], true, 0.8),
          createIntersectionEntry(articles[1], true, 0.95),
        ],
        {} as IntersectionObserver
      );
    });
    firstPlay.mockClear();
    secondPlay.mockClear();

    expect(fireEvent.keyDown(feed, { key: ' ' })).toBe(false);
    expect(secondPlay).toHaveBeenCalledTimes(1);
    expect(firstPlay).not.toHaveBeenCalled();

    secondIsPaused = false;
    expect(fireEvent.keyDown(feed, { key: ' ' })).toBe(false);
    expect(secondPause).toHaveBeenCalledTimes(1);
  });

  it('reports Space-triggered playback rejection through the public error callback', async () => {
    const playbackError = new Error('Keyboard playback is blocked');
    const handleVideoError = jest.fn();
    render(<VerticalFeed items={[mockItems[0]]} onVideoError={handleVideoError} />);
    const feed = screen.getByRole('feed');
    const video = document.querySelector('video')!;
    Object.defineProperties(video, {
      paused: { get: () => true },
      play: { value: jest.fn().mockRejectedValue(playbackError) },
    });

    await act(async () => {
      fireEvent.keyDown(feed, { key: ' ' });
    });

    expect(handleVideoError).toHaveBeenCalledWith(mockItems[0], 0, playbackError);
  });

  it('attributes delayed keyboard playback rejection to the item that started playback', async () => {
    const playbackError = new Error('Delayed keyboard playback failure');
    const handleVideoError = jest.fn();
    let rejectPlayback!: (error: Error) => void;
    const playback = new Promise<void>((_resolve, reject) => {
      rejectPlayback = reject;
    });
    const { rerender } = render(
      <VerticalFeed items={mockItems} onVideoError={handleVideoError} />
    );
    const feed = screen.getByRole('feed');
    const video = document.querySelector('video')!;
    Object.defineProperties(video, {
      paused: { get: () => true },
      play: { value: jest.fn().mockReturnValue(playback) },
    });

    fireEvent.keyDown(feed, { key: ' ' });
    rerender(<VerticalFeed items={[mockItems[1], mockItems[0]]} onVideoError={handleVideoError} />);
    await act(async () => rejectPlayback(playbackError));

    expect(handleVideoError).toHaveBeenCalledWith(mockItems[0], 0, playbackError);
  });

  it('tracks the most visible active item through overlapping transitions', () => {
    const ref = React.createRef<VerticalFeedRef>();
    const handleCurrentItemChange = jest.fn();
    render(
      <VerticalFeed ref={ref} items={mockItems} onCurrentItemChange={handleCurrentItemChange} />
    );
    const articles = screen.getAllByRole('article');

    act(() => {
      observerCallback(
        [
          createIntersectionEntry(articles[0], true, 0.8),
          createIntersectionEntry(articles[1], true, 0.95),
        ],
        {} as IntersectionObserver
      );
    });

    expect(ref.current?.getCurrentItem()).toBe(1);
    expect(handleCurrentItemChange).toHaveBeenLastCalledWith(1);

    act(() => {
      observerCallback(
        [createIntersectionEntry(articles[1], false, 0)],
        {} as IntersectionObserver
      );
    });

    expect(ref.current?.getCurrentItem()).toBe(0);
    expect(handleCurrentItemChange.mock.calls).toEqual([[1], [0]]);
  });

  it('uses the latest callbacks without rebuilding observation', () => {
    const firstVisible = jest.fn();
    const secondVisible = jest.fn();
    const firstCurrent = jest.fn();
    const secondCurrent = jest.fn();
    const { rerender } = render(
      <VerticalFeed
        items={mockItems}
        onItemVisible={firstVisible}
        onCurrentItemChange={firstCurrent}
      />
    );

    rerender(
      <VerticalFeed
        items={[...mockItems]}
        onItemVisible={secondVisible}
        onCurrentItemChange={secondCurrent}
      />
    );
    const article = screen.getAllByRole('article')[0];

    act(() => {
      observerCallback([createIntersectionEntry(article, true, 1)], {} as IntersectionObserver);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
    expect(firstVisible).not.toHaveBeenCalled();
    expect(firstCurrent).not.toHaveBeenCalled();
    expect(secondVisible).toHaveBeenCalledWith(mockItems[0], 0);
    expect(secondCurrent).toHaveBeenCalledWith(0);
  });

  it('reports autoplay rejection through the public error callback', async () => {
    const playbackError = new Error('Autoplay is blocked');
    const handleVideoError = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    HTMLVideoElement.prototype.play = jest.fn().mockRejectedValue(playbackError);
    render(<VerticalFeed items={[mockItems[0]]} onVideoError={handleVideoError} />);
    const article = screen.getByRole('article');

    await act(async () => {
      observerCallback([createIntersectionEntry(article, true, 1)], {} as IntersectionObserver);
    });

    expect(handleVideoError).toHaveBeenCalledWith(mockItems[0], 0, playbackError);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('re-arms end reached only after leaving the boundary or adding items', () => {
    const handleEndReached = jest.fn();
    const { rerender } = render(
      <VerticalFeed items={mockItems} onEndReached={handleEndReached} endReachedThreshold={100} />
    );
    const feed = screen.getByRole('feed');
    Object.defineProperties(feed, {
      scrollTop: { value: 650, writable: true },
      clientHeight: { value: 250 },
      scrollHeight: { value: 1000 },
    });

    fireEvent.scroll(feed);
    fireEvent.scroll(feed);
    expect(handleEndReached).toHaveBeenCalledTimes(1);

    feed.scrollTop = 400;
    fireEvent.scroll(feed);
    feed.scrollTop = 650;
    fireEvent.scroll(feed);
    expect(handleEndReached).toHaveBeenCalledTimes(2);

    rerender(
      <VerticalFeed
        items={[...mockItems, { src: 'test-video-3.mp4', id: '3' }]}
        onEndReached={handleEndReached}
        endReachedThreshold={100}
      />
    );
    fireEvent.scroll(feed);

    expect(handleEndReached).toHaveBeenCalledTimes(3);
  });

  it('uses ref geometry, configured defaults, and safe index bounds', () => {
    const ref = React.createRef<VerticalFeedRef>();
    const { rerender } = render(<VerticalFeed ref={ref} items={mockItems} scrollBehavior="auto" />);
    const feed = screen.getByRole('feed');
    const secondItem = screen.getAllByRole('article')[1];
    const feedScrollTo = jest.fn();
    Object.defineProperties(feed, {
      scrollTop: { value: 75, configurable: true },
      scrollTo: { value: feedScrollTo },
    });
    jest.spyOn(feed, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);
    jest.spyOn(secondItem, 'getBoundingClientRect').mockReturnValue({ top: 425 } as DOMRect);

    ref.current?.scrollToItem(-1);
    ref.current?.scrollToItem(mockItems.length);
    expect(feedScrollTo).not.toHaveBeenCalled();

    ref.current?.scrollToItem(1);
    expect(feedScrollTo).toHaveBeenLastCalledWith({ top: 400, behavior: 'auto' });

    rerender(<VerticalFeed ref={ref} items={mockItems} scrollBehavior="smooth" />);
    ref.current?.scrollToItem(1);
    expect(feedScrollTo).toHaveBeenLastCalledWith({ top: 400, behavior: 'smooth' });
  });

  it('clamps the public current-item index when the collection shrinks', () => {
    const ref = React.createRef<VerticalFeedRef>();
    const { rerender } = render(<VerticalFeed ref={ref} items={mockItems} />);
    const secondItem = screen.getAllByRole('article')[1];

    act(() => {
      observerCallback([createIntersectionEntry(secondItem, true, 1)], {} as IntersectionObserver);
    });
    expect(ref.current?.getCurrentItem()).toBe(1);

    rerender(<VerticalFeed ref={ref} items={[mockItems[0]]} />);
    expect(ref.current?.getCurrentItem()).toBe(0);

    rerender(<VerticalFeed ref={ref} items={[]} />);
    expect(ref.current?.getCurrentItem()).toBe(0);
  });
});
