import { useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type MotionPressableProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode | ((state: PressableStateCallbackType) => ReactNode);
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
};

export function MotionPressable({
  children,
  containerStyle,
  disabled,
  onPressIn,
  onPressOut,
  scaleTo = 0.985,
  style,
  ...rest
}: MotionPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animateScale(toValue: number) {
    Animated.spring(scale, {
      toValue,
      speed: 24,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  }

  function handlePressIn(event: GestureResponderEvent) {
    if (!disabled) {
      animateScale(scaleTo);
    }

    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    animateScale(1);
    onPressOut?.(event);
  }

  return (
    <Pressable
      {...rest}
      style={containerStyle}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {(state) => (
        <Animated.View
          style={[
            typeof style === "function" ? style(state) : style,
            { transform: [{ scale }] },
          ]}
        >
          {typeof children === "function" ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
