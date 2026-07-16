import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Must be registered before AppRegistry.registerComponent — handles data
// messages received while the app is backgrounded or fully killed.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[push] background message', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
