import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6366f1',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export const statusStyles = StyleSheet.create({
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
});

export const scanStyles = StyleSheet.create({
  scanHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  scanButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  scanButtonStart: {
    backgroundColor: '#10b981',
  },
  scanButtonStop: {
    backgroundColor: '#f59e0b',
  },
  scanButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  devicesList: {
    marginTop: 8,
  },
  devicesFoundText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '500',
  },
});

export const deviceStyles = StyleSheet.create({
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  deviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  deviceMeta: {
    alignItems: 'flex-end',
  },
  signalStrength: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rssiText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  deviceCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tapToConnect: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export const connectedDeviceStyles = StyleSheet.create({
  connectedDeviceInfo: {
    marginBottom: 16,
  },
  connectedDeviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  connectedDeviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  connectedDeviceId: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export const characteristicsStyles = StyleSheet.create({
  characteristicsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  characteristicsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  characteristicsList: {
    gap: 8,
  },
  characteristicCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  characteristicUuid: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
    marginBottom: 8,
  },
  characteristicProperties: {
    flexDirection: 'row',
    gap: 6,
  },
  propertyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  propertyActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  propertyText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  propertyTextActive: {
    color: '#1d4ed8',
  },
});

export const notificationStyles = StyleSheet.create({
  notificationCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  notificationSuccess: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  notificationError: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  notificationInfo: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  notificationIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  notificationClose: {
    padding: 4,
    marginLeft: 8,
  },
  notificationCloseText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
});
