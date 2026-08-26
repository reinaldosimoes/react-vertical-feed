import React, { useState, useCallback, useEffect } from 'react';
import { VerticalFeed, type VideoItem } from '../../src/VerticalFeed';
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  Bookmark,
  Share,
  Plus,
  Search,
  PlayCircle,
  Home,
  Users,
  Inbox,
  User,
  Music,
  ListMusic,
  ChevronRight,
  Github,
} from 'lucide-react';

const VIDEO_METADATA = [
  {
    username: 'reinaldosimoes',
    caption: 'This is a demo using the react-vertical-feed npm package.',
    audioText: 'Midnight Circuit - Lofi',
    playlistText: 'Open Source Demos',
    likeCount: '328.4K',
    commentCount: '1.5K',
    bookmarkCount: '42.1K',
    shareCount: '2.1K',
  },
  {
    username: 'reinaldosimoes',
    caption: 'You can tap on the Github button to check out the repository.',
    audioText: 'GPU Fans Go Brrr - Tech Remix',
    playlistText: 'Developer Humor',
    likeCount: '267.8K',
    commentCount: '2.3K',
    bookmarkCount: '31.2K',
    shareCount: '1.8K',
  },
  {
    username: 'reinaldosimoes',
    caption: 'Contributions are welcome!',
    audioText: 'Build Loop Vibes',
    playlistText: 'Web Engineering',
    likeCount: '412.9K',
    commentCount: '3.1K',
    bookmarkCount: '56.7K',
    shareCount: '2.9K',
  },
];

const demoVideoPath = (filename: string) => `${import.meta.env.BASE_URL}videos/${filename}`;

const DEMO_VIDEOS = [
  { id: 'clouds', src: demoVideoPath('clouds.mp4') },
  { id: 'wind', src: demoVideoPath('wind.mp4') },
  { id: 'grasshopper', src: demoVideoPath('grasshopper.mp4') },
] as const;

const usePrefersReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Gaming', 'Food', 'Sports', 'Fashion'];

  return (
    <div className="top-navigation">
      <div className="top-nav-center" role="tablist" aria-label="Video categories">
        {tabs.map(tab => (
          <button
            type="button"
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
            role="tab"
            aria-selected={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="top-nav-right">
        <div className="nav-icon">
          <PlayCircle size={24} />
        </div>
        <div className="nav-icon">
          <Search size={24} />
        </div>
      </div>
    </div>
  );
};

interface RightSidebarProps {
  liked: boolean;
  bookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  likeCount: string;
  commentCount: string;
  bookmarkCount: string;
  shareCount: string;
  isPaused: boolean;
  onTogglePlayback: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  liked,
  bookmarked,
  onLike,
  onBookmark,
  likeCount,
  commentCount,
  bookmarkCount,
  shareCount,
  isPaused,
  onTogglePlayback,
}) => (
  <div className="right-sidebar" onClick={event => event.stopPropagation()}>
    <div className="sidebar-item profile-button">
      <div className="profile-avatar">RS</div>
      <button type="button" className="follow-button" aria-label="Follow reinaldosimoes">
        <Plus aria-hidden="true" size={12} strokeWidth={3} color="#FFFFFF" />
      </button>
    </div>

    <div className="sidebar-item">
      <button
        type="button"
        className={`action-button ${liked ? 'liked' : ''}`}
        onClick={onLike}
        aria-label={`Like, ${likeCount} likes`}
        aria-pressed={liked}
      >
        <Heart
          aria-hidden="true"
          size={32}
          fill={liked ? '#FF0050' : 'none'}
          color={liked ? '#FF0050' : '#FFFFFF'}
          strokeWidth={2}
        />
        <span className="action-count">{likeCount}</span>
      </button>
    </div>

    <div className="sidebar-item">
      <button type="button" className="action-button" aria-label={`Comments, ${commentCount}`}>
        <MessageCircle aria-hidden="true" size={32} color="#FFFFFF" strokeWidth={2} />
        <span className="action-count">{commentCount}</span>
      </button>
    </div>

    <div className="sidebar-item">
      <button
        type="button"
        className={`action-button ${bookmarked ? 'bookmarked' : ''}`}
        onClick={onBookmark}
        aria-label={`Bookmark, ${bookmarkCount} bookmarks`}
        aria-pressed={bookmarked}
      >
        <Bookmark
          aria-hidden="true"
          size={32}
          fill={bookmarked ? '#FFD700' : 'none'}
          color={bookmarked ? '#FFD700' : '#FFFFFF'}
          strokeWidth={2}
        />
        <span className="action-count">{bookmarkCount}</span>
      </button>
    </div>

    <div className="sidebar-item">
      <button type="button" className="action-button" aria-label={`Share, ${shareCount} shares`}>
        <Share aria-hidden="true" size={32} color="#FFFFFF" strokeWidth={2} />
        <span className="action-count">{shareCount}</span>
      </button>
    </div>

    <div className="sidebar-item">
      <button
        type="button"
        className="action-button playback-button"
        onClick={onTogglePlayback}
        aria-label={isPaused ? 'Play video' : 'Pause video'}
      >
        {isPaused ? (
          <Play aria-hidden="true" size={32} fill="#FFFFFF" color="#FFFFFF" />
        ) : (
          <Pause aria-hidden="true" size={32} fill="#FFFFFF" color="#FFFFFF" />
        )}
        <span className="action-count">{isPaused ? 'Play' : 'Pause'}</span>
      </button>
    </div>

    <div className="sidebar-item">
      <a
        href="https://github.com/reinaldosimoes/react-vertical-feed"
        target="_blank"
        rel="noopener noreferrer"
        className="action-button github-button"
      >
        <Github size={32} color="#FFFFFF" strokeWidth={2} />
        <span className="action-count">GitHub</span>
      </a>
    </div>
  </div>
);

interface BottomOverlayProps {
  username: string;
  caption: string;
  audioText: string;
  playlistText: string;
}

const BottomOverlay: React.FC<BottomOverlayProps> = ({
  username,
  caption,
  audioText,
  playlistText,
}) => (
  <div className="bottom-overlay">
    <div className="username">@{username}</div>
    <div className="caption">{caption}</div>
    <div className="audio-info">
      <Music size={14} />
      <span className="audio-text">
        <span className="audio-marquee">{audioText}</span>
      </span>
    </div>
    <div className="playlist-banner">
      <ListMusic size={16} />
      <span>{playlistText}</span>
      <ChevronRight size={16} />
    </div>
  </div>
);

interface BottomNavigationProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeItem, onItemClick }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'friends', icon: Users, label: 'Friends', badge: 4 },
    { id: 'create', icon: Plus, label: '', special: true },
    { id: 'inbox', icon: Inbox, label: 'Inbox', badge: 1 },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="bottom-navigation">
      {navItems.map(item => {
        const Icon = item.icon;
        if (item.special) {
          return (
            <button
              type="button"
              key={item.id}
              className="nav-item"
              onClick={() => onItemClick(item.id)}
              aria-label="Create"
            >
              <div className="create-button">
                <div className="create-button-inner">
                  <Plus size={20} strokeWidth={3} />
                </div>
              </div>
            </button>
          );
        }
        return (
          <button
            type="button"
            key={item.id}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onItemClick(item.id)}
            aria-current={activeItem === item.id ? 'page' : undefined}
          >
            <div className="nav-item-icon">
              <Icon size={24} fill={activeItem === item.id ? '#FFFFFF' : 'none'} />
              {item.badge && <span className="notification-badge">{item.badge}</span>}
            </div>
            <span className="nav-item-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const loadingIndicator = (
  <div className="loading-dots">
    <div className="loading-dot" />
    <div className="loading-dot" />
  </div>
);

const App = (): React.ReactElement => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeTab, setActiveTab] = useState('Sports');
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoStates, setVideoStates] = useState<
    Record<number, { liked: boolean; bookmarked: boolean }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [userPausedVideos, setUserPausedVideos] = useState<Record<number, boolean>>({});

  const videos: VideoItem[] = DEMO_VIDEOS.map(video => ({
    ...video,
    controls: false,
    autoPlay: !prefersReducedMotion,
    muted: true,
    playsInline: true,
    loop: true,
  }));

  const toggleLike = useCallback((index: number) => {
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        liked: !prev[index]?.liked,
      },
    }));
  }, []);

  const toggleBookmark = useCallback((index: number) => {
    setVideoStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        bookmarked: !prev[index]?.bookmarked,
      },
    }));
  }, []);

  const handleEndReached = useCallback(() => {
    console.log('End of feed reached');
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const handleItemVisible = useCallback(
    (item: VideoItem, index: number) => {
      console.log(`Video ${index} is now visible`);
      if (item.autoPlay !== false) {
        setUserPausedVideos(prev => ({ ...prev, [index]: false }));
      }
    },
    []
  );

  const handleItemHidden = useCallback((item: VideoItem, index: number) => {
    console.log(`Video ${index} is now hidden`);
  }, []);

  const handleCurrentItemChange = useCallback(
    (index: number) => {
      setCurrentVideoIndex(index);
      setUserPausedVideos(prev => ({ ...prev, [index]: prefersReducedMotion }));
    },
    [prefersReducedMotion]
  );

  useEffect(() => {
    if (!prefersReducedMotion) return;
    document.querySelectorAll<HTMLVideoElement>('video').forEach(video => video.pause());
    setUserPausedVideos(prev => ({ ...prev, [currentVideoIndex]: true }));
  }, [currentVideoIndex, prefersReducedMotion]);

  const handleVideoTap = useCallback((item: VideoItem, index: number) => {
    const videoContainer = document.querySelector(`[data-index="${index}"]`);
    const video = videoContainer?.querySelector('video') as HTMLVideoElement | null;
    if (video) {
      if (video.paused) {
        video
          .play()
          .then(() => setUserPausedVideos(prev => ({ ...prev, [index]: false })))
          .catch(() => setUserPausedVideos(prev => ({ ...prev, [index]: true })));
      } else {
        video.pause();
        setUserPausedVideos(prev => ({ ...prev, [index]: true }));
      }
    }
  }, []);

  const handleFeedKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (
        event.key !== ' ' ||
        !event.defaultPrevented ||
        !target.closest('[role="feed"]')
      ) {
        return;
      }

      const videoContainer = document.querySelector(`[data-index="${currentVideoIndex}"]`);
      const video = videoContainer?.querySelector('video') as HTMLVideoElement | null;
      if (!video) return;
      setUserPausedVideos(prev => ({ ...prev, [currentVideoIndex]: video.paused }));
    },
    [currentVideoIndex]
  );

  const handleVideoError = useCallback((_item: VideoItem, index: number) => {
    setUserPausedVideos(prev => ({ ...prev, [index]: true }));
  }, []);

  const renderVideoOverlay = useCallback(
    (item: VideoItem, index: number): React.ReactNode => {
      if (index !== currentVideoIndex) {
        return null;
      }

      const { liked = false, bookmarked = false } = videoStates[index] || {};
      const metadata = VIDEO_METADATA[index] || VIDEO_METADATA[0];
      const isPaused = userPausedVideos[index] ?? prefersReducedMotion;

      return (
        <>
          <div className={`pause-indicator ${isPaused ? 'visible' : ''}`} aria-hidden="true">
            <Play size={64} fill="#FFFFFF" color="#FFFFFF" />
          </div>
          <RightSidebar
            liked={liked}
            bookmarked={bookmarked}
            onLike={() => toggleLike(index)}
            onBookmark={() => toggleBookmark(index)}
            likeCount={metadata.likeCount}
            commentCount={metadata.commentCount}
            bookmarkCount={metadata.bookmarkCount}
            shareCount={metadata.shareCount}
            isPaused={isPaused}
            onTogglePlayback={() => handleVideoTap(item, index)}
          />
          <BottomOverlay
            username={metadata.username}
            caption={metadata.caption}
            audioText={metadata.audioText}
            playlistText={metadata.playlistText}
          />
        </>
      );
    },
    [
      videoStates,
      toggleLike,
      toggleBookmark,
      currentVideoIndex,
      userPausedVideos,
      prefersReducedMotion,
      handleVideoTap,
    ]
  );

  return (
    <div
      style={{ height: '100vh', width: '100vw', backgroundColor: '#000', position: 'relative' }}
      onKeyDown={handleFeedKeyDown}
    >
      <TopNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <VerticalFeed
        items={videos}
        onEndReached={handleEndReached}
        onItemVisible={handleItemVisible}
        onItemHidden={handleItemHidden}
        onCurrentItemChange={handleCurrentItemChange}
        onVideoError={handleVideoError}
        onItemClick={handleVideoTap}
        style={{
          height: '100%',
        }}
        renderItemOverlay={renderVideoOverlay}
      />

      {isLoading ? loadingIndicator : null}

      <BottomNavigation activeItem={activeNavItem} onItemClick={setActiveNavItem} />
    </div>
  );
};

export default App;
