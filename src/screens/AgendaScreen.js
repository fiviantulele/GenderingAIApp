import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  Badge,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme/theme';
import { agendaData } from '../data/conferenceData';

const AgendaScreen = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState('day1');
  const [mySchedule, setMySchedule] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkRegistrationStatus();
    loadMySchedule();
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

  const isSessionInSchedule = (sessionId) => {
    return mySchedule.some(session => session.id === sessionId);
  };

  const addToSchedule = async (session) => {
    if (!isRegistered) {
      Alert.alert(
        'Registration Required',
        'Please complete your registration before adding sessions to your schedule.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Register Now', onPress: () => navigation.navigate('Registration') }
        ]
      );
      return;
    }

    if (isSessionInSchedule(session.id)) {
      Alert.alert('Session Already Added', 'This session is already in your schedule!');
      return;
    }

    try {
      const newSession = {
        ...session,
        timestamp: new Date(session.datetime || `${agendaData[selectedDay].date} ${session.time.split(' - ')[0]}`).getTime(),
        dateAdded: new Date().toISOString(),
      };

      const updatedSchedule = [...mySchedule, newSession];
      await AsyncStorage.setItem('conference-schedule', JSON.stringify(updatedSchedule));
      setMySchedule(updatedSchedule);
      
      Alert.alert('Success', `"${session.title}" has been added to your schedule!`);
    } catch (error) {
      console.error('Error adding to schedule:', error);
      Alert.alert('Error', 'Failed to add session to schedule. Please try again.');
    }
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

  const renderSession = (session) => {
    const isInSchedule = isSessionInSchedule(session.id);
    const isBreak = session.type === 'Break';

    return (
      <Card key={session.id} style={[styles.sessionCard, isBreak && styles.breakCard]}>
        <Card.Content>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionTimeContainer}>
              <Paragraph style={[styles.sessionTime, isBreak && styles.breakText]}>
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
            <Badge
              visible={isInSchedule}
              style={styles.badge}
            >
              ✓
            </Badge>
          </View>

          <Title style={[styles.sessionTitle, isBreak && styles.breakText]}>
            {session.title}
          </Title>

          {session.speaker && (
            <Paragraph style={[styles.sessionSpeaker, isBreak && styles.breakText]}>
              Speaker: {session.speaker}
            </Paragraph>
          )}

          <View style={styles.sessionDetails}>
            <Paragraph style={[styles.sessionDetail, isBreak && styles.breakText]}>
              Duration: {session.duration} min
            </Paragraph>
            <Paragraph style={[styles.sessionDetail, isBreak && styles.breakText]}>
              Venue: {session.venue}
            </Paragraph>
          </View>

          {!isBreak && (
            <Button
              mode={isInSchedule ? "outlined" : "contained"}
              onPress={() => addToSchedule(session)}
              style={[
                styles.addButton,
                isInSchedule && styles.addedButton
              ]}
              disabled={isInSchedule}
            >
              {isInSchedule ? 'Added to Schedule' : 'Add to Schedule'}
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderDayTabs = () => {
    const days = [
      { id: 'day1', label: 'Day 1', date: 'Aug 20' },
      { id: 'day2', label: 'Day 2', date: 'Aug 21' },
      { id: 'day3', label: 'Day 3', date: 'Aug 22' },
    ];

    return (
      <View style={styles.tabContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.tab,
              selectedDay === day.id && styles.activeTab
            ]}
            onPress={() => setSelectedDay(day.id)}
          >
            <Paragraph style={[
              styles.tabText,
              selectedDay === day.id && styles.activeTabText
            ]}>
              {day.label}
            </Paragraph>
            <Paragraph style={[
              styles.tabDate,
              selectedDay === day.id && styles.activeTabDate
            ]}>
              {day.date}
            </Paragraph>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const currentDayData = agendaData[selectedDay];

  return (
    <View style={styles.container}>
      {renderDayTabs()}
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.themeCard}>
          <Card.Content>
            <Title style={styles.themeTitle}>
              {currentDayData.theme}
            </Title>
            <Paragraph style={styles.themeDescription}>
              {currentDayData.description}
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.sessionsContainer}>
          {currentDayData.sessions.map(renderSession)}
        </View>

        <View style={styles.scheduleInfo}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title style={styles.infoTitle}>My Schedule</Title>
              <Paragraph style={styles.infoText}>
                You have {mySchedule.length} session{mySchedule.length !== 1 ? 's' : ''} in your personal schedule.
              </Paragraph>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Schedule')}
                style={styles.viewScheduleButton}
              >
                View My Schedule
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeTabDate: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  themeCard: {
    margin: spacing.md,
    backgroundColor: colors.primary,
  },
  themeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  themeDescription: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  sessionsContainer: {
    padding: spacing.md,
  },
  sessionCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  breakCard: {
    backgroundColor: colors.warning,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  sessionTimeContainer: {
    flex: 1,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  breakText: {
    color: colors.white,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.success,
    color: colors.white,
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
    marginBottom: spacing.md,
  },
  sessionDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  addedButton: {
    borderColor: colors.success,
  },
  scheduleInfo: {
    padding: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.lightGray,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  viewScheduleButton: {
    borderColor: colors.primary,
  },
});

export default AgendaScreen;
