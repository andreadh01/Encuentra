import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle,
} from "react-native";
import styles from "./PasswordTextInput.style";
import Fluent_eye_icon from "../../../assets/images/fluent_eye_filled.svg";
import Fluent_eye_icon_hidden from "../../../assets/images/fluent_eye_hide_filled.svg";

interface PasswordInputProps {
  placeholder: string;
  style: StyleProp<TextStyle>;
  handleTextChange: React.Dispatch<React.SetStateAction<string>>;
  value?: string;
  testID?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  testID = "passwordInput",
  value,
  placeholder,
  style,
  handleTextChange,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <TextInput
        testID={testID}
        secureTextEntry={!showPassword}
        placeholder={placeholder}
        onChangeText={handleTextChange}
        value={value}
        style={[styles.input, style]}
      />
      <View style={{ position: "absolute", right: 20, top: 20 }}>
        <TouchableOpacity onPress={togglePasswordVisibility}>
          {/* {showPassword ? <Fluent_eye_icon /> : <Fluent_eye_icon_hidden />} */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PasswordInput;
