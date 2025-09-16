# ChatGPT Answer Collapser Enhanced v2.0

A powerful Chrome extension that transforms long ChatGPT conversations into organized, navigable experiences. Features advanced conversation management, favorites system, smart search, and multi-browser compatibility.

---

## ✨ Key Features

### 🎯 **Core Functionality**
- **Smart Answer Collapse**: Auto-collapse older answers while keeping the latest expanded
- **Image-Only Answer Support**: Properly handles ChatGPT responses with only images, code, or media
- **Universal Browser Support**: Optimized for Chrome, Arc, Edge, Firefox, and Safari
- **Arc Browser Integration**: Special positioning adjustments for Arc's sidebar layout

### 🔍 **Advanced Search & Navigation**
- **Full-Text Search**: Search complete question text (not just truncated previews)
- **Answer Content Search**: Optional search within ChatGPT's responses
- **Smart Pagination**: Handle large conversations (100+ Q&As) with smooth performance
- **Visual Indicators**: Icons show content types (🖼️ images, 💻 code, ⚠️ empty responses)

### ⭐ **Favorites & Organization**
- **Bookmark Questions**: Star important Q&A pairs for quick access
- **Dedicated Favorites View**: Separate panel to browse all bookmarked items
- **Export/Import Favorites**: Save and share your favorite conversations
- **Persistent Storage**: Favorites sync across browser sessions

### ⚙️ **Customization & Settings**
- **Sidebar Positioning**: Choose left or right placement with one click
- **Responsive Design**: Adapts beautifully to all screen sizes (mobile to ultrawide)
- **Theme Integration**: Seamless light/dark mode matching ChatGPT's theme
- **Performance Controls**: Adjust items per page, auto-collapse behavior

### ⌨️ **Keyboard Shortcuts**
- `Ctrl+Shift+F` → Toggle search
- `Ctrl+Shift+Z` → Toggle sort order
- `Ctrl+Shift+X` → Expand/collapse all answers
- `Ctrl+Shift+S` → Open settings
- `Ctrl+Shift+V` → View favorites
- `Ctrl+Shift+H` → Hide/show sidebar
- `Escape` → Close all panels

---

## 🚀 Installation

### Method 1: Load Unpacked (Recommended)

1. **Download the extension**:
   ```bash
   git clone https://github.com/yashginoya/chatgpt-collapser
   cd chatgpt-collapser
   ```

2. **Load in Chrome**:
    - Open `chrome://extensions/`
    - Enable "Developer mode" (top-right toggle)
    - Click "Load unpacked" → select the extension folder
    - Verify you see "ChatGPT Answer Collapser Enhanced v2.0"

3. **Test the installation**:
    - Visit ChatGPT and start a conversation
    - Look for the sidebar on the right (or left if configured)
    - Check browser console for: `ChatGPT Collapser v2.0 loaded ✅`

---

## 🎮 How to Use

### Basic Navigation
1. **Sidebar appears automatically** when you visit ChatGPT
2. **Questions are indexed** as Q1, Q2, Q3... with truncated previews
3. **Hover over questions** to see full text in tooltip
4. **Click "Jump"** to scroll to any answer instantly
5. **Toggle expand/collapse** for individual or all answers

### Advanced Features

#### ⭐ **Managing Favorites**
- Click the **☆ star icon** next to any question to bookmark it
- Use the **⭐ favorites button** in header to view all bookmarked items
- **Export favorites** via Settings → Export Favorites (saves as JSON)
- **Import favorites** from previously exported files

#### 🔍 **Smart Search**
- Click **🔍 search icon** or press `Ctrl+Shift+F`
- Type to search question text in real-time
- Check **"Search in answers"** to include ChatGPT's responses
- **Highlighted results** show with blue accent and border

#### ⚙️ **Customization**
- Click **⚙️ settings icon** to access configuration
- **Switch sidebar position** (left/right) instantly
- **Adjust pagination** (25/50/100 items per page)
- **Toggle auto-collapse** for older answers

