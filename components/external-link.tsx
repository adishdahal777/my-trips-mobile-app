import { Linking, Pressable, type PressableProps } from 'react-native';

type Props = PressableProps & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      onPress={async () => {
        await Linking.openURL(href);
      }}
    />
  );
}
