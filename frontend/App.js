import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Screen from './App/components/Screen';
import { persistor, store } from './App/redux/store';
import MainStackNavigator from './App/navigation/StackNavigator';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from './App/navigation/components/DrawerContent';
import { HelperProvider } from './App/contexts/helper';
import { BackPressProvider } from './App/contexts/BackPress';

import * as Sentry from '@sentry/react-native';
import ErrorBoundary from './App/components/ErrorBoundary';

const Drawer = createDrawerNavigator();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: true,
});

function App() {
  return (
    <Screen>
      <ErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NavigationContainer>
              <HelperProvider>
                <BackPressProvider>
                  <Drawer.Navigator
                    drawerContent={(props) => <DrawerContent {...props} />}
                    screenOptions={{
                      headerShown: false,
                      swipeEnabled: false,
                    }}
                  >
                    <Drawer.Screen name="Drawer" component={MainStackNavigator} />
                  </Drawer.Navigator>
                </BackPressProvider>
              </HelperProvider>
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </Screen>
  );
}

export default Sentry.wrap(App);
