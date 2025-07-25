import React, {useState} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import SimpleInput from '@components/Inputs/SimpleInput';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

const AddPasswordCard = ({
  password,
  setPassword,
  reenterPassword,
  setReenterPassword,
  error,
}: {
  password: string;
  setPassword: (value: string) => void;
  reenterPassword: string;
  setReenterPassword: (value: string) => void;
  error: string | undefined;
}) => {
  const color = useColors();
  const svgArray = [
    {
      assetName: 'PasswordHidden',
      light: require('@assets/light/icons/PasswordHidden.svg').default,
      dark: require('@assets/dark/icons/PasswordHidden.svg').default,
    },
    {
      assetName: 'PasswordVisible',
      light: require('@assets/light/icons/PasswordVisible.svg').default,
      dark: require('@assets/dark/icons/PasswordVisible.svg').default,
    },
  ];
  const svgResults = useSVG(svgArray, color.theme);
  const PasswordHidden = svgResults.PasswordHidden;
  const PasswordVisible = svgResults.PasswordVisible;
  const [showPassword, setShowPassword] = useState(false);
  const [showReenter, setShowReenter] = useState(false);

  return (
    <GradientCard style={styles.card}>
      <View>
        <NumberlessText
          style={styles.title}
          textColor={color.text.title}
          fontSizeType={FontSizeType.l}
          fontWeight={FontWeight.md}>
          Add a password
        </NumberlessText>

        <NumberlessText
          style={{ margin: Spacing.xs }}
          textColor={color.text.subtitle}
          fontSizeType={FontSizeType.s}
          fontWeight={FontWeight.rg}>
          This will be used to encrypt your backup. You'll have to reenter it when restoring your account.
        </NumberlessText>

        <View style={styles.inputRow}>
          <SimpleInput
            setText={setPassword}
            text={password}
            bgColor="w"
            placeholderText="Enter your password"
            secureTextEntry={!showPassword}
          />
          <Pressable style={styles.visIcon} onPress={() => setShowPassword(v => !v)}>
            {showPassword ? <PasswordVisible /> : <PasswordHidden />}
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <SimpleInput
            setText={setReenterPassword}
            text={reenterPassword}
            bgColor="w"
            placeholderText="Re-enter your password"
            secureTextEntry={!showReenter}
          />
          <Pressable style={styles.visIcon} onPress={() => setShowReenter(v => !v)}>
            {showReenter ? <PasswordVisible /> : <PasswordHidden />}
          </Pressable>
        </View>
        {error &&
          <NumberlessText
            style={styles.errorText}
            textColor={"red"}
            fontSizeType={FontSizeType.s}
            fontWeight={FontWeight.rg}>
            {error}
          </NumberlessText>
        }
      </View>
    </GradientCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.l,
  },
  title: {
    marginBottom: Spacing.m,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  errorText: {
    marginBottom: Spacing.s,
  },
  visIcon: {
    padding: Spacing.m,
  },
});

export default AddPasswordCard;
