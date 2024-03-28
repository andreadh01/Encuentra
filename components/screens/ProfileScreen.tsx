import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LinkButton from "../common/LinkButton/linkButton";
import { supabase } from "../../src/supabase";
import { AuthContext } from "../../src/providers/AuthProvider";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";

const ProfileScreen = () => {
  const { session } = useContext(AuthContext);
  const router = useRouter();

  function logOut() {
    supabase.auth.signOut();
  }
  return (
    <SafeAreaView style={styles.container}>
      <Text>ProfileScreen</Text>
      {session ? (
        <>
          <LinkButton
            text={"Notificaciones"}
            handleNavigate={() => {
              router.push("/notifications");
            }}
          ></LinkButton>
          <View style={{ margin: 20 }}></View>
          <LinkButton text="Logout" handleNavigate={logOut}></LinkButton>
        </>
      ) : (
        <LinkButton
          text="Login"
          handleNavigate={() => {
            router.push("/users/login");
          }}
        ></LinkButton>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
