/**
 * A Primary button to use in Port that displays an Icon and Text.
 * Possible states:
 * 1. Clickable
 * 2. Disabled (not clickable)
 * 3. Loading (not clickable)
 * The icon is always positioned to the left of the text.
 * The buttons stretches to fill the parent container
 *
 * The button takes the following props:
 * 1. buttonText - string with a max size of 16
 * 2. buttonColor - "b" (default), "r" or "w"
 * 3. icon (optional) - svg icon to display
 * 4. iconSize (optional) - "s" (default), "m"
 * 5. disabled - false by default. If button should be in disabled state, use true.
 * 6. isLoading - false by default. If button should be in loading state, use true.
 * 7. onClick - function that runs on clicking.
 */

import React, {FC} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

import {SvgProps} from 'react-native-svg';

import {FontSizes} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';

/**
 * @deprecated
 * @param param0
 * @returns
 */
const PrimaryButton = ({
  buttonText,
  primaryButtonColor,
  Icon,
  iconSize,
  textStyle,
  isLoading,
  disabled,
  onClick = () => {},
  untrimmedText = false,
  buttonHeight = 50,
}: {
  buttonText: string;
  primaryButtonColor: 'b' | 'r' | 'w' | 'p' | 'black' | 'secondaryAccent';
  Icon?: FC<SvgProps>;
  iconSize?: 's' | 'm';
  textStyle?: TextStyle;
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
  untrimmedText?: boolean;
  buttonHeight?: number;
}) => {
  function primaryButtonStylePicker(primaryButtonColor?: string): ViewStyle {
    if (primaryButtonColor === 'r') {
      return styles.redButton;
    } else if (primaryButtonColor === 'w') {
      return styles.whiteButton;
    } else if (primaryButtonColor === 'p') {
      return styles.purpleButton;
    } else if (primaryButtonColor === 'black') {
      return styles.blackButton;
    } else if (primaryButtonColor === 'secondaryAccent') {
      return styles.secondaryAccent;
    } else {
      return styles.blueButton;
    }
  }

  const Colors = DynamicColors();
  const styles = styling(Colors, buttonHeight);
  return (
    <TouchableOpacity
      disabled={isLoading ? true : disabled}
      style={StyleSheet.compose(
        primaryButtonStylePicker(primaryButtonColor),
        disabled ? styles.disabledButton : styles.button,
      )}
      activeOpacity={0.6}
      onPress={onClick}>
      {isLoading ? (
        <ActivityIndicator color={'white'} />
      ) : (
        <>
          {Icon && (
            <Icon
              style={{marginRight: 5}}
              height={iconSize === 'm' ? 24 : 20}
              width={iconSize === 'm' ? 24 : 20}
            />
          )}
          <Text
            style={StyleSheet.compose(
              textStyle,
              primaryButtonColor === 'w'
                ? {
                    ...styles.buttonText,
                    color: textStyle?.color ?? Colors.primary.genericblack,
                  }
                : styles.buttonText,
            )}
            numberOfLines={1}
            ellipsizeMode={'tail'}>
            {untrimmedText ? buttonText : buttonText.substring(0, 24)}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styling = (colors: any, buttonHeight: number) =>
  StyleSheet.create({
    disabledButton: {
      width: '100%',
      alignItems: 'center',
      height: buttonHeight,
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: colors.button.disabled,
      opacity: 0.5,
    },
    redButton: {
      backgroundColor: colors.primary.red,
    },
    whiteButton: {backgroundColor: colors.primary.white},
    blackButton: {backgroundColor: colors.primary.genericblack},
    blueButton: {backgroundColor: colors.button.black},
    purpleButton: {
      backgroundColor: colors.primary.accent,
    },
    secondaryAccent: {
      backgroundColor: colors.primary.secondaryAccentColor,
    },
    button: {
      width: '100%',
      alignItems: 'center',
      height: buttonHeight,
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 12,
    },
    buttonText: {
      ...FontSizes[16].medium,
      color: colors.primary.white,
    },
  });

export default PrimaryButton;
