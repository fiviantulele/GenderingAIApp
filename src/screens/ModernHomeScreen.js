import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ModernHomeScreen = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState('Overview');
  
  const slideAnimation = useRef(new Animated.Value(-width * 0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('conference-user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsRegistered(true);
        setUserName(user.name);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Close menu
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: -width * 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMenuOpen(false);
      });
    } else {
      // Open menu
      setIsMenuOpen(true);
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateX, {
          toValue: width * 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleMenuItemPress = (item) => {
    setSelectedMenuItem(item);
    toggleMenu();
    
    // Navigate based on menu item
    switch (item) {
      case 'Overview':
        // Already on home screen
        break;
      case 'Schedule':
        navigation.navigate('Agenda');
        break;
      case 'Speakers':
        // Navigate to speakers screen (you can create this later)
        break;
      case 'Sponsors':
        // Navigate to sponsors screen (you can create this later)
        break;
      case 'Partners':
        // Navigate to partners screen (you can create this later)
        break;
      case 'Maps':
        // Navigate to maps screen (you can create this later)
        break;
      case 'Messages':
        // Navigate to messages screen (you can create this later)
        break;
      case 'Bookmarks':
        navigation.navigate('Schedule');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { id: 'Overview', icon: '🏠', title: 'Overview' },
    { id: 'Schedule', icon: '📅', title: 'Schedule' },
    { id: 'Speakers', icon: '🎤', title: 'Speakers' },
    { id: 'Sponsors', icon: '🏆', title: 'Sponsors' },
    { id: 'Partners', icon: '🏢', title: 'Partners' },
    { id: 'Maps', icon: '📍', title: 'Maps' },
    { id: 'Messages', icon: '💬', title: 'Messages' },
    { id: 'Bookmarks', icon: '🔖', title: 'Bookmarks' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Navigation Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnimation }],
          },
        ]}
      >
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.drawerGradient}
        >
          {/* Logo Section */}
          <View style={styles.drawerHeader}>
            <View style={styles.drawerLogo}>
              <Text style={styles.drawerLogoText}>AI</Text>
            </View>
            <Text style={styles.drawerAppName}>eventify</Text>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  selectedMenuItem === item.id && styles.selectedMenuItem,
                ]}
                onPress={() => handleMenuItemPress(item.id)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.menuText,
                    selectedMenuItem === item.id && styles.selectedMenuText,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            transform: [{ translateX: contentTranslateX }],
          },
        ]}
      >
        {/* Header */}
        <LinearGradient
          colors={['#1a237e', '#3949ab']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleMenu}
          >
            <View style={styles.hamburger}>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* Content Area */}
        <ScrollView style={styles.contentArea}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              {getGreeting()}{isRegistered && userName ? `, ${userName}` : ''}! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Welcome to Gendering AI Conference 2025
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Registration')}
            >
              <LinearGradient
                colors={['#00bcd4', '#0097a7']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📝</Text>
                <Text style={styles.actionTitle}>
                  {isRegistered ? 'Update Registration' : 'Register Now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Agenda')}
            >
              <LinearGradient
                colors={['#4caf50', '#388e3c']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={styles.actionTitle}>View Agenda</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <Text style={styles.activityTime}>08:00 AM</Text>
              <Text style={styles.activityTitle}>Registration Opens</Text>
              <Text style={styles.activityDescription}>
                Welcome and registration for all participants
              </Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityTime}>09:00 AM</Text>
              <Text style={styles.activityTitle}>Welcome and Beyond</Text>
              <Text style={styles.activityDescription}>
                Opening keynote by Dr. Sarah Johnson
              </Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityTime}>09:10 AM</Text>
              <Text style={styles.activityTitle}>What is Play in AI?</Text>
              <Text style={styles.activityDescription}>
                Exploring creative approaches to AI development
              </Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityTime}>10:00 AM</Text>
              <Text style={styles.activityTitle}>Real-time Construction</Text>
              <Text style={styles.activityDescription}>
                Building AI systems with feminist perspectives
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: height,
    zIndex: 1000,
  },
  drawerGradient: {
    flex: 1,
    paddingTop: 50,
  },
  drawerHeader: {
    alignItems: 'center',
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  drawerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  drawerLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  drawerAppName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedMenuItem: {
    backgroundColor: '#1a237e',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  selectedMenuText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 10,
  },
  hamburger: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  contentArea: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#1a237e',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default ModernHomeScreen;
