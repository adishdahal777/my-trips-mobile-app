import React, { useState } from "react";
import { Image, ImageProps, StyleSheet, View } from "react-native";
import { Skeleton } from "./Skeleton";

export function SkeletonImage(props: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={props.style}>
      <Image
        {...props}
        style={[StyleSheet.absoluteFill, props.style]}
        onLoad={(e) => {
          setLoaded(true);
          props.onLoad?.(e);
        }}
      />
      {!loaded && <Skeleton style={[StyleSheet.absoluteFill, props.style]} />}
    </View>
  );
}
