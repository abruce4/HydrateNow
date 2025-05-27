# 💧 HydrateNow

**Stay hydrated, stay healthy!** HydrateNow is a modern, intuitive hydration tracking app built with React Native and Expo that helps you monitor your daily water intake and maintain healthy hydration habits.

## 🌟 Features

- **📊 Hydration Tracking**: Log your water intake with quick-add buttons or custom amounts
- **🎯 Daily Goals**: Set and track personalized daily hydration goals
- **📈 Progress Visualization**: Beautiful circular progress indicators showing your hydration status
- **⏰ Smart Reminders**: Customizable notifications to remind you to drink water
- **📱 Insights Dashboard**: Weekly and monthly analytics with interactive charts
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations
- **🌙 Dark Mode**: Automatic theme switching for comfortable viewing
- **📲 Cross-Platform**: Works seamlessly on iOS, Android, and Web

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) ~53.0.9 with React Native 0.79.2
- **Language**: TypeScript
- **Navigation**: Expo Router with file-based routing
- **State Management**: Zustand for efficient state management
- **UI Components**: Custom themed components with React Native elements
- **Charts**: React Native SVG Charts for data visualization
- **Notifications**: Expo Notifications for hydration reminders
- **Storage**: AsyncStorage for data persistence

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or later)
- npm or yarn
- Expo CLI (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/HydrateNow.git
   cd HydrateNow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - **iOS**: `npm run ios` or scan QR code with Camera app
   - **Android**: `npm run android` or scan QR code with Expo Go
   - **Web**: `npm run web`

## 📱 App Structure

```
app/
├── (tabs)/
│   ├── track.tsx      # Main hydration tracking screen
│   ├── remind.tsx     # Reminder settings and notifications
│   ├── insights.tsx   # Analytics and progress charts
│   └── _layout.tsx    # Tab navigation layout
├── onboarding.tsx     # Welcome and setup flow
└── _layout.tsx        # Root layout configuration

components/
├── ui/                # Reusable UI components
├── ThemedText.tsx     # Themed text component
├── ThemedView.tsx     # Themed view component
└── ...

stores/
└── hydrationStore.ts  # Zustand store for hydration data
```

## 🎯 Key Screens

### 💧 Track Screen
- **Circular Progress Ring**: Visual representation of daily hydration progress
- **Quick Add Buttons**: Fast intake logging (250ml, 500ml)
- **Custom Amount Input**: Add any amount with modal interface
- **Daily Statistics**: Goal, consumed, and remaining water display
- **Achievement Celebrations**: Goal completion notifications

### ⏰ Remind Screen
- **Smart Notifications**: Customizable reminder intervals
- **Notification Scheduling**: Set specific times for hydration alerts
- **Reminder History**: Track notification effectiveness

### 📊 Insights Screen
- **Progress Charts**: Weekly and monthly hydration trends
- **Goal Analysis**: Success rate and consistency metrics
- **Hydration Patterns**: Identify your optimal drinking schedule

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality
- `npm run reset-project` - Reset to blank project template

## 🏗️ Development

### Architecture Highlights

- **File-based Routing**: Leveraging Expo Router for intuitive navigation
- **State Management**: Zustand provides lightweight, type-safe state management
- **Themed Components**: Consistent design system with light/dark mode support
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Performance Optimized**: Efficient rendering with React Native best practices

### Key Dependencies

- **Core**: React 19.0.0, React Native 0.79.2, Expo ~53.0.9
- **Navigation**: Expo Router, React Navigation
- **UI**: React Native SVG, React Native Gesture Handler, React Native Reanimated
- **Utilities**: AsyncStorage, Expo Notifications, Expo Haptics
- **Development**: TypeScript, ESLint, Expo development tools

## 🎨 Design System

HydrateNow features a cohesive design system with:
- **Color Palette**: Calming blues and greens inspired by water
- **Typography**: Clear, accessible text hierarchy
- **Iconography**: Consistent icon usage from Expo Vector Icons
- **Animations**: Smooth, meaningful micro-interactions
- **Accessibility**: Screen reader support and high contrast ratios

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Icons by [Expo Vector Icons](https://icons.expo.fyi)
- Charts powered by [React Native SVG Charts](https://github.com/JesperLekland/react-native-svg-charts)

---

**Stay hydrated, stay healthy! 💧**

For support or questions, please open an issue on GitHub.
