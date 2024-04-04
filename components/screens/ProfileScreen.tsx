import { Image, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/supabase";
import { AuthContext } from "../../src/providers/AuthProvider";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import MyEventsIcon from "../../assets/images/profile_screen/my_events_icon.svg";
import MyActivityIcon from "../../assets/images/profile_screen/my_activity_icon.svg";
import NotificationIcon from "../../assets/images/profile_screen/notification_icon.svg";
import LogOutIcon from "../../assets/images/profile_screen/logout_icon.svg";
import LoginIcon from "../../assets/images/profile_screen/login_icon.svg";
import ProfileScreenButton from "../common/ProfileScreenButton/ProfileScreenButton";
import { useSelector } from "react-redux";
import { RootState } from "../../src/app/store";
import ReturnButton from "../common/ReturnButton/ReturnButton";
import { COLORS,FONTS } from "../../constants/theme";
import NoAvatarIcon from "../../assets/images/profile_screen/noAvatar.svg";
import {LinearGradient} from "expo-linear-gradient";
import { UserProfileContext } from '../../src/providers/UserProfileProvider';
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import AgregarCategoriaIcon from "../../assets/images/profile_screen/agregarCategoriaIcon.svg";

const ProfileScreen = () => {
  const { userProfile, error } = useContext(UserProfileContext);
  const { session } = useContext(AuthContext);
  const [profileName, setProfileName] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profPic, setProfPic] = useState("");
  const [update, setUpdate] = useState(0); // You can use any initial value
  

  const { notificacionesPendientesDeVer } = useSelector(
    (state: RootState) => state.notifications
  );
  const router = useRouter();

  function logOut() {
    supabase.auth.signOut();
  }
    // useEffect(() => {
  //   if (userProfile) {
  //     console.log("ola que tal amigos")
  //     profileName = userProfile.nombres.split(" ")[0] + " " + userProfile.apellidos.split(" ")[0];
  //     profileLocation = userProfile.estado + ", " + userProfile.municipio;
  //     profPic = userProfile.foto;
  //   }
  // }, [userProfile]);
  useEffect(() => {
    console.log("ola saludos desde el use effect, tu perfil es: ", userProfile)
  },[])

  useFocusEffect(
    React.useCallback(() => {
      setUpdate(update + 1);      
      console.log("ola saludos desde el focus effect, tu perfil es: ", userProfile)
      if(userProfile){
        setProfileName(userProfile.nombres.split(" ")[0] + " " + userProfile.apellidos.split(" ")[0]);
        setProfileLocation(userProfile.estado + ", " + userProfile.municipio);
        setProfPic(userProfile.foto);
      }
    },[userProfile]),
  );



  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
                  options={{
                  headerShown: true,
                  headerStyle: { backgroundColor: "white" },
                  headerShadowVisible: false,
                  headerTitle: "Perfil",
                  headerTitleStyle: styles.headerTitleStyle,
                  }}
              />
      {session ? (
        <View>
          <View style={styles.profileInfo}>
          <LinearGradient
              colors={['#FF7208', '#222419']} // Gradient colors
              start={[0, 0]} // Gradient start position
              end={[1, 1]} // Gradient end position
              style={styles.gradientContainer}
              >
              {profPic ?  (
                <Image
                  source={{ uri: profPic }}
                  style={styles.profilePicture}
                  resizeMode="cover"
                  
                />
              ) : (
                <View style={styles.noProfilePicture}>
                  <NoAvatarIcon width={"100%"} height={"100%"}/>
                </View>
                
              )}
              </LinearGradient>
              {userProfile ? (userProfile.rol === 'admin'? (
                <Text style={styles.nombre}>{profileName} (Admin)</Text>
              ):(<Text style={styles.nombre}>{profileName}</Text>)
              ):(<Text style={styles.nombre}>Cargando...</Text>)}
              
              
              <Text style={[styles.text,styles.decoration]}>{session.user.email}</Text>
              <Text style={styles.text}>{profileLocation}</Text>
              <TouchableOpacity onPress={()=>{router.navigate("/users/EditProfile")}}>
                <Text style={styles.editarPerfilButton}>Editar perfil</Text>
              </TouchableOpacity>
              
          </View>
          
          <ScrollView style={{height:"46%"}} showsVerticalScrollIndicator={false} overScrollMode="always">
          <ProfileScreenButton
            text="Mis eventos"
            icon={MyEventsIcon}
            onPress={() => {}}
          />
          <ProfileScreenButton
            text="Mi actividad"
            icon={MyActivityIcon}
            onPress={() => {}}
          />
          <ProfileScreenButton
            text="Notificaciones"
            icon={NotificationIcon}
            onPress={() => {
              router.push("/notifications");
            }}
            displayNotificationCircle={notificacionesPendientesDeVer}
          />
          { userProfile && userProfile.rol === 'admin' ? (
            <ProfileScreenButton
              text="Agregar categoría"
              icon={AgregarCategoriaIcon}
              onPress={() => {
                // router.push("/agregar_categoria");
              }}
            />
          ):<></>}
          <ProfileScreenButton
            text="Cerrar sesión"
            icon={LogOutIcon}
            onPress={() => {
              logOut();
            }}
          />
          </ScrollView>
        </View>
      ) : (
        <ProfileScreenButton
          text="Iniciar sesión"
          icon={LoginIcon}
          onPress={() => {
            router.navigate("/users/login");
          }}
        />
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
  headerTitleStyle: {
    fontSize: 24,
    fontFamily: FONTS.RubikMedium,
    color: "#120D26",
    paddingLeft: 20,
  },
  profileInfo: {
    alignItems: "center",
    marginTop:-30
  }
  ,
  gradientContainer: {
    width: 152,
    height: 152,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    overflow: "hidden"
  },
  profilePicture: {
    width: '98%',
    height: '98%',
    borderRadius: 100,
    
  },
  noProfilePicture: {
    width: "98%",
    height: "98%",
    borderColor: 'black',
  },
  nombre: {
    fontSize: 22,
    fontFamily: FONTS.RubikMedium,
    color: "black",
    marginTop: 15,
    marginBottom: 5
  },
  text:{
    fontSize: 14,
    fontFamily: FONTS.RubikRegular,
    color: "#707070"
  },
  decoration:{
    textDecorationLine: "underline",
    marginBottom: 10
  },
  editarPerfilButton: {
    backgroundColor: "#7056FF",
    width: 273,
    height: 47,
    borderRadius: 8,
    textAlign: "center",
    textAlignVertical: "center",
    color: "white",
    fontFamily: FONTS.RubikSemiBold,
    fontSize: 20,
    marginTop: 15,
    marginBottom: 25,
    paddingVertical: 4
  },



    }
);
