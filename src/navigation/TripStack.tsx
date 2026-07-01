import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripsIndex from '../../app/(tabs)/trips/index';
import CreateTrip from '../../app/(tabs)/trips/create';
import TripDetail from '../../app/(tabs)/trips/[id]/index';

export type TripStackParams = {
  TripsList: undefined;
  CreateTrip: undefined;
  TripDetail: { id: string };
};

const Stack = createNativeStackNavigator<TripStackParams>();

export default function TripStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripsList" component={TripsIndex} />
      <Stack.Screen name="CreateTrip" component={CreateTrip} />
      <Stack.Screen name="TripDetail" component={TripDetail} />
    </Stack.Navigator>
  );
}
