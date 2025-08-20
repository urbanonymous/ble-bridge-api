import * as TaskManager from 'expo-task-manager';
import * as BackgroundActions from 'expo-foreground-actions';
// Import your services (use with caution in background tasks - see notes)
// import proxyServiceInstance from '../services/ProxyService';

const BACKGROUND_TASK_NAME = 'ble-websocket-proxy-task';

// Define the structure of the task parameters
interface BackgroundTaskParams {
  data: any; // Replace 'any' with a specific type if you pass parameters
  error: Error | null;
}

let isTaskRunning = false; // Simple flag to prevent multiple concurrent executions

// Define the background task
TaskManager.defineTask(BACKGROUND_TASK_NAME, async (params: BackgroundTaskParams) => { // Apply the interface here
  const { data, error } = params; // Destructure after type assertion
  if (error) {
    console.error('Background task error:', error);
    // Consider stopping the task or attempting recovery
    await BackgroundActions.stop();
    return;
  }

  if (isTaskRunning) {
    console.log('Background task already running, skipping new invocation.');
    return;
  }
  isTaskRunning = true;
  console.log('Background task started...');

  // --- IMPORTANT NOTES ---
  // 1. Service Instances: Using singleton instances directly might be problematic
  //    if the main app process is killed and restarted. State might be lost.
  //    Consider re-initializing or using a more robust state persistence mechanism.
  // 2. Long-Running Operations: Ensure operations don't block the task thread for too long.
  //    Use async/await appropriately.
  // 3. Error Handling: Implement robust error handling within the task.
  // 4. State Synchronization: If the UI needs to reflect background state,
  //    implement a mechanism (e.g., event emitters, shared storage) for communication.
  // -----------------------

  try {
    // Example: Start the proxy service (if not already running)
    // This is a simplified approach. A real implementation needs to handle
    // state persistence and potentially re-establish connections if the task restarts.
    console.log('(Background Task) Checking Proxy Service...');
    // await proxyServiceInstance.start(); // Be careful with singleton state

    // Keep the task alive - Perform periodic checks or wait for events
    // For example, check connection statuses periodically
    await new Promise<void>(resolve => {
        const intervalId = setInterval(() => {
            console.log('(Background Task) Still running...');
            // Check if BackgroundActions.isTaskRunning() is still true? Or rely on stop() call.
            // Add checks for BLE/WS connection status from ProxyService if accessible
            if (!BackgroundActions.isTaskRunning()) { // Example check
                console.log('(Background Task) Task externally stopped, cleaning up interval.');
                clearInterval(intervalId);
                resolve();
            }
        }, 30000); // Log every 30 seconds

        // Listen for a stop event (if BackgroundActions provides one)
        // Or rely on the stop function being called externally.
    });

  } catch (err: any) {
    console.error('(Background Task) Error during execution:', err);
    // Attempt to stop the background actions on error
    await BackgroundActions.stop();
  } finally {
    console.log('(Background Task) Finishing execution run.');
    isTaskRunning = false;
    // The task definition should ideally run again if needed and not stopped.
  }
});

// Function to start the background actions task
export const startBackgroundActions = async () => {
  try {
    // --- Optional: Background Location ---
    // Request background location permissions (can help keep app alive on Android)
    // const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    // if (backgroundStatus !== 'granted') {
    //   console.warn('Background location permission not granted, background task might be less reliable.');
    // }
    // --------------------------------------

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    if (!isRegistered) {
        console.warn(`Task ${BACKGROUND_TASK_NAME} is not registered! This should not happen if defineTask ran.`);
    }

    await BackgroundActions.startAsync({
      taskName: BACKGROUND_TASK_NAME,
      taskTitle: 'BLE Bridge Active',
      taskDesc: 'Relaying data between BLE device and server.',
      taskIcon: {
        name: 'ic_launcher', // Default Android launcher icon
        type: 'mipmap',
      },
      linkingURI: 'yourappscheme://', // Optional: Deep link back to your app
      parameters: {
      },
    });
    console.log('Background actions task started via startAsync');
  } catch (error) {
    console.error('Failed to start background actions task:', error);
    throw error; // Re-throw to indicate failure
  }
};

export const stopBackgroundActions = async () => {
  try {
    console.log('Stopping background actions task...');
    await BackgroundActions.stop();
    console.log('Background actions task stopped.');
  } catch (error) {
    console.error('Failed to stop background actions task:', error);
  }
}; 