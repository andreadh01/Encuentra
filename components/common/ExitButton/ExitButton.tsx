import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity } from "react-native";
import styles from "./ExitButton.styles";

const back = require("../../../assets/images/back.svg");

const ExitButton = ({ handlePress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Image
        source={back}
        alt="Back"
        style={[{ ...StyleSheet.absoluteFillObject }]}
      />
    </TouchableOpacity>
  );
};

export default ExitButton;
