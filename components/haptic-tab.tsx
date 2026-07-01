import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        ReactNativeHapticFeedback.trigger('impactLight');
        props.onPressIn?.(ev);
      }}
    />
  );
}
