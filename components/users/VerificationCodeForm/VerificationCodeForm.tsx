import { Text, View, ScrollView, SafeAreaView, Modal } from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { supabase } from "../../../src/supabase";

import styles from "./VerificationCodeForm.style";
import ReturnButton from "../../common/ReturnButton/ReturnButton";
import LoadingScreen from "../../common/LoadingScreen/LoadingScreen";

import { COLORS, FONTS, SIZES } from "../../../constants/theme";
import { FC, useState } from "react";

interface Props {
  submitOtp?: (code: string) => void;
}

const VerificationCodeForm: FC<Props> = ({ submitOtp }) => {
  const CELL_COUNT = 6;
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const router = useRouter();
  const user = String(useLocalSearchParams().id);
  const email = String(useLocalSearchParams().email);
  const verificationType = String(useLocalSearchParams().verificationType);
  const [isLoading, setLoading] = useState(false);
  const [wrongCode, setWrongCode] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(false);

  async function verifyCode(code) {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      token: String(code),
      type: "email",
      email: email,
    });
    if (error) setWrongCode(true);
    setLoading(false);
    if (!error) {
      if (verificationType === "PasswordChange") {
        router.push("/users/passwordRecovery");
      } else {
        router.push({
          pathname: "/users/selectLocation",
          params: { id: user },
        });
      }
      //router.push("/users/selectLocation")
    }
  }
  async function sendOtp(email) {
    if (!otpCooldown) {
      setLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      setOtpCooldown(true);
      setTimeout(() => setOtpCooldown(false), 15000); // Reset cooldown after 15 seconds
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.white },
          headerShadowVisible: false,
          headerShown: true,
          headerLeft: () => <ReturnButton />,
          headerTitle: "",
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Código de verificación</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            Ingresa el código de verificación que acabamos de enviar a {email}.
          </Text>
        </View>

        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={(text) => {
            setValue(text);
            if (text.length === 6) {
              submitOtp ? submitOtp(text) : verifyCode(text);
            }
          }}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <Text
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          )}
        />

        {wrongCode && (
          <View>
            <Text style={styles.badText}>
              El código ingresado es incorrecto o ha expirado.
            </Text>
          </View>
        )}

        {isLoading && <LoadingScreen />}
      </ScrollView>
      <SafeAreaView style={styles.footer}>
        <Text style={styles.text}>
          ¿No recibiste el código?{" "}
          <Text
            style={{ color: COLORS.darkOrange, fontFamily: FONTS.RubikBold }}
            onPress={() => {
              sendOtp(email);
            }}
          >
            Reenviar
          </Text>
        </Text>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default VerificationCodeForm;
