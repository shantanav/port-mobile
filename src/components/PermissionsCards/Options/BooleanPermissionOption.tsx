import React from 'react';
import {StyleSheet,View} from 'react-native';

import ToggleSwitch from 'toggle-switch-react-native';

import {useThemeColors} from '@components/colorGuide';
import {PermissionConfig} from '@components/getPermissionIcon';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {Height, Size, Spacing} from '@components/spacingGuide';

/**
 * A reusable component for rendering permission toggle options with icons.
 *
 * This component displays:
 * - An icon that changes appearance based on permission state (enabled/disabled)
 * - A title for the permission
 * - A toggle switch to enable/disable the permission
 *
 * The icon background color and appearance changes based on:
 * - Permission state (enabled/disabled)
 * - Theme (light/dark)
 *
 * @param onToggle - Callback function when toggle switch is pressed
 * @param permissionState - Current boolean state of the permission
 * @param title - Text label for the permission
 * @param PermissionConfigMap - Icon and color configuration for the permission
 * @param theme - Current theme ('light' or 'dark')
 */

const BooleanPermissionOption = ({
  onToggle,
  permissionState,
  title,
  PermissionConfigMap,
  theme,
  appPermissionNotGranted,
  appPermissionNotGrantedText,
}: {
  onToggle: () => void;
  permissionState: boolean;
  title: string;
  PermissionConfigMap: PermissionConfig;
  theme: 'light' | 'dark';
  appPermissionNotGranted?: boolean;
  appPermissionNotGrantedText?: string;
}) => {
  const colors = useThemeColors(theme);
  return (
    <View>
      <View style={styles.optionWrapper}>
        <View style={styles.topContainer}>
          <View
            style={{
              backgroundColor:
                !appPermissionNotGranted && permissionState
                  ? PermissionConfigMap.bgColor
                  : 'transparent',
              borderWidth: 0.5,
              borderRadius: 100,
              padding: Spacing.s,
              borderColor:
                !appPermissionNotGranted && permissionState
                  ? 'transparent'
                  : colors.stroke,
            }}>
            {!appPermissionNotGranted && permissionState ? (
              <PermissionConfigMap.enabledIcon height={Size.m} width={Size.m} />
            ) : theme === 'light' ? (
              <PermissionConfigMap.disabledIconLight
                height={Size.m}
                width={Size.m}
              />
            ) : (
              <PermissionConfigMap.disabledIconDark
                height={Size.m}
                width={Size.m}
              />
            )}
          </View>
          <NumberlessText
            textColor={colors.text.title}
            numberOfLines={1}
            fontSizeType={FontSizeType.m}
            fontWeight={FontWeight.rg}
            style={styles.heading}>
            {title}
          </NumberlessText>
          <ToggleSwitch
            isOn={!appPermissionNotGranted && permissionState}
            onColor={colors.enabled}
            offColor={colors.disabled}
            onToggle={onToggle}
            disabled={appPermissionNotGranted}
          />
        </View>
      </View>
      {appPermissionNotGranted && appPermissionNotGrantedText && (
        <NumberlessText
          style={{marginBottom: Spacing.xs}}
          textColor={colors.red}
          fontSizeType={FontSizeType.s}
          fontWeight={FontWeight.rg}>
          {appPermissionNotGrantedText}
        </NumberlessText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  optionWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    height: Height.optionBar,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  heading: {
    marginHorizontal: Spacing.s,
    flex: 1,
  },
});

export default BooleanPermissionOption;
