import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Animated as RNAnimated } from 'react-native';
import { VideoView, useVideoPlayer, VideoPlayer } from 'expo-video';
import { useEvent } from 'expo';

// Import the screen components
import TrackScreen from './track';
import RemindScreen from './remind';
import InsightsScreen from './insights';

interface NavItem {
  label: string
  isNew?: boolean
}

export default function MobileNav() {
  const [activeTab, setActiveTab] = useState("Track")
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isIOS, setIsIOS] = useState(false)
  const [hasPlayedOnce, setHasPlayedOnce] = useState<Record<string, boolean>>({
    Track: false,
    Remind: false,
    Insights: false,
  })
  const [isPermanentlyZoomed, setIsPermanentlyZoomed] = useState<Record<string, boolean>>({
    Track: false,
    Remind: false,
    Insights: false,
  })

  const videoPlayersRef = useRef<Record<string, VideoPlayer | null>>({
    Track: null,
    Remind: null,
    Insights: null,
  })

  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({})

  // Animated values
  const underlineLeft = useRef(new RNAnimated.Value(0)).current
  const underlineWidth = useRef(new RNAnimated.Value(0)).current
  const underlineOpacity = useRef(new RNAnimated.Value(0)).current

  // Store animated values for video scales
  const videoScaleValues = useRef<Record<string, RNAnimated.Value>>({
    Track: new RNAnimated.Value(0.9),
    Remind: new RNAnimated.Value(0.9),
    Insights: new RNAnimated.Value(0.9),
  }).current

  const navItems: NavItem[] = [{ label: "Track" }, { label: "Remind" }, { label: "Insights" }]

  // Initialize video players
  try {
    videoPlayersRef.current.Track = useVideoPlayer(require('../../assets/videos/track.mp4'));
    if (videoPlayersRef.current.Track) {
      videoPlayersRef.current.Track.muted = true;
      videoPlayersRef.current.Track.loop = false;
    }
    videoPlayersRef.current.Remind = useVideoPlayer(require('../../assets/videos/remind.mp4'));
    if (videoPlayersRef.current.Remind) {
      videoPlayersRef.current.Remind.muted = true;
      videoPlayersRef.current.Remind.loop = false;
    }
    videoPlayersRef.current.Insights = useVideoPlayer(require('../../assets/videos/insights.mp4'));
    if (videoPlayersRef.current.Insights) {
      videoPlayersRef.current.Insights.muted = true;
      videoPlayersRef.current.Insights.loop = false;
    }
  } catch (e) {
    console.error("Error loading video assets. Check paths in _layout.tsx:", e);
    // Handle missing assets, perhaps by not rendering video-dependent parts or showing placeholders
  }

  // Detect iOS
  useEffect(() => {
    setIsIOS(Platform.OS === 'ios')
  }, [])

  // iOS initial video playback fix
  useEffect(() => {
    if (isIOS && isInitialLoad) { // Only on initial load for iOS
      let initialActiveTabPlayed = false;
      Object.keys(videoPlayersRef.current).forEach((key) => {
        const player = videoPlayersRef.current[key];
        if (player) {
          try {
            player.volume = 0.01; // Keep low volume for this process
            player.play(); // play() is void, no promise returned

            // Directly manage state after attempting to play
            if (key !== activeTab || initialActiveTabPlayed) {
              setTimeout(() => {
                if (videoPlayersRef.current[key]) { // Re-check player in timeout
                  videoPlayersRef.current[key]!.pause();
                  videoPlayersRef.current[key]!.currentTime = 0;
                  videoPlayersRef.current[key]!.volume = 1;
                }
              }, 50);
            } else if (key === activeTab && !initialActiveTabPlayed) {
              player.volume = 1;
              setHasPlayedOnce((prev) => ({ ...prev, [key]: true }));
              setIsPermanentlyZoomed((prev) => ({ ...prev, [key]: true }));
              RNAnimated.timing(videoScaleValues[key], {
                toValue: 1.1,
                duration: 300,
                useNativeDriver: false,
              }).start();
              initialActiveTabPlayed = true;
            }
          } catch (error) {
            console.error(`iOS initial playback error for ${key}:`, error);
            // Optionally reset player volume or state here if needed after an error
            if (player) {
              player.volume = 1; // Reset volume
            }
          }
        }
      });
    }
  }, [isIOS, isInitialLoad, activeTab, videoScaleValues]);

  // Initial underline position and fade-in
  useEffect(() => {
    if (Object.keys(tabLayouts).length === navItems.length) {
      const initialTabLayout = tabLayouts["Track"] // Default to Track
      if (initialTabLayout) {
        underlineLeft.setValue(initialTabLayout.x)
        underlineWidth.setValue(initialTabLayout.width)
        RNAnimated.timing(underlineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false, // Opacity can use true, but consistency
        }).start()
      }
      // After initial animation, switch to slide mode
      setTimeout(() => {
        setIsInitialLoad(false)
      }, 500) // Duration of opacity animation
    }
  }, [tabLayouts])

  // Update underline and video states on activeTab change
  useEffect(() => {
    if (!isInitialLoad && Object.keys(tabLayouts).length === navItems.length) {
      const activeItemLayout = tabLayouts[activeTab]
      if (activeItemLayout) {
        RNAnimated.parallel([
          RNAnimated.timing(underlineLeft, {
            toValue: activeItemLayout.x,
            duration: 300,
            useNativeDriver: false, // Left/width often false
          }),
          RNAnimated.timing(underlineWidth, {
            toValue: activeItemLayout.width,
            duration: 300,
            useNativeDriver: false,
          })
        ]).start()
      }
    }

    ["Track", "Remind", "Insights"].forEach((tabName) => {
      const player = videoPlayersRef.current[tabName]
      const scaleValue = videoScaleValues[tabName]

      if (isIOS && isInitialLoad && tabName === activeTab) return // Handled by iOS initial effect

      if (activeTab === tabName) {
        if (player && !hasPlayedOnce[tabName]) {
          player.currentTime = 0
          player.play()
          setHasPlayedOnce((prev) => ({ ...prev, [tabName]: true }))
        }
        // Ensure permanently zoomed tab stays zoomed or animates to zoom
        if (!isPermanentlyZoomed[tabName]) { // if somehow it was unzoomed
          setIsPermanentlyZoomed((prev) => ({ ...prev, [tabName]: true }))
        }
        RNAnimated.timing(scaleValue, { toValue: 1.1, duration: 300, useNativeDriver: false }).start()
      } else { // Tab is not active
        if (player) {
          player.pause()
          player.currentTime = 0
        }
        // If it was permanently zoomed, but now tab is inactive, reset permanent zoom and animate scale down
        if (isPermanentlyZoomed[tabName]) {
          setIsPermanentlyZoomed((prev) => ({ ...prev, [tabName]: false }))
        }
        RNAnimated.timing(scaleValue, { toValue: 0.9, duration: 300, useNativeDriver: false }).start()
      }
    })
  }, [activeTab, isInitialLoad, tabLayouts, hasPlayedOnce])

  // Effect to handle permanent zoom changes separately to avoid re-triggering complex effects
  useEffect(() => {
    navItems.forEach(item => {
      const tabName = item.label
      const shouldBeZoomed = isPermanentlyZoomed[tabName] && activeTab === tabName
      const targetScale = shouldBeZoomed ? 1.1 : 0.9
      RNAnimated.timing(videoScaleValues[tabName], {
        toValue: targetScale,
        duration: 300,
        useNativeDriver: false, // transform often needs false
      }).start()
    })
  }, [isPermanentlyZoomed, activeTab, videoScaleValues])

  const handleTabClick = (label: string) => {
    setActiveTab(label)
    // Reset hasPlayedOnce for the new active tab so its video can play if it hasn't
    // This logic is a bit complex with permanent zoom, ensure it aligns with desired UX
    if (["Track", "Remind", "Insights"].includes(label)) {
      setHasPlayedOnce((prev) => ({ ...prev, [label]: false }))
      // When a tab is clicked, it should become the "permanently zoomed" one if videos are involved
      setIsPermanentlyZoomed((prev) => ({
        ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), // Reset all
        [label]: true, // Set current to true
      }))
    }
  }

  const handleVideoClick = (label: string) => {
    const player = videoPlayersRef.current[label]
    if (player) {
      player.currentTime = 0
      player.play()
    }
    // Set this tab as active and permanently zoomed
    if (activeTab !== label) {
      setActiveTab(label)
    }
    // Ensure this one is marked for permanent zoom, and others are not (if only one can be "focused" via click)
    setIsPermanentlyZoomed((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [label]: true,
    }))
    setHasPlayedOnce((prev) => ({ ...prev, [label]: true })) // Mark as played after click
  }

  const handleItemLayout = (label: string, event: any) => { // event type is LayoutChangeEvent
    const { x, width } = event.nativeEvent.layout
    setTabLayouts(prev => ({ ...prev, [label]: { x, width } }))
  }

  // Helper function to render the active screen
  const renderActiveScreen = () => {
    if (activeTab === "Track") {
      return <TrackScreen />;
    }
    if (activeTab === "Remind") {
      return <RemindScreen />;
    }
    if (activeTab === "Insights") {
      return <InsightsScreen />;
    }
    return null; // Or a default screen
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.navWrapper}>
        <View style={styles.navContainer}>
          <View style={styles.navItemsContainer}>
            {navItems.map((item, index) => (
              <Pressable
                key={item.label}
                onLayout={(event) => handleItemLayout(item.label, event)}
                onPress={() => handleTabClick(item.label)}
                style={[
                  styles.navItemBase,
                  // Add margin for gap effect, skip for the first item if using marginLeft
                  // For a "gap" like effect, you might add marginHorizontal to each item
                  // or justifyContent: 'space-around' or 'space-between' on parent.
                  // Since styles.navItemsContainer has flex and justifyContent,
                  // the individual item margin might not be needed or could be adjusted.
                  // Let's rely on navItemsContainer's justifyContent for now.
                ]}
              >
                <View style={styles.iconContainer}>
                  {videoPlayersRef.current[item.label] && (
                    <Pressable onPress={() => handleVideoClick(item.label)} style={styles.videoPressable}>
                      <RNAnimated.View style={[{ transform: [{ scale: videoScaleValues[item.label] }] }, styles.animatedVideoView]}>
                        {videoPlayersRef.current[item.label] && (
                          <VideoViewWithPlayer
                            player={videoPlayersRef.current[item.label]!}
                            itemLabel={item.label} />
                        )}
                      </RNAnimated.View>
                    </Pressable>
                  )}
                </View>
                <View style={styles.labelContainer}>
                  <Text style={[
                    styles.labelText,
                    activeTab === item.label ? styles.labelTextActive : styles.labelTextInactive
                  ]}>
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Animated underline */}
          {Object.keys(tabLayouts).length === navItems.length && (
            <RNAnimated.View
              style={[
                styles.underline,
                {
                  left: underlineLeft,
                  width: underlineWidth,
                  opacity: underlineOpacity,
                },
              ]}
            />
          )}
        </View>
      </View>

      {/* Render the active screen content below the navigator */}
      <View style={styles.contentContainer}>
        {renderActiveScreen()}
      </View>
    </View>
  )
}

