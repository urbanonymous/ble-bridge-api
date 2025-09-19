import { useState, useRef } from 'react';
import { Animated } from 'react-native';

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

export const useNotifications = () => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'success',
    visible: false
  });
  const slideAnim = useRef(new Animated.Value(100)).current;

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
    
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      hideNotification();
    }, 3000);
  };

  const hideNotification = () => {
    Animated.spring(slideAnim, {
      toValue: 100,
      useNativeDriver: true,
    }).start(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    });
  };

  return {
    notification,
    slideAnim,
    showNotification,
    hideNotification
  };
};
