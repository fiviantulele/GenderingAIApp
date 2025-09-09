import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  FAB,
  List,
  IconButton,
  Divider,
  Badge,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme/theme';

const ScheduleScreen = ({ navigation }) => {
  const [mySchedule, setMySchedule] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    checkRegistrationStatus();
    loadMySchedule();
    updateNextEvent();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('conference-user');
      setIsRegistered(!!userData);
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const loadMySchedule = async () => {
    try {
      const schedule = await AsyncStorage.getItem('conference-schedule');
      setMySchedule(schedule ? JSON.parse(schedule) : []);
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const updateNextEvent = () => {
    const now = new Date().getTime();
    const upcomingEvents = mySchedule
      .filter(session => session.timestamp > now)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    setNextEvent(upcomingEvents.length > 0 ? upcomingEvents[0] : null);
  };

  useEffect(() => {
    updateNextEvent();
  }, [mySchedule]);

  const removeFromSchedule = async (sessionId) => {
    Alert.alert(
      'Remove Session',
      'Are you sure you want to remove this session from your schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedSchedule = mySchedule.filter(session => session.id !== sessionId);
              await AsyncStorage.setItem('conference-schedule', JSON.stringify(updatedSchedule));
              setMySchedule(updatedSchedule);
            } catch (error) {
              console.error('Error removing from schedule:', error);
              Alert.alert('Error', 'Failed to remove session. Please try again.');
            }
          }
        }
      ]
    );
  };

  const clearAllSessions = () => {
    if (mySchedule.length === 0) {
      Alert.alert('No Sessions', 'Your schedule is already empty.');
      return;
    }

    Alert.alert(
      'Clear All Sessions',
      'Are you sure you want to remove all sessions from your schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('conference-schedule');
              setMySchedule([]);
              Alert.alert('Success', 'All sessions have been cleared from your schedule.');
            } catch (error) {
              console.error('Error clearing schedule:', error);
              Alert.alert('Error', 'Failed to clear schedule. Please try again.');
            }
          }
        }
      ]
    );
  };

  const shareSchedule = async () => {
    if (mySchedule.length === 0) {
      Alert.alert('No Sessions', 'Your schedule is empty. Add some sessions first!');
      return;
    }

    try {
      const scheduleText = mySchedule
        .map((session, index) => 
          `${index + 1}. ${session.title}\n   Time: ${session.time}\n   Speaker: ${session.speaker}\n   Venue: ${session.venue}\n`
        )
        .join('\n');

      const message = `My Gendering AI Conference 2025 Schedule:\n\n${scheduleText}`;
      
      await Share.share({
        message,
        title: 'My Conference Schedule',
      });
    } catch (error) {
      console.error('Error sharing schedule:', error);
      Alert.alert('Error', 'Failed to share schedule. Please try again.');
    }
  };

  const getTimeUntilEvent = (timestamp) => {
    const now = new Date().getTime();
    const timeLeft = timestamp - now;
    
    if (timeLeft <= 0) return 'Event has passed';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getSessionTypeColor = (type) => {
    const colors = {
      'Keynote': '#1a237e',
      'Panel': '#3949ab',
      'Workshop': '#00bcd4',
      'Lightning Talk': '#ff9800',
      'Light Talk': '#ff9800',
      'Expert Talk': '#9c27b0',
      'Expert Session': '#9c27b0',
      'Showcase': '#4caf50',
      'Special Event': '#e91e63',
      'Break': '#757575',
      'Opening': '#1a237e',
      'Closing': '#1a237e',
      'Conversation': '#ff5722',
    };
    return colors[type] || '#666666';
  };

  const renderNextEvent = () => {
    if (!nextEvent) return null;

    return (
      <Card style={styles.nextEventCard}>
        <Card.Content>
          <View style={styles.nextEventHeader}>
            <Title style={styles.nextEventTitle}>🎯 Next Event</Title>
            <Chip
              style={[
                styles.nextEventChip,
                { backgroundColor: getSessionTypeColor(nextEvent.type) }
              ]}
              textStyle={styles.chipText}
            >
              {nextEvent.type}
            </Chip>
          </View>
          <Title style={styles.nextEventSessionTitle}>{nextEvent.title}</Title>
          <Paragraph style={styles.nextEventTime}>{nextEvent.time}</Paragraph>
          <Paragraph style={styles.nextEventSpeaker}>Speaker: {nextEvent.speaker}</Paragraph>
          <Paragraph style={styles.nextEventVenue}>Venue: {nextEvent.venue}</Paragraph>
          <View style={styles.countdownContainer}>
            <Paragraph style={styles.countdownText}>
              Time Remaining: {getTimeUntilEvent(nextEvent.timestamp)}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderSession = (session, index) => {
    const isPast = session.timestamp < new Date().getTime();
    
    return (
      <Card key={session.id} style={[styles.sessionCard, isPast && styles.pastSessionCard]}>
        <Card.Content>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionInfo}>
              <View style={styles.sessionTimeContainer}>
                <Paragraph style={[styles.sessionTime, isPast && styles.pastText]}>
                  {session.time}
                </Paragraph>
                <Chip
                  style={[
                    styles.typeChip,
                    { backgroundColor: getSessionTypeColor(session.type) }
                  ]}
                  textStyle={styles.chipText}
                >
                  {session.type}
                </Chip>
              </View>
              <Title style={[styles.sessionTitle, isPast && styles.pastText]}>
                {session.title}
              </Title>
              <Paragraph style={[styles.sessionSpeaker, isPast && styles.pastText]}>
                Speaker: {session.speaker}
              </Paragraph>
              <View style={styles.sessionDetails}>
                <Paragraph style={[styles.sessionDetail, isPast && styles.pastText]}>
                  Duration: {session.duration} min
                </Paragraph>
                <Paragraph style={[styles.sessionDetail, isPast && styles.pastText]}>
                  Venue: {session.venue}
                </Paragraph>
              </View>
            </View>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => removeFromSchedule(session.id)}
              style={styles.deleteButton}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (!isRegistered) {
    return (
      <View style={styles.container}>
        <Card style={styles.alertCard}>
          <Card.Content>
            <Title style={styles.alertTitle}>Registration Required</Title>
            <Paragraph style={styles.alertText}>
              Please complete your registration to access your personal schedule.
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Registration')}
              style={styles.registerButton}
            >
              Register Now
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderNextEvent()}
        
        <Card style={styles.scheduleHeaderCard}>
          <Card.Content>
            <View style={styles.scheduleHeader}>
              <View>
                <Title style={styles.scheduleTitle}>My Schedule</Title>
                <Paragraph style={styles.scheduleSubtitle}>
                  {mySchedule.length} session{mySchedule.length !== 1 ? 's' : ''} scheduled
                </Paragraph>
              </View>
              {mySchedule.length > 0 && (
                <View style={styles.headerActions}>
                  <IconButton
                    icon="share"
                    size={20}
                    onPress={shareSchedule}
                    style={styles.actionButton}
                  />
                  <IconButton
                    icon="delete-sweep"
                    size={20}
                    onPress={clearAllSessions}
                    style={styles.actionButton}
                  />
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {mySchedule.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title style={styles.emptyTitle}>No Sessions Scheduled</Title>
              <Paragraph style={styles.emptyText}>
                Your selected sessions will appear here. Visit the Agenda page to add sessions to your personal schedule.
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Agenda')}
                style={styles.browseButton}
              >
                Browse Agenda
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.sessionsContainer}>
            {mySchedule
              .sort((a, b) => a.timestamp - b.timestamp)
              .map(renderSession)
            }
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Agenda')}
        label="Add Sessions"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  nextEventCard: {
    margin: spacing.md,
    backgroundColor: colors.success,
  },
  nextEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nextEventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  nextEventChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  nextEventSessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  nextEventTime: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  nextEventSpeaker: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  nextEventVenue: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  countdownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.sm,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  scheduleHeaderCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scheduleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    margin: 0,
  },
  emptyCard: {
    margin: spacing.md,
    backgroundColor: colors.lightGray,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: colors.primary,
  },
  sessionsContainer: {
    padding: spacing.md,
  },
  sessionCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  pastSessionCard: {
    opacity: 0.6,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: spacing.sm,
  },
  pastText: {
    color: colors.textSecondary,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  sessionSpeaker: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteButton: {
    margin: 0,
  },
  alertCard: {
    margin: spacing.md,
    backgroundColor: colors.warning,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  alertText: {
    fontSize: 14,
    color: colors.white,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  registerButton: {
    backgroundColor: colors.white,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default ScheduleScreen;