// Helper component to encapsulate VideoView and its event listener
const VideoViewWithPlayer = ({ player, itemLabel }: { player: VideoPlayer; itemLabel: string }) => {
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    // Check if status is an object and not null, then check for didJustFinish
    if (typeof status === 'object' && status !== null && (status as any).didJustFinish) {
    }
  }, [status, itemLabel, player]);

  return (
    <VideoView
      player={player}
      nativeControls={false}
      contentFit="contain"
      style={styles.videoBase}
    />
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF', // Changed from '#000' to white
  },
  navWrapper: {
    paddingTop: 30, // Added padding to move the navbar down
    // Adjust styles as needed, ensure it doesn't overlap content if positioned absolutely
    // backgroundColor: 'rgba(10, 25, 47, 0.0)', // Example: Semi-transparent dark blue
    paddingBottom: 0, // Add padding if content is meant to be offset by the nav
    zIndex: 10, // Ensure nav is above content if they overlap
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 0, // Removed paddingVertical
    backgroundColor: 'rgba(0, 0, 0, 0.0)', // Transparent background
    borderTopWidth: 0, // Removed top border
    // borderTopColor: 'rgba(255, 255, 255, 0.1)', // Example border color
  },
  navItemsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around', // This will space out your items
    paddingHorizontal: 0, // Add some horizontal padding if needed
  },
  navItemBase: {
    // flex: 1, // If you want items to grow and fill space, uncomment. May affect space-around.
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // center icon and text vertically within the pressable area
    paddingBottom: 8, // Add some padding so underline doesn't overlap text too much
  },
  iconContainer: {
    width: 48,  // w-12
    height: 48, // h-12
    justifyContent: 'center',
    alignItems: 'center',
    // overflow: 'visible' is default for RN View, but ensure child animations aren't clipped
  },
  animatedVideoView: { // Added to ensure the animated view itself has dimensions
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPressable: { // Container for the video, ensures touch target is good
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBase: { // style for the VideoView component itself
    width: '100%',  // Will take full size of its parent (animatedVideoView)
    height: '100%',
  },
  labelContainer: {
    marginTop: 4,
  },
  labelText: {
    fontSize: 12,
    color: '#000', // Default text color (black, good for white background)
  },
  labelTextActive: {
    fontWeight: '600',
    color: '#000', // Active text color (black, good for white background)
  },
  labelTextInactive: {
    fontWeight: '400',
    color: '#333', // Inactive text color (dark grey, good for white background)
  },
  underline: {
    height: 2,
    backgroundColor: '#1E90FF', // A distinct color for the underline
    position: 'absolute',
    bottom: 0, // Position underline at the bottom of the nav container
  },
  // Style for the container that will hold the screen content
  contentContainer: {
    flex: 1, // This will make the content area take up the remaining space
    // Add any other styling you need for the content area
  },
})

