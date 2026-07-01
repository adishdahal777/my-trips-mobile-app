import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

// Screens nested inside Main's tabs/stacks — flat pushes need the full nested path.
const NESTED_ROUTES: Record<string, (params?: any) => { name: string; params?: any }> = {
  Dashboard: (params) => ({ name: 'Main', params: { screen: 'Dashboard', params } }),
  Trips: (params) => ({ name: 'Main', params: { screen: 'Trips', params } }),
  Explore: (params) => ({ name: 'Main', params: { screen: 'Explore', params } }),
  Profile: (params) => ({ name: 'Main', params: { screen: 'Profile', params } }),
  TripsList: (params) => ({ name: 'Main', params: { screen: 'Trips', params: { screen: 'TripsList', params } } }),
  CreateTrip: (params) => ({ name: 'Main', params: { screen: 'Trips', params: { screen: 'CreateTrip', params } } }),
  TripDetail: (params) => ({ name: 'Main', params: { screen: 'Trips', params: { screen: 'TripDetail', params } } }),
};

function resolve(screen: string, params?: Record<string, any>) {
  const nested = NESTED_ROUTES[screen];
  return nested ? nested(params) : { name: screen, params };
}

export const router = {
  push: (screen: string, params?: Record<string, any>) => {
    if (navigationRef.isReady()) {
      const target = resolve(screen, params);
      navigationRef.navigate(target.name as any, target.params as any);
    }
  },
  replace: (screen: string, params?: Record<string, any>) => {
    if (navigationRef.isReady()) {
      const target = resolve(screen, params);
      navigationRef.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: target.name, params: target.params }] })
      );
    }
  },
  back: () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },
};
