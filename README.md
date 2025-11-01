# YouTube Timestamp DJ

A Chrome extension that lets you assign timestamps to keyboard keys QWERTYUIOP and jump to them instantly while watching YouTube videos.

## Features

- Assign timestamps to keys QWERTYUIOP
- Jump to timestamps by pressing the corresponding keys while watching videos
- Timestamps are saved per video automatically
- Easy-to-use popup interface
- Works only on YouTube (as intended)

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the folder containing this extension
5. The extension should now appear in your extensions list

## How to Use

1. **Navigate to a YouTube video** - The extension only works on YouTube watch pages
2. **Click the extension icon** in your Chrome toolbar to open the popup
3. **Set timestamps** in one of two ways:
   - Type timestamps manually (e.g., "1:23" for 1 minute 23 seconds, or "1:23:45" for 1 hour 23 minutes 45 seconds)
   - Click "Set Current" next to any key to use the current video time
4. **Start watching** your video
5. **Press keys QWERTYUIOP** to jump to the assigned timestamps
6. **Timestamps are automatically saved** for each video

## Time Format

The extension supports multiple time formats:
- `45` - 45 seconds
- `1:23` - 1 minute 23 seconds
- `1:23:45` - 1 hour 23 minutes 45 seconds

## Tips

- Keys only work when you're not typing in input fields
- Timestamps are stored locally in your browser
- Each video remembers its own set of timestamps
- Use "Clear All Timestamps" to reset all keys for the current video

## Technical Details

- Built with Manifest V3
- Uses content scripts to interact with YouTube pages
- Stores data using Chrome's storage API
- No external dependencies

## Privacy

This extension:
- Only runs on YouTube domains
- Stores timestamp data locally in your browser
- Does not collect or transmit any personal data
- Does not track your viewing habits

## Troubleshooting

**Extension not working?**
- Make sure you're on a YouTube video page (not the homepage or search results)
- Try refreshing the page after installing
- Check that the extension is enabled in `chrome://extensions/`

**Timestamps not saving?**
- Ensure you've entered valid time formats
- Try clicking outside the input field to trigger the save

**Keyboard shortcuts not working?**
- Make sure you're not typing in a text field when pressing the keys
- The video must be loaded and playing for the shortcuts to work

## Development

To modify the extension:
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension card
4. Test your changes on a YouTube video

## License

This project is open source. Feel free to modify and distribute.
