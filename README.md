# TimeUTCNow - Live UTC Time & World Clock

🌍 **Live UTC Time, World Clock, and Time Zone Converter** - The most accurate and user-friendly UTC time reference available online.

**🔗 Live Site:** [https://timeutcnow.com](https://timeutcnow.com)

## Overview

TimeUTCNow is a modern, fast, and accurate web application that provides real-time UTC (Coordinated Universal Time) display, world clock functionality, and comprehensive time zone conversion tools. Built for developers, aviation professionals, researchers, and anyone who needs precise time coordination across global time zones.

## ✨ Features

### 🕐 Live UTC Time Display
- Real-time UTC clock with millisecond precision
- ISO 8601 format support with one-click copy
- Unix timestamp display
- Julian date calculator
- Seconds since epoch (Jan 1, 1970)
- Current astronomical day

### 🌎 World Clock
- View current time in major cities worldwide
- Add custom cities to your clock
- Search and filter cities by name or timezone
- Automatic daylight saving time (DST) handling
- 12-hour and 24-hour time format options

### 🔄 Time Zone Converter
- Convert any time to multiple time zones instantly
- Input time in UTC or any city's local time
- Perfect for scheduling international meetings
- Coordinate global conference calls and webinars
- Set deadlines across different time zones

### 🌐 Internationalization
- Available in 17+ languages including English, Spanish, French, German, Japanese, Chinese, Thai, Indonesian, and more
- Automatic language detection
- Locale-aware routing

### 💾 Privacy-First Design
- All data stored locally using IndexedDB
- No tracking, no cookies, no analytics
- No registration required
- Completely free to use

## 🚀 Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) - Modern web framework
- **Runtime:** [Bun](https://bun.sh/) - Fast JavaScript runtime
- **UI Framework:** [DaisyUI](https://daisyui.com/) - Tailwind CSS component library
- **Icons:** [Lucide Svelte](https://lucide.dev/) - Beautiful icon library
- **Storage:** IndexedDB - Client-side database for preferences
- **Internationalization:** [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) - Type-safe i18n

## 📦 Installation & Development

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/timeutcnow.git
cd timeutcnow

# Install dependencies
bun install

# Start development server
bun run dev

# Open in browser
# Navigate to http://localhost:5173
```

### Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build

# Code Quality
bun run check        # Type check with Svelte
bun run check:watch   # Watch mode for type checking

# Data Management
bun run generate:data-json  # Generate timezone data JSON
bun run convert:sqlite      # Convert JSON to SQLite
bun run convert:csv         # Convert SQLite to CSV
```

## 🏗️ Project Structure

```
timeutcnow/
├── src/
│   ├── routes/          # SvelteKit routes
│   │   └── [locale]/    # Localized routes
│   ├── lib/
│   │   ├── components/  # Reusable Svelte components
│   │   ├── utils/       # Utility functions
│   │   ├── data/        # Timezone and city data
│   │   └── types/       # TypeScript type definitions
│   └── paraglide/       # i18n messages
├── messages/            # Translation files
├── static/              # Static assets
└── openspec/            # Project specifications
```

## 🎯 Use Cases

- **Software Developers:** Timestamp debugging, API development, log analysis
- **Aviation Professionals:** Flight planning, Zulu time reference
- **Researchers & Scientists:** Precise time measurements, synchronized experiments
- **Business Professionals:** International meeting coordination, global operations
- **Remote Teams:** Cross-timezone collaboration, meeting scheduling

## 🔧 Key Features Explained

### UTC (Coordinated Universal Time)
UTC is the primary time standard by which the world regulates clocks and time. It's based on International Atomic Time (TAI) with leap seconds added to keep it synchronized with Earth's rotation. UTC is used in:
- Aviation and weather reporting
- Computer networks and distributed systems
- GPS satellites and space stations
- Financial markets and global trading
- Scientific research and data logging

### Why UTC Matters
In our interconnected world, UTC provides the foundation for global coordination. When scheduling video calls, booking international flights, or making financial transactions across time zones, UTC ensures everyone references the same moment in time.

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Site:** [https://timeutcnow.com](https://timeutcnow.com)
- **Documentation:** Coming soon
- **API Documentation:** Coming soon

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Icons by [Lucide](https://lucide.dev/)
- UI components by [DaisyUI](https://daisyui.com/)
- Timezone data from IANA Time Zone Database

---

**Made with ❤️ for the global community**

For questions, suggestions, or feedback, please open an issue on GitHub.
