import React, { useState, useCallback } from 'react';
import { VerticalFeed, type VideoItem } from '../../src/VerticalFeed';
import {
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

// Video metadata for each video in the feed
const VIDEO_METADATA = [
  {
    username: 'reinaldosimoes',
    caption:
      "Training my first neural network vs debugging why it won't converge 🤖💀 #machinelearning #AI #deeplearning",
    audioText: 'Neural Network Dreams - AI Lofi',
    playlistText: 'ML Fails · 180K+ 🧠🔥',
    likeCount: '328.4K',
    commentCount: '1.5K',
    bookmarkCount: '42.1K',
    shareCount: '2.1K',
  },
  {
    username: 'reinaldosimoes',
    caption:
      'Me: "I built an AI model!" Friend: "What does it do?" Me: "...classifies cats" 😅 #AIdev #MLhumor #pytorch',
    audioText: 'GPU Fans Go Brrr - Tech Remix',
    playlistText: 'AI Memes · 95K+ 🤖✨',
    likeCount: '267.8K',
    commentCount: '2.3K',
    bookmarkCount: '31.2K',
    shareCount: '1.8K',
  },
  {
    username: 'reinaldosimoes',
    caption:
      'Spending 6 hours fine-tuning hyperparameters to improve accuracy by 0.3% 🎯 #LLM #transformers #AIresearch',
    audioText: 'Gradient Descent Vibes',
    playlistText: 'AI Engineering · 120K+ 🚀',
    likeCount: '412.9K',
    commentCount: '3.1K',
    bookmarkCount: '56.7K',
    shareCount: '2.9K',
  },
];

// Top Navigation Component
interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Gaming', 'Food', 'Sports', 'Fashion'];

  return (
    <div className="top-navigation">
      <div className="top-nav-center">
        {tabs.map(tab => (
          <span
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </span>
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

// Right Sidebar Component
interface RightSidebarProps {
  liked: boolean;
  bookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  likeCount: string;
  commentCount: string;
  bookmarkCount: string;
  shareCount: string;
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
}) => (
  <div className="right-sidebar">
    {/* Profile Button */}
    <div className="sidebar-item profile-button">
      <div className="profile-avatar">RS</div>
      <button className="follow-button">
        <Plus size={12} strokeWidth={3} color="#FFFFFF" />
      </button>
    </div>

    {/* Like Button */}
    <div className="sidebar-item">
      <button className={`action-button ${liked ? 'liked' : ''}`} onClick={onLike}>
        <Heart
          size={32}
          fill={liked ? '#FF0050' : 'none'}
          color={liked ? '#FF0050' : '#FFFFFF'}
          strokeWidth={2}
        />
        <span className="action-count">{likeCount}</span>
      </button>
    </div>

    {/* Comment Button */}
    <div className="sidebar-item">
      <button className="action-button">
        <MessageCircle size={32} color="#FFFFFF" strokeWidth={2} />
        <span className="action-count">{commentCount}</span>
      </button>
    </div>

    {/* Bookmark Button */}
    <div className="sidebar-item">
      <button className={`action-button ${bookmarked ? 'bookmarked' : ''}`} onClick={onBookmark}>
        <Bookmark
          size={32}
          fill={bookmarked ? '#FFD700' : 'none'}
          color={bookmarked ? '#FFD700' : '#FFFFFF'}
          strokeWidth={2}
        />
        <span className="action-count">{bookmarkCount}</span>
      </button>
    </div>

    {/* Share Button */}
    <div className="sidebar-item">
      <button className="action-button">
        <Share size={32} color="#FFFFFF" strokeWidth={2} />
        <span className="action-count">{shareCount}</span>
      </button>
    </div>

    {/* GitHub Button */}
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

// Bottom Overlay Component
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

// Bottom Navigation Component
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
            <div key={item.id} className="nav-item" onClick={() => onItemClick(item.id)}>
              <div className="create-button">
                <div className="create-button-inner">
                  <Plus size={20} strokeWidth={3} />
                </div>
              </div>
            </div>
          );
        }
        return (
          <div
            key={item.id}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onItemClick(item.id)}
          >
            <div className="nav-item-icon">
              <Icon size={24} fill={activeItem === item.id ? '#FFFFFF' : 'none'} />
              {item.badge && <span className="notification-badge">{item.badge}</span>}
            </div>
            <span className="nav-item-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// Loading Indicator Component
const LoadingIndicator: React.FC = () => (
  <div className="loading-dots">
    <div className="loading-dot" />
    <div className="loading-dot" />
  </div>
);

// Main App Component
const App = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState('Sports');
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoStates, setVideoStates] = useState<
    Record<number, { liked: boolean; bookmarked: boolean }>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const videos: VideoItem[] = [
    {
      src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      controls: false,
      autoPlay: true,
      muted: true,
      playsInline: true,
      loop: true,
    },
    {
      src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      controls: false,
      autoPlay: true,
      muted: true,
      playsInline: true,
      loop: true,
    },
    {
      src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      controls: false,
      autoPlay: true,
      muted: true,
      playsInline: true,
      loop: true,
    },
  ];

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
    // Simulate loading more content
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const handleItemVisible = useCallback((item: VideoItem, index: number) => {
    console.log(`Video ${index} is now visible`);
  }, []);

  const handleItemHidden = useCallback((item: VideoItem, index: number) => {
    console.log(`Video ${index} is now hidden`);
  }, []);

  const handleCurrentItemChange = useCallback((index: number) => {
    setCurrentVideoIndex(index);
  }, []);

  const renderVideoOverlay = useCallback(
    (item: VideoItem, index: number): React.ReactNode => {
      // Only render overlay for the currently visible video
      if (index !== currentVideoIndex) {
        return null;
      }

      const { liked = false, bookmarked = false } = videoStates[index] || {};
      const metadata = VIDEO_METADATA[index] || VIDEO_METADATA[0];

      return (
        <>
          <RightSidebar
            liked={liked}
            bookmarked={bookmarked}
            onLike={() => toggleLike(index)}
            onBookmark={() => toggleBookmark(index)}
            likeCount={metadata.likeCount}
            commentCount={metadata.commentCount}
            bookmarkCount={metadata.bookmarkCount}
            shareCount={metadata.shareCount}
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
    [videoStates, toggleLike, toggleBookmark, currentVideoIndex]
  );

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000', position: 'relative' }}>
      <TopNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <VerticalFeed
        items={videos}
        onEndReached={handleEndReached}
        onItemVisible={handleItemVisible}
        onItemHidden={handleItemHidden}
        onCurrentItemChange={handleCurrentItemChange}
        style={{
          height: '100%',
        }}
        renderItemOverlay={renderVideoOverlay}
      />

      {isLoading && <LoadingIndicator />}

      <BottomNavigation activeItem={activeNavItem} onItemClick={setActiveNavItem} />
    </div>
  );
};

export default App;