#### 📱 **Multi-Device Support**
- **Responsive design** works on phones, tablets, and desktops
- **Arc browser users**: Sidebar automatically adjusts for Arc's layout
- **Touch-friendly** buttons and gestures on mobile devices

---

## 🛠️ Technical Improvements

### Performance Enhancements
- **Debounced updates**: Smooth performance during rapid ChatGPT updates
- **Smart pagination**: Only render visible items for large conversations
- **Efficient selectors**: Better detection of ChatGPT's UI elements
- **Memory management**: Proper cleanup and garbage collection

### Browser Compatibility
- **Universal selectors**: Works across different ChatGPT UI versions
- **Arc browser detection**: Automatic layout adjustments
- **Fallback mechanisms**: Graceful degradation if features aren't supported
- **Cross-browser testing**: Verified on Chrome, Arc, Edge, Firefox

### Accessibility Features
- **ARIA labels**: Screen reader compatibility
- **Keyboard navigation**: Full functionality without mouse
- **High contrast support**: Enhanced visibility for accessibility needs
- **Focus management**: Proper tab order and focus indicators

---

## 🔧 Development & Customization

### File Structure
```
chatgpt-collapser/
├── manifest.json         # Extension configuration
├── content.js            # Main functionality (2000+ lines)
├── styles.css            # Enhanced styling with themes
├── README.md             # This documentation
└── icons/                # Extension icons (16-128px)
```

### Key Functions
- `addCollapsers()` → Main conversation processing
- `filterQuestions()` → Search and filtering logic
- `toggleFavorite()` → Favorites management
- `changeSidebarPosition()` → Dynamic positioning
- `initializeEventHandlers()` → Event management

### Customization Options
- Modify `window.chatGPTCollapser.settings` for default preferences
- Adjust CSS variables for custom themes
- Extend keyboard shortcuts in the shortcuts object
- Add new features by extending the sidebar HTML template

---

## 🐛 Troubleshooting

### Common Issues

**Sidebar not appearing?**
- Check browser console for errors
- Verify extension is enabled in `chrome://extensions/`
- Refresh ChatGPT page and wait 2-3 seconds

**Search not finding results?**
- Try enabling "Search in answers" option
- Check if questions are properly loaded (scroll down in chat)
- Clear search and try different keywords

**Performance issues with large conversations?**
- Reduce "Items per page" in settings
- Enable "Auto-collapse" for better memory usage
- Consider splitting very long conversations

**Arc browser overlap issues?**
- Extension automatically detects Arc and adjusts positioning
- Try switching sidebar to left position in settings
- Refresh page if positioning seems incorrect

---

## 🔄 Version History

### v2.0 (Current)
- ✅ Fixed image-only answer handling
- ✅ Enhanced search with full-text support
- ✅ Added Arc browser compatibility
- ✅ Implemented favorites system
- ✅ Added sidebar positioning options
- ✅ Smart pagination for large conversations
- ✅ Comprehensive settings panel
- ✅ Enhanced keyboard shortcuts
- ✅ Improved responsive design
- ✅ Better theme integration

### v1.0 (Previous)
- Basic answer collapse/expand
- Simple sidebar with question list
- Basic search functionality
- Sort toggle (ascending/descending)

---

## 🤝 Contributing

We welcome contributions! Here are ways to help:

1. **Report bugs** with detailed reproduction steps
2. **Suggest features** that would improve user experience
3. **Submit pull requests** with code improvements
4. **Test on different browsers** and report compatibility issues
5. **Improve documentation** and help other users

### Development Setup
```bash
git clone https://github.com/yashginoya/chatgpt-collapser
cd chatgpt-collapser
# Make your changes
# Test thoroughly on ChatGPT
# Submit pull request with description
```

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- Thanks to the ChatGPT community for feature requests and testing
- Special thanks to Arc browser team for layout compatibility insights
- Inspired by the need for better conversation management in AI tools

---

**Made with ❤️ for the ChatGPT community**

*Star ⭐ this repo if it helps you manage your ChatGPT conversations better!*