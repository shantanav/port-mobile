// Similarily to the DrawerLayout component this deserves to be put in a
// separate repo. Although, keeping it here for the time being will allow us to
// move faster and fix possible issues quicker

import * as React from 'react';
import {Component} from 'react';
import {
  Animated,
  I18nManager,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {
  GestureEvent,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  PanGestureHandlerProps,
  State,
  TapGestureHandler,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

const DRAG_TOSS = 0.05;

type SwipeableExcludes = Exclude<
  keyof PanGestureHandlerProps,
  'onGestureEvent' | 'onHandlerStateChange'
>;

// Animated.AnimatedInterpolation has been converted to a generic type
// in @types/react-native 0.70. This way we can maintain compatibility
// with all versions of @types/react-native
type AnimatedInterpolation = ReturnType<Animated.Value['interpolate']>;

export interface SwipeableProps
  extends Pick<PanGestureHandlerProps, SwipeableExcludes> {
  /**
   * Enables two-finger gestures on supported devices, for example iPads with
   * trackpads. If not enabled the gesture will require click + drag, with
   * `enableTrackpadTwoFingerGesture` swiping with two fingers will also trigger
   * the gesture.
   */
  enableTrackpadTwoFingerGesture?: boolean;

  /**
   * Specifies how much the visual interaction will be delayed compared to the
   * gesture distance. e.g. value of 1 will indicate that the swipeable panel
   * should exactly follow the gesture, 2 means it is going to be two times
   * "slower".
   */
  friction?: number;

  /**
   * Distance from the left edge at which released panel will animate to the
   * open state (or the open panel will animate into the closed state). By
   * default it's a half of the panel's width.
   */
  leftThreshold?: number;
  leftTrigger?: number;

  /**
   * Distance from the right edge at which released panel will animate to the
   * open state (or the open panel will animate into the closed state). By
   * default it's a half of the panel's width.
   */
  rightThreshold?: number;

  /**
   * Distance that the panel must be dragged from the left edge to be considered
   * a swipe. The default value is 10.
   */
  dragOffsetFromLeftEdge?: number;

  /**
   * Distance that the panel must be dragged from the right edge to be considered
   * a swipe. The default value is 10.
   */
  dragOffsetFromRightEdge?: number;

  /**
   * Value indicating if the swipeable panel can be pulled further than the left
   * actions panel's width. It is set to true by default as long as the left
   * panel render method is present.
   */
  overshootLeft?: boolean;

  /**
   * Value indicating if the swipeable panel can be pulled further than the
   * right actions panel's width. It is set to true by default as long as the
   * right panel render method is present.
   */
  overshootRight?: boolean;

  /**
   * Specifies how much the visual interaction will be delayed compared to the
   * gesture distance at overshoot. Default value is 1, it mean no friction, for
   * a native feel, try 8 or above.
   */
  overshootFriction?: number;

  /**
   * @deprecated Use `direction` argument of onSwipeableOpen()
   *
   * Called when left action panel gets open.
   */
  onSwipeableLeftOpen?: () => void;

  /**
   * @deprecated Use `direction` argument of onSwipeableOpen()
   *
   * Called when right action panel gets open.
   */
  onSwipeableRightOpen?: () => void;

  /**
   * Called when action panel gets open (either right or left).
   */
  onSwipeableOpen?: (direction: 'left' | 'right', swipeable: Swipeable) => void;

  /**
   * Called when action panel is closed.
   */
  onSwipeableClose?: (
    direction: 'left' | 'right',
    swipeable: Swipeable,
  ) => void;

  /**
   * @deprecated Use `direction` argument of onSwipeableWillOpen()
   *
   * Called when left action panel starts animating on open.
   */
  onSwipeableLeftWillOpen?: () => void;

  /**
   * @deprecated Use `direction` argument of onSwipeableWillOpen()
   *
   * Called when right action panel starts animating on open.
   */
  onSwipeableRightWillOpen?: () => void;

  /**
   * Called when action panel starts animating on open (either right or left).
   */
  onSwipeableWillOpen?: (direction: 'left' | 'right') => void;

  /**
   * Called when action panel starts animating on close.
   */
  onSwipeableWillClose?: (direction: 'left' | 'right') => void;

  /**
   * Called when action panel starts being shown on dragging to open.
   */
  onSwipeableOpenStartDrag?: (direction: 'left' | 'right') => void;

  /**
   * Called when action panel starts being shown on dragging to close.
   */
  onSwipeableCloseStartDrag?: (direction: 'left' | 'right') => void;

  /**
   * Called when left trigger activates
   */
  onSwipeableLeftTrigger?: () => void;

  /**
   *
   * This map describes the values to use as inputRange for extra interpolation:
   * AnimatedValue: [startValue, endValue]
   *
   * progressAnimatedValue: [0, 1] dragAnimatedValue: [0, +]
   *
   * To support `rtl` flexbox layouts use `flexDirection` styling.
   * */
  renderLeftActions?: (
    progressAnimatedValue: AnimatedInterpolation,
    dragAnimatedValue: AnimatedInterpolation,
    swipeable: Swipeable,
  ) => React.ReactNode;
  /**
   *
   * This map describes the values to use as inputRange for extra interpolation:
   * AnimatedValue: [startValue, endValue]
   *
   * progressAnimatedValue: [0, 1] dragAnimatedValue: [0, -]
   *
   * To support `rtl` flexbox layouts use `flexDirection` styling.
   * */
  renderRightActions?: (
    progressAnimatedValue: AnimatedInterpolation,
    dragAnimatedValue: AnimatedInterpolation,
    swipeable: Swipeable,
  ) => React.ReactNode;

  useNativeAnimations?: boolean;

  animationOptions?: Record<string, unknown>;

  /**
   * Style object for the container (`Animated.View`), for example to override
   * `overflow: 'hidden'`.
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Style object for the children container (`Animated.View`), for example to
   * apply `flex: 1`
   */
  childrenContainerStyle?: StyleProp<ViewStyle>;
}

type SwipeableState = {
  dragX: Animated.Value;
  rowTranslation: Animated.Value;
  rowState: number;
  leftWidth?: number;
  rightOffset?: number;
  rowWidth?: number;
  leftTrigger?: number;
};

export default class Swipeable extends Component<
  SwipeableProps,
  SwipeableState
> {
  static defaultProps = {
    friction: 1,
    overshootFriction: 1,
    useNativeAnimations: true,
  };

  constructor(props: SwipeableProps) {
    super(props);
    const dragX = new Animated.Value(0);
    this.state = {
      dragX,
      rowTranslation: new Animated.Value(0),
      rowState: 0,
      leftWidth: undefined,
      rightOffset: undefined,
      rowWidth: undefined,
      leftTrigger: undefined,
    };
    this.updateAnimatedEvent(props, this.state);

    this.onGestureEvent = Animated.event(
      [{nativeEvent: {translationX: dragX}}],
      {useNativeDriver: props.useNativeAnimations!},
    );
  }

  shouldComponentUpdate(props: SwipeableProps, state: SwipeableState) {
    if (
      this.props.friction !== props.friction ||
      this.props.overshootLeft !== props.overshootLeft ||
      this.props.overshootRight !== props.overshootRight ||
      this.props.overshootFriction !== props.overshootFriction ||
      this.state.leftWidth !== state.leftWidth ||
      this.state.rightOffset !== state.rightOffset ||
      this.state.rowWidth !== state.rowWidth ||
      this.state.leftTrigger !== state.leftTrigger
    ) {
      this.updateAnimatedEvent(props, state);
    }

    return true;
  }

  private onGestureEvent?: (
    event: GestureEvent<PanGestureHandlerEventPayload>,
  ) => void;
  private transX?: AnimatedInterpolation;
  private showLeftAction?: AnimatedInterpolation | Animated.Value;
  private leftActionTranslate?: AnimatedInterpolation;
  private showRightAction?: AnimatedInterpolation | Animated.Value;
  private rightActionTranslate?: AnimatedInterpolation;

  private updateAnimatedEvent = (
    props: SwipeableProps,
    state: SwipeableState,
  ) => {
    const {friction, overshootFriction} = props;
    const {dragX, rowTranslation, leftWidth = 0, rowWidth = 0} = state;
    const {rightOffset = rowWidth} = state;
    const rightWidth = Math.max(0, rowWidth - rightOffset);

    const {overshootLeft = leftWidth > 0, overshootRight = rightWidth > 0} =
      props;

    const transX = Animated.add(
      rowTranslation,
      dragX.interpolate({
        inputRange: [0, friction!],
        outputRange: [0, 1],
      }),
    ).interpolate({
      inputRange: [-rightWidth - 1, -rightWidth, leftWidth, leftWidth + 1],
      outputRange: [
        -rightWidth - (overshootRight ? 1 / overshootFriction! : 0),
        -rightWidth,
        leftWidth,
        leftWidth + (overshootLeft ? 1 / overshootFriction! : 0),
      ],
    });
    this.transX = transX;
    this.showLeftAction =
      leftWidth > 0
        ? transX.interpolate({
            inputRange: [-1, 0, leftWidth],
            outputRange: [0, 0, 1],
          })
        : new Animated.Value(0);
    this.leftActionTranslate = this.showLeftAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [-10000, 0],
      extrapolate: 'clamp',
    });
    this.showRightAction =
      rightWidth > 0
        ? transX.interpolate({
            inputRange: [-rightWidth, 0, 1],
            outputRange: [1, 0, 0],
          })
        : new Animated.Value(0);
    this.rightActionTranslate = this.showRightAction.interpolate({
      inputRange: [0, Number.MIN_VALUE],
      outputRange: [-10000, 0],
      extrapolate: 'clamp',
    });
  };

  private onTapHandlerStateChange = ({
    nativeEvent,
  }: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      this.close();
    }
  };

  private onHandlerStateChange = (
    ev: HandlerStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    if (ev.nativeEvent.oldState === State.ACTIVE) {
      this.handleRelease(ev);
    }

    if (ev.nativeEvent.state === State.ACTIVE) {
      const {velocityX, translationX: dragX} = ev.nativeEvent;
      const {rowState} = this.state;
      const {friction} = this.props;

      const translationX = (dragX + DRAG_TOSS * velocityX) / friction!;

      const direction =
        rowState === -1
          ? 'right'
          : rowState === 1
          ? 'left'
          : translationX > 0
          ? 'left'
          : 'right';

      if (rowState === 0) {
        this.props.onSwipeableOpenStartDrag?.(direction);
      } else {
        this.props.onSwipeableCloseStartDrag?.(direction);
      }
    }
  };

  private handleRelease = (
    ev: HandlerStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    const {velocityX, translationX: dragX} = ev.nativeEvent;
    const {leftWidth = 0, rowWidth = 0, rowState} = this.state;
    const {rightOffset = rowWidth} = this.state;
    const rightWidth = rowWidth - rightOffset;
    const {
      friction,
      leftThreshold = leftWidth / 2,
      rightThreshold = rightWidth / 2,
      leftTrigger = leftWidth / 2,
    } = this.props;

    const startOffsetX = this.currentOffset() + dragX / friction!;
    const translationX = (dragX + DRAG_TOSS * velocityX) / friction!;

    let toValue = 0;
    if (rowState === 0) {
      if (translationX > leftThreshold) {
        toValue = leftWidth;
      } else if (translationX < -rightThreshold) {
        toValue = -rightWidth;
      }
      if (translationX > leftTrigger) {
        this.props.onSwipeableLeftTrigger?.();
      }
    } else if (rowState === 1) {
      // swiped to left
      if (translationX > -leftThreshold) {
        toValue = leftWidth;
      }
    } else {
      // swiped to right
      if (translationX < rightThreshold) {
        toValue = -rightWidth;
      }
    }

    this.animateRow(startOffsetX, toValue, velocityX / friction!);
  };

  private animateRow = (
    fromValue: number,
    toValue: number,
    velocityX?:
      | number
      | {
          x: number;
          y: number;
        },
  ) => {
    const {dragX, rowTranslation} = this.state;
    dragX.setValue(0);
    rowTranslation.setValue(fromValue);

    this.setState({rowState: Math.sign(toValue)});
    Animated.spring(rowTranslation, {
      restSpeedThreshold: 1.7,
      restDisplacementThreshold: 0.4,
      velocity: velocityX,
      bounciness: 0,
      toValue,
      useNativeDriver: this.props.useNativeAnimations!,
      ...this.props.animationOptions,
    }).start(({finished}) => {
      if (finished) {
        if (toValue > 0) {
          this.props.onSwipeableLeftOpen?.();
          this.props.onSwipeableOpen?.('left', this);
        } else if (toValue < 0) {
          this.props.onSwipeableRightOpen?.();
          this.props.onSwipeableOpen?.('right', this);
        } else {
          const closingDirection = fromValue > 0 ? 'left' : 'right';
          this.props.onSwipeableClose?.(closingDirection, this);
        }
      }
    });
    if (toValue > 0) {
      this.props.onSwipeableLeftWillOpen?.();
      this.props.onSwipeableWillOpen?.('left');
    } else if (toValue < 0) {
      this.props.onSwipeableRightWillOpen?.();
      this.props.onSwipeableWillOpen?.('right');
    } else {
      const closingDirection = fromValue > 0 ? 'left' : 'right';
      this.props.onSwipeableWillClose?.(closingDirection);
    }
  };

  private onRowLayout = ({nativeEvent}: LayoutChangeEvent) => {
    this.setState({rowWidth: nativeEvent.layout.width});
  };

  private currentOffset = () => {
    const {leftWidth = 0, rowWidth = 0, rowState} = this.state;
    const {rightOffset = rowWidth} = this.state;
    const rightWidth = rowWidth - rightOffset;
    if (rowState === 1) {
      return leftWidth;
    } else if (rowState === -1) {
      return -rightWidth;
    }
    return 0;
  };

  close = () => {
    this.animateRow(this.currentOffset(), 0);
  };

  openLeft = () => {
    const {leftWidth = 0} = this.state;
    this.animateRow(this.currentOffset(), leftWidth);
  };

  openRight = () => {
    const {rowWidth = 0} = this.state;
    const {rightOffset = rowWidth} = this.state;
    const rightWidth = rowWidth - rightOffset;
    this.animateRow(this.currentOffset(), -rightWidth);
  };

  reset = () => {
    const {dragX, rowTranslation} = this.state;
    dragX.setValue(0);
    rowTranslation.setValue(0);
    this.setState({rowState: 0});
  };

  render() {
    const {rowState} = this.state;
    const {
      children,
      renderLeftActions,
      renderRightActions,
      dragOffsetFromLeftEdge = 10,
      dragOffsetFromRightEdge = 10,
    } = this.props;

    const left = renderLeftActions && (
      <Animated.View
        style={[
          styles.leftActions,
          // all those and below parameters can have ! since they are all
          // asigned in constructor in `updateAnimatedEvent` but TS cannot spot
          // it for some reason
          {transform: [{translateX: this.leftActionTranslate!}]},
        ]}>
        {renderLeftActions(this.showLeftAction!, this.transX!, this)}
        <View
          onLayout={({nativeEvent}) =>
            this.setState({leftWidth: nativeEvent.layout.x})
          }
        />
      </Animated.View>
    );

    const right = renderRightActions && (
      <Animated.View
        style={[
          styles.rightActions,
          {transform: [{translateX: this.rightActionTranslate!}]},
        ]}>
        {renderRightActions(this.showRightAction!, this.transX!, this)}
        <View
          onLayout={({nativeEvent}) =>
            this.setState({rightOffset: nativeEvent.layout.x})
          }
        />
      </Animated.View>
    );

    return (
      <PanGestureHandler
        activeOffsetX={[-dragOffsetFromRightEdge, dragOffsetFromLeftEdge]}
        touchAction="pan-y"
        {...this.props}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandlerStateChange}>
        <Animated.View
          onLayout={this.onRowLayout}
          style={[styles.container, this.props.containerStyle]}>
          {left}
          {right}
          <TapGestureHandler
            enabled={rowState !== 0}
            touchAction="pan-y"
            onHandlerStateChange={this.onTapHandlerStateChange}>
            <Animated.View
              pointerEvents={rowState === 0 ? 'auto' : 'box-only'}
              style={[
                {
                  transform: [{translateX: this.transX!}],
                },
                this.props.childrenContainerStyle,
              ]}>
              {children}
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  leftActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
  rightActions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
});
