import React, { useState } from "react";
import { Image, ImageProps, StyleSheet, View } from "react-native";
import { Skeleton } from "./Skeleton";

export function SkeletonImage(props: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[props.style, styles.clip]}>
      <Image
        {...props}
        style={StyleSheet.absoluteFill}
        onLoad={(e) => {
          setLoaded(true);
          props.onLoad?.(e);
        }}
      />
      {!loaded && <Skeleton style={StyleSheet.absoluteFill} />}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
});
