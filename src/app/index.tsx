import { ActivityIndicator, ScrollView, View } from "react-native";
import { supabase } from "../supabase";
import { useEffect, useState, useCallback, useContext } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import MyCarousel from "../../components/screens/WelcomeScreen";
import * as Location from "expo-location";
import { LocationContext } from "../providers/LocationProvider";
import { AuthContext } from "../providers/AuthProvider";
import EventsPage from "./events";
import SelectLocationForm from "../../components/users/SelectLocationForm/SelectLocationForm";
import { useDispatch } from "react-redux";
import {
  fetchNotifications,
  notificationAdded,
  resetState,
} from "../slices/notificationsSlice";
import { AppDispatch } from "./store";
import { usePushNotifications } from "../hooks/usePushNotifications";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);
  const { session } = useContext(AuthContext);
  const { expoPushToken, notification } = usePushNotifications();
  const { location } = useContext(LocationContext);
  const [fontsLoaded, fontError] = useFonts({
    "Rubik-Regular": require("../../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Medium": require("../../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-SemiBold": require("../../assets/fonts/Rubik-SemiBold.ttf"),
    "Rubik-Bold": require("../../assets/fonts/Rubik-Bold.ttf"),
  });

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (session?.user?.id == null) {
      supabase.removeAllChannels();
      dispatch(resetState());
      return;
    }

    dispatch(fetchNotifications(session.user.id));

    const channel = supabase
      .channel("notificaciones_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
          filter: `id_usuario_a_notificar=eq.${session.user.id}`,
        },
        (payload) => {
          dispatch(notificationAdded(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeAllChannels();
      dispatch(resetState());
    };
  }, [session?.user?.id]);

  useEffect(() => {
    async function registerPushNotifications() {
      if (session?.user?.id && expoPushToken?.data) {
        await supabase
          .from("usuarios")
          .update({
            expo_push_token: expoPushToken.data,
          })
          .eq("id", session.user.id);
      }
    }
    registerPushNotifications();
  }, [session?.user?.id, expoPushToken?.data]);

  //   useEffect(() => {
  //     supabase.auth.getSession().then(({ data: { session } }) => {
  //         console.log("ola session en getSession: ",session)
  //       })
  // }, [])

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      {session != null ? (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          {location.estado == null && location.municipio == null ? (
            <ActivityIndicator style={{ flex: 1 }} />
          ) : location.estado != "" && location.municipio != "" ? (
            <EventsPage />
          ) : (
            <SelectLocationForm goBack={false} />
          )}
        </View>
      ) : (
        <ScrollView onLayout={onLayoutRootView}>
          <MyCarousel />
        </ScrollView>
      )}
    </>
  );
}
