// YouTube Timestamp DJ Popup Script

class TimestampPopup {
  constructor() {
    this.currentTab = null;
    this.timestamps = {};

    this.init();
  }

  async init() {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;

    // Check if we're on YouTube
    if (this.isYouTubeTab(tab)) {
      document.getElementById('video-info').style.display = 'block';
      document.getElementById('timestamp-controls').style.display = 'block';
      this.loadVideoInfo();
      this.loadTimestamps();
      this.setupEventListeners();
    } else {
      document.getElementById('not-youtube').style.display = 'block';
      document.getElementById('timestamp-controls').style.display = 'none';
    }
  }

  isYouTubeTab(tab) {
    return tab && tab.url && tab.url.includes('youtube.com/watch');
  }

  async loadVideoInfo() {
    try {
      // Get video title from the page
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        function: () => {
          const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer');
          return titleElement ? titleElement.textContent.trim() : 'Unknown Video';
        }
      });

      if (results && results[0] && results[0].result) {
        document.getElementById('video-title').textContent = results[0].result;
      }
    } catch (error) {
      console.error('Failed to get video title:', error);
      document.getElementById('video-title').textContent = 'Error loading title';
    }
  }

  async loadTimestamps() {
    try {
      // Get video ID first
      const url = this.currentTab.url;
      const match = url.match(/[?&]v=([^#\&\?]*)/);
      const videoId = match ? match[1] : null;

      if (videoId) {
        // Load timestamps directly from storage
        const result = await chrome.storage.local.get(videoId);
        this.timestamps = result[videoId] || {};
        this.updateInputFields();
      }
    } catch (error) {
      console.error('Failed to load timestamps:', error);
    }
  }

  updateInputFields() {
    const keys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
    keys.forEach(key => {
      const input = document.getElementById(`time-${key}`);
      if (input && this.timestamps[key]) {
        input.value = this.timestamps[key];
      }
    });
  }

  setupEventListeners() {
    // Set current time buttons
    document.querySelectorAll('.set-current-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const key = e.target.dataset.key;
        this.setCurrentTime(key);
      });
    });

    // Input field changes
    document.querySelectorAll('.time-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.id.split('-')[1];
        const timeValue = e.target.value.trim();
        this.setTimestamp(key, timeValue);
      });

      input.addEventListener('input', (e) => {
        const key = e.target.id.split('-')[1];
        const timeValue = e.target.value.trim();
        this.setTimestamp(key, timeValue);
      });
    });

    // Clear all button
    document.getElementById('clear-all').addEventListener('click', () => {
      this.clearAllTimestamps();
    });
  }

  async setCurrentTime(key) {
    try {
      // Get current video time from content script
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        function: () => {
          const video = document.querySelector('video') || document.querySelector('.html5-main-video');
          if (video && video.currentTime) {
            return video.currentTime;
          }
          return null;
        }
      });

      if (results && results[0] && results[0].result !== null) {
        const currentTime = results[0].result;
        const timeString = this.formatTime(currentTime);
        document.getElementById(`time-${key}`).value = timeString;
        this.setTimestamp(key, timeString);
      }
    } catch (error) {
      console.error('Failed to get current time:', error);
      alert('Could not get current video time. Make sure a video is playing.');
    }
  }

  async setTimestamp(key, timeString) {
    try {
      // Get video ID
      const url = this.currentTab.url;
      const match = url.match(/[?&]v=([^#\&\?]*)/);
      const videoId = match ? match[1] : null;

      if (videoId) {
        // Update local timestamps
        if (timeString.trim()) {
          this.timestamps[key] = timeString.trim();
        } else {
          delete this.timestamps[key];
        }

        // Save to storage
        await chrome.storage.local.set({ [videoId]: this.timestamps });

        // Also notify content script if it's running
        try {
          await chrome.tabs.sendMessage(this.currentTab.id, {
            action: 'setTimestamp',
            key: key,
            time: timeString
          });
        } catch (e) {
          // Content script might not be ready, but storage is saved
        }
      }
    } catch (error) {
      console.error('Failed to set timestamp:', error);
    }
  }

  async clearAllTimestamps() {
    if (confirm('Are you sure you want to clear all timestamps for this video?')) {
      try {
        // Get video ID
        const url = this.currentTab.url;
        const match = url.match(/[?&]v=([^#\&\?]*)/);
        const videoId = match ? match[1] : null;

        if (videoId) {
          // Clear storage
          await chrome.storage.local.set({ [videoId]: {} });

          // Clear input fields
          const keys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
          keys.forEach(key => {
            const input = document.getElementById(`time-${key}`);
            if (input) input.value = '';
          });

          this.timestamps = {};

          // Also notify content script if it's running
          try {
            await chrome.tabs.sendMessage(this.currentTab.id, {
              action: 'clearTimestamps'
            });
          } catch (e) {
            // Content script might not be ready, but storage is cleared
          }
        }
      } catch (error) {
        console.error('Failed to clear timestamps:', error);
      }
    }
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TimestampPopup();
});
