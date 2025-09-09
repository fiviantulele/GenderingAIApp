import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  IconButton,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme/theme';

const SessionDetailScreen = ({ route, navigation }) => {
  const { session } = route.params;
  const [isInSchedule, setIsInSchedule] = useState(false);
  const [mySchedule, setMySchedule] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkRegistrationStatus();
    loadMySchedule();
    checkIfInSchedule();
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

  const checkIfInSchedule = () => {
    const inSchedule = mySchedule.some(s => s.id === session.id);
    setIsInSchedule(inSchedule);
  };

  useEffect(() => {
    checkIfInSchedule();
  }, [mySchedule]);

  const addToSchedule = async () => {
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

    try {
      const newSession = {
        ...session,
        timestamp: new Date(session.datetime || `${session.date} ${session.time.split(' - ')[0]}`).getTime(),
        dateAdded: new Date().toISOString(),
      };

      const updatedSchedule = [...mySchedule, newSession];
      await AsyncStorage.setItem('conference-schedule', JSON.stringify(updatedSchedule));
      setMySchedule(updatedSchedule);
      setIsInSchedule(true);
      
      Alert.alert('Success', `"${session.title}" has been added to your schedule!`);
    } catch (error) {
      console.error('Error adding to schedule:', error);
      Alert.alert('Error', 'Failed to add session to schedule. Please try again.');
    }
  };

  const removeFromSchedule = async () => {
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
              const updatedSchedule = mySchedule.filter(s => s.id !== session.id);
              await AsyncStorage.setItem('conference-schedule', JSON.stringify(updatedSchedule));
              setMySchedule(updatedSchedule);
              setIsInSchedule(false);
              Alert.alert('Success', 'Session removed from your schedule.');
            } catch (error) {
              console.error('Error removing from schedule:', error);
              Alert.alert('Error', 'Failed to remove session. Please try again.');
            }
          }
        }
      ]
    );
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

  const getTimeUntilEvent = () => {
    if (!session.timestamp) return null;
    
    const now = new Date().getTime();
    const timeLeft = session.timestamp - now;
    
    if (timeLeft <= 0) return 'Event has passed';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours, ${minutes} minutes`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.sessionCard}>
        <Card.Content>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionInfo}>
              <View style={styles.sessionTimeContainer}>
                <Paragraph style={styles.sessionTime}>
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
              <Title style={styles.sessionTitle}>
                {session.title}
              </Title>
              {session.speaker && (
                <Paragraph style={styles.sessionSpeaker}>
                  Speaker: {session.speaker}
                </Paragraph>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.sessionDetails}>
            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Duration:</Paragraph>
              <Paragraph style={styles.detailValue}>{session.duration} minutes</Paragraph>
            </View>
            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Venue:</Paragraph>
              <Paragraph style={styles.detailValue}>{session.venue}</Paragraph>
            </View>
            {session.date && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Date:</Paragraph>
                <Paragraph style={styles.detailValue}>{session.date}</Paragraph>
              </View>
            )}
          </View>

          {session.timestamp && (
            <Card style={styles.countdownCard}>
              <Card.Content>
                <Title style={styles.countdownTitle}>Time Until Event</Title>
                <Paragraph style={styles.countdownText}>
                  {getTimeUntilEvent()}
                </Paragraph>
              </Card.Content>
            </Card>
          )}

          <View style={styles.actionButtons}>
            {isInSchedule ? (
              <Button
                mode="outlined"
                onPress={removeFromSchedule}
                style={styles.removeButton}
                icon="delete"
              >
                Remove from Schedule
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={addToSchedule}
                style={styles.addButton}
                icon="plus"
                disabled={!isRegistered}
              >
                Add to Schedule
              </Button>
            )}
          </View>

          {!isRegistered && (
            <Card style={styles.alertCard}>
              <Card.Content>
                <Paragraph style={styles.alertText}>
                  Please complete your registration to add sessions to your schedule.
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
          )}
        </Card.Content>
      </Card>

      <Card style={styles.descriptionCard}>
        <Card.Content>
          <Title style={styles.descriptionTitle}>Session Description</Title>
          <Paragraph style={styles.descriptionText}>
            {session.description || 
              `This ${session.type.toLowerCase()} session is part of the Gendering AI Conference 2025. ` +
              `Join us for an engaging discussion on ${session.title.toLowerCase()}. ` +
              `This session will be led by ${session.speaker} and will last approximately ${session.duration} minutes.`
            }
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.venueCard}>
        <Card.Content>
          <Title style={styles.venueTitle}>Venue Information</Title>
          <Paragraph style={styles.venueText}>
            <Paragraph style={styles.venueLabel}>Location: </Paragraph>
            {session.venue}
          </Paragraph>
          <Paragraph style={styles.venueText}>
            <Paragraph style={styles.venueLabel}>Conference Venue: </Paragraph>
            Mövenpick Hotel and Residence Nairobi, Kenya
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sessionCard: {
    margin: spacing.md,
    elevation: 4,
  },
  sessionHeader: {
    marginBottom: spacing.md,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginRight: spacing.sm,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  sessionSpeaker: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  sessionDetails: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  countdownCard: {
    backgroundColor: colors.info,
    marginBottom: spacing.lg,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  countdownText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  actionButtons: {
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  removeButton: {
    borderColor: colors.error,
  },
  alertCard: {
    backgroundColor: colors.warning,
    marginTop: spacing.md,
  },
  alertText: {
    fontSize: 14,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: colors.white,
  },
  descriptionCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  venueCard: {
    margin: spacing.md,
    marginTop: 0,
    backgroundColor: colors.lightGray,
  },
  venueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  venueText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  venueLabel: {
    fontWeight: '600',
    color: colors.primary,
  },
});

export default SessionDetailScreen;
