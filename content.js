// YouTube Timestamp DJ Content Script

class YouTubeTimestampDJ {
  constructor() {
    this.videoId = null;
    this.timestamps = {};
    this.videoElement = null;
    this.isInitialized = false;

    this.init();
  }

  init() {
    console.log('YouTube Timestamp DJ: Content script loaded');

    // Wait for YouTube to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeExtension());
    } else {
      this.initializeExtension();
    }
  }

  initializeExtension() {
    console.log('YouTube Timestamp DJ: Initializing extension');

    // Use MutationObserver to watch for video changes
    const observer = new MutationObserver(() => {
      const newVideoId = this.getVideoId();
      if (newVideoId && newVideoId !== this.videoId) {
        console.log('YouTube Timestamp DJ: Video changed to:', newVideoId);
        this.videoId = newVideoId;
        this.loadTimestamps();
        this.findVideoElement();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial setup
    this.videoId = this.getVideoId();
    console.log('YouTube Timestamp DJ: Initial video ID:', this.videoId);

    if (this.videoId) {
      this.loadTimestamps();
      this.findVideoElement();
    }

    // Periodic check for video element (in case it loads later)
    const checkVideoInterval = setInterval(() => {
      if (!this.videoElement) {
        this.findVideoElement();
        if (this.videoElement) {
          console.log('YouTube Timestamp DJ: Video element found via periodic check');
          clearInterval(checkVideoInterval);
        }
      }
    }, 1000);

    // Listen for keyboard events
    document.addEventListener('keydown', (event) => this.handleKeyPress(event));

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('YouTube Timestamp DJ: Received message:', message.action);
      if (message.action === 'setTimestamp') {
        this.setTimestamp(message.key, message.time);
        sendResponse({ success: true });
      } else if (message.action === 'getTimestamps') {
        sendResponse({ timestamps: this.timestamps });
      } else if (message.action === 'clearTimestamps') {
        this.clearTimestamps();
        sendResponse({ success: true });
      }
    });

    this.isInitialized = true;
    console.log('YouTube Timestamp DJ: Extension initialized successfully');
  }

  getVideoId() {
    const url = window.location.href;
    const match = url.match(/[?&]v=([^#\&\?]*)/);
    return match ? match[1] : null;
  }

  findVideoElement() {
    // YouTube video element selector (may change with YouTube updates)
    this.videoElement = document.querySelector('video');
    if (!this.videoElement) {
      // Try alternative selectors for different YouTube layouts
      this.videoElement = document.querySelector('.html5-main-video');
    }
    if (!this.videoElement) {
      // Try more selectors
      this.videoElement = document.querySelector('#movie_player video');
    }
    if (!this.videoElement) {
      // Last resort - find any video element
      const videos = document.querySelectorAll('video');
      if (videos.length > 0) {
        this.videoElement = videos[0];
      }
    }
    console.log('YouTube Timestamp DJ: Video element found:', !!this.videoElement, this.videoElement);
  }

  async loadTimestamps() {
    if (!this.videoId) return;

    try {
      const result = await chrome.storage.local.get(this.videoId);
      this.timestamps = result[this.videoId] || {};
    } catch (error) {
      console.error('Failed to load timestamps:', error);
      this.timestamps = {};
    }
  }

  async saveTimestamps() {
    if (!this.videoId) return;

    try {
      await chrome.storage.local.set({ [this.videoId]: this.timestamps });
    } catch (error) {
      console.error('Failed to save timestamps:', error);
    }
  }

  handleKeyPress(event) {
    console.log('YouTube Timestamp DJ: Key pressed:', event.key);

    // Only handle keys QWERTYUIOP
    const key = event.key.toLowerCase();
    if (!['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].includes(key)) {
      return;
    }

    console.log('YouTube Timestamp DJ: Handling key:', key);

    // Don't trigger if user is typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' ||
        event.target.contentEditable === 'true') {
      console.log('YouTube Timestamp DJ: Ignoring key - user is typing in input field');
      return;
    }

    event.preventDefault();

    this.jumpToTimestamp(key);
  }

  jumpToTimestamp(key) {
    console.log('YouTube Timestamp DJ: Jumping to timestamp for key:', key);
    console.log('YouTube Timestamp DJ: Available timestamps:', this.timestamps);
    console.log('YouTube Timestamp DJ: Video element exists:', !!this.videoElement);

    if (!this.timestamps[key] || !this.videoElement) {
      console.log('YouTube Timestamp DJ: Cannot jump - missing timestamp or video element');
      return;
    }

    const timeInSeconds = this.convertTimeToSeconds(this.timestamps[key]);
    console.log('YouTube Timestamp DJ: Converted time to seconds:', timeInSeconds);

    if (timeInSeconds !== null) {
      console.log('YouTube Timestamp DJ: Setting video time to:', timeInSeconds);
      this.videoElement.currentTime = timeInSeconds;
      // Also update YouTube's progress bar if possible
      this.updateYouTubeProgress(timeInSeconds);
    }
  }

  updateYouTubeProgress(timeInSeconds) {
    // Try to trigger YouTube's internal progress update
    try {
      // This might work with current YouTube implementation
      const progressBar = document.querySelector('.ytp-progress-bar');
      if (progressBar) {
        const percentage = (timeInSeconds / this.videoElement.duration) * 100;
        progressBar.style.width = percentage + '%';
      }
    } catch (error) {
      // Ignore errors - this is just a visual enhancement
    }
  }

  setTimestamp(keyNumber, timeString) {
    if (!this.videoId) return;

    this.timestamps[keyNumber] = timeString;
    this.saveTimestamps();
  }

  clearTimestamps() {
    if (!this.videoId) return;

    this.timestamps = {};
    this.saveTimestamps();
  }

  convertTimeToSeconds(timeString) {
    // Support formats like "1:23", "1:23:45", "123" (seconds)
    const parts = timeString.split(':').map(part => parseInt(part.trim()));

    if (parts.length === 1) {
      // Just seconds
      return parts[0];
    } else if (parts.length === 2) {
      // minutes:seconds
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // hours:minutes:seconds
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return null;
  }
}

// Initialize the extension
new YouTubeTimestampDJ();
