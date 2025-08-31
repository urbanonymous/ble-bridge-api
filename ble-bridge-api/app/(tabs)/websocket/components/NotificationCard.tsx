import React from 'react';
import { TouchableOpacity, View, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { NotificationState } from '../hooks/useNotifications';
import { notificationStyles } from '../styles';

interface NotificationCardProps {
  notification: NotificationState;
  slideAnim: Animated.Value;
  onClose: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  slideAnim,
  onClose
}) => {
  if (!notification.visible) return null;

  return (
    <Animated.View 
      style={[
        notificationStyles.notificationCard,
        notification.type === 'success' && notificationStyles.notificationSuccess,
        notification.type === 'error' && notificationStyles.notificationError,
        notification.type === 'info' && notificationStyles.notificationInfo,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={notificationStyles.notificationContent}>
        <ThemedText style={notificationStyles.notificationIcon}>
          {notification.type === 'success' ? '✅' : 
           notification.type === 'error' ? '❌' : 'ℹ️'}
        </ThemedText>
        <ThemedText style={notificationStyles.notificationText}>
          {notification.message}
        </ThemedText>
        <TouchableOpacity onPress={onClose} style={notificationStyles.notificationClose}>
          <ThemedText style={notificationStyles.notificationCloseText}>✕</ThemedText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
