import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  Title,
  Paragraph,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../theme/theme';

const RegistrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkExistingRegistration();
  }, []);

  const checkExistingRegistration = async () => {
    try {
      const userData = await AsyncStorage.getItem('conference-user');
      if (userData) {
        const user = JSON.parse(userData);
        setFormData({
          fullName: user.name || '',
          email: user.email || '',
          organization: user.organization || '',
          bio: user.bio || '',
        });
        setIsRegistered(true);
      }
    } catch (error) {
      console.error('Error checking existing registration:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      showSnackbar('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      showSnackbar('Please enter your email address');
      return false;
    }
    if (!formData.email.includes('@')) {
      showSnackbar('Please enter a valid email address');
      return false;
    }
    if (!formData.organization.trim()) {
      showSnackbar('Please enter your organization');
      return false;
    }
    if (!formData.bio.trim()) {
      showSnackbar('Please enter your professional bio');
      return false;
    }
    if (formData.bio.length < 50) {
      showSnackbar('Please provide a more detailed bio (at least 50 characters)');
      return false;
    }
    return true;
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        organization: formData.organization.trim(),
        bio: formData.bio.trim(),
        registrationDate: new Date().toISOString(),
        participantId: 'CONF_' + Date.now(),
      };

      // Save to local storage
      await AsyncStorage.setItem('conference-user', JSON.stringify(userData));

      // Simulate API call (replace with actual API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSnackbar('Registration successful! Welcome to the conference!');
      setIsRegistered(true);

      // Navigate to agenda after successful registration
      setTimeout(() => {
        navigation.navigate('Agenda');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      showSnackbar('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        organization: formData.organization.trim(),
        bio: formData.bio.trim(),
        registrationDate: new Date().toISOString(),
        participantId: 'CONF_' + Date.now(),
      };

      await AsyncStorage.setItem('conference-user', JSON.stringify(userData));
      showSnackbar('Registration updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      showSnackbar('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>
              {isRegistered ? 'Update Registration' : 'Conference Registration'}
            </Title>
            <Paragraph style={styles.subtitle}>
              {isRegistered 
                ? 'Update your conference registration details below.'
                : 'Please fill out the form below to register for the Gendering AI Conference 2025.'
              }
            </Paragraph>

            <TextInput
              label="Full Name *"
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              style={styles.input}
              mode="outlined"
              disabled={loading}
            />

            <TextInput
              label="Email Address *"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
            />

            <TextInput
              label="Organization/Institution *"
              value={formData.organization}
              onChangeText={(text) => handleInputChange('organization', text)}
              style={styles.input}
              mode="outlined"
              disabled={loading}
            />

            <TextInput
              label="Professional Bio *"
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Tell us about yourself and your work in AI/Gender studies... (minimum 50 characters)"
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={isRegistered ? handleUpdate : handleSubmit}
              style={styles.submitButton}
              disabled={loading}
              contentStyle={styles.buttonContent}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                isRegistered ? 'Update Registration' : 'Register for Conference'
              )}
            </Button>

            {isRegistered && (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Agenda')}
                style={styles.continueButton}
                disabled={loading}
              >
                Continue to Agenda
              </Button>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Registration Benefits</Title>
            <Paragraph style={styles.infoText}>
              • Access to all conference sessions and workshops{'\n'}
              • Personal schedule management{'\n'}
              • Session reminders and notifications{'\n'}
              • Networking opportunities{'\n'}
              • Conference materials and resources
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
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
  card: {
    margin: spacing.md,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  submitButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  continueButton: {
    marginTop: spacing.md,
    borderColor: colors.primary,
  },
  infoCard: {
    margin: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.lightGray,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  snackbar: {
    backgroundColor: colors.primary,
  },
});

export default RegistrationScreen;
