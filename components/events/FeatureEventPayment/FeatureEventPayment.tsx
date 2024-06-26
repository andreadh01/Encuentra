import React, { useEffect, useState, useRef, useContext } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MyCalendar from "../../common/Calendar/Calendar";
import ReturnButton from "../../common/ReturnButton/ReturnButton";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import styles from "./FeatureEventPayment.style";
import TimePicker from "../../common/TimePicker/TimePicker";
import dayjs from "dayjs";
import DesgloceCostos from "../../common/DesgloceCostosOpener/DesgloceCostosOpener";
import NavButton from "../../common/NavButton/NavButton";
import ConfirmationModal from "../../common/ConfirmationModal/ConfirmationModal";
import CheckoutResultModal from "../../common/CheckoutResultModal/CheckoutResultModal";
import LoadingScreen from "../../common/LoadingScreen/LoadingScreen";
import { supabase } from "../../../src/supabase";
import { set } from "date-fns";
import CheckoutButton from "../../payments/CheckoutButton";
import {
  PaymentBreakdown,
  createPayment,
} from "../../../src/services/payments";
import { AuthContext } from "../../../src/providers/AuthProvider";

const FeatureEventPayment: React.FC = () => {
  const router = useRouter();
  const { session } = useContext(AuthContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  var modalMessage = "¿Estás seguro que deseas pagar por destacar este evento?";
  const params = useLocalSearchParams();
  const evento = String(params.id);
  const startDay = String(params.startDay);
  var endDay = String(params.endDay);
  const firstHour = dayjs(String(params.firstHour)).format("HH:mm");
  const lastHour = dayjs(String(params.lastHour)).format("HH:mm");
  const eventStartHour = String(params.eventStartHour);
  const eventStartDate = String(params.eventStartDate);
  const rangosFechasCobrados = JSON.parse(
    params.rangosFechasCobrados as string
  );
  const horasPorDia = dayjs(params.lastHour as string).diff(
    dayjs(params.firstHour as string),
    "hour"
  );
  // rangosFechasCobrados: {
  //     "3meses": any[];
  //     "2meses": any[];
  //     "1mes": any[];
  //     "3dias": any[];
  //     diaevento: any[];
  // };

  const total =
    horasPorDia * 1 * rangosFechasCobrados["3meses"].length +
    horasPorDia * 2 * rangosFechasCobrados["2meses"].length +
    horasPorDia * 5 * rangosFechasCobrados["1mes"].length +
    horasPorDia * 10 * rangosFechasCobrados["3dias"].length +
    horasPorDia * 20 * rangosFechasCobrados["diaevento"].length;

  const threeMonths =
    rangosFechasCobrados["3meses"].length > 0
      ? {
          "Tres meses de anticipación": [
            {
              price: horasPorDia * 1 * rangosFechasCobrados["3meses"].length,
              concept: `${horasPorDia} horas x $1.00 = $${horasPorDia}/día, ${
                rangosFechasCobrados["3meses"].length
              } Días x $${horasPorDia * 1}.00 = $${
                horasPorDia * 1 * rangosFechasCobrados["3meses"].length
              }.00`,
            },
          ],
        }
      : null;

  const twoMonths =
    rangosFechasCobrados["2meses"].length > 0
      ? {
          "Dos meses de anticipación": [
            {
              price: horasPorDia * 2 * rangosFechasCobrados["2meses"].length,
              concept: `${horasPorDia} horas x $2.00 = $${
                horasPorDia * 2
              }/día, ${rangosFechasCobrados["2meses"].length} Días x $${
                horasPorDia * 2
              }.00 = $${
                horasPorDia * 2 * rangosFechasCobrados["2meses"].length
              }.00`,
            },
          ],
        }
      : null;

  const oneMonth =
    rangosFechasCobrados["1mes"].length > 0
      ? {
          "Un mes de anticipación": [
            {
              price: horasPorDia * 5 * rangosFechasCobrados["1mes"].length,
              concept: `${horasPorDia} horas x $5.00 = $${
                horasPorDia * 5
              }/día, ${rangosFechasCobrados["1mes"].length} Días x $${
                horasPorDia * 5
              }.00 = $${
                horasPorDia * 5 * rangosFechasCobrados["1mes"].length
              }.00`,
            },
          ],
        }
      : null;

  const threeDays =
    rangosFechasCobrados["3dias"].length > 0
      ? {
          "Tres días de anticipación": [
            {
              price: horasPorDia * 10 * rangosFechasCobrados["3dias"].length,
              concept: `${horasPorDia} horas x $10.00 = $${
                horasPorDia * 10
              }/día, ${rangosFechasCobrados["3dias"].length} Días x $${
                horasPorDia * 10
              }.00 = $${
                horasPorDia * 10 * rangosFechasCobrados["3dias"].length
              }.00`,
            },
          ],
        }
      : null;

  const eventDay =
    rangosFechasCobrados["diaevento"].length > 0
      ? {
          "Día del evento": [
            {
              price:
                horasPorDia * 20 * rangosFechasCobrados["diaevento"].length,
              concept: `${horasPorDia} horas x $20.00 = $${
                horasPorDia * 20
              }/día, ${rangosFechasCobrados["diaevento"].length} Días x $${
                horasPorDia * 20
              }.00 = $${
                horasPorDia * 20 * rangosFechasCobrados["diaevento"].length
              }.00`,
            },
          ],
        }
      : null;

  const minimumPrice =
    total < 10
      ? { "Tarifa mínima": [{ price: 10, concept: "Cuota mínima" }] }
      : null;

  const applicablePayments = [
    threeMonths,
    twoMonths,
    oneMonth,
    threeDays,
    eventDay,
    minimumPrice,
  ]
    .filter((applicablePayment) => {
      return applicablePayment != null;
    })
    .reduce((acc, currentApplicablePayment) => {
      const paymentTitle = Object.keys(currentApplicablePayment)[0];
      if (!acc[paymentTitle]) {
        acc[paymentTitle] = currentApplicablePayment[paymentTitle];
      } else {
        acc[paymentTitle].push(currentApplicablePayment[paymentTitle]);
      }
      return acc;
    }, {});

  const paymentBreakdown: PaymentBreakdown = {
    ...applicablePayments,
  };

  async function uploadEvent() {
    try {
      var dummyLastHour = `2000-01-01T${lastHour}`;
      var dummyEventHour = `2000-01-01T${eventStartHour}`;
      var dummyFirstHour = `2000-01-01T${firstHour}`;
      if (
        dayjs(endDay).isSame(dayjs(eventStartDate), "day") &&
        dayjs(dummyLastHour).diff(dayjs(dummyEventHour), "hour", true) > 3
      ) {
        endDay = dayjs(endDay).subtract(1, "day").format("YYYY-MM-DD");
        if (
          dayjs(dummyFirstHour).diff(dayjs(dummyEventHour), "hours", true) <= 2
        ) {
          const { data, error } = await supabase.from("destacados").insert({
            id_evento: evento,
            fecha_inicio: eventStartDate,
            fecha_final: eventStartDate,
            hora_inicio: firstHour,
            hora_final: dayjs(dummyEventHour).add(3, "hour").format("HH:mm"),
            evento_inicia: eventStartHour,
          });
        }
      }
      const { data, error } = await supabase.from("destacados").insert({
        id_evento: evento,
        fecha_inicio: startDay,
        fecha_final: endDay,
        hora_inicio: firstHour,
        hora_final: lastHour,
        evento_inicia: eventStartHour,
      });
      if (error) {
        console.log(error.message);
        setModalType("cancelado");
        return error;
      }
    } catch (error) {
      console.error("Error inserting event", error.message);
    }
  }

  return (
    <SafeAreaView style={styles.parentContainer}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerShadowVisible: false,
          headerLeft: () => <ReturnButton />,
          headerTitle: "Pago",
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.infoPagoContainer}>
          <Text style={styles.infoPagoTitle}>Información de pago</Text>
          {/* de aqui abajo empieza el cagadero */}
          {rangosFechasCobrados["3meses"].length > 0 && (
            <View>
              {/* View pitero */}
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}>Horas por día</Text>
                  <Text style={styles.infoText}>(3 meses de anticipación)</Text>
                </View>
                <Text style={styles.cantidades}>{horasPorDia} Hrs</Text>
              </View>
              <Text style={styles.descripcion}>
                {horasPorDia} x $1.00 = ${horasPorDia}/día
              </Text>
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}> Días en destacado</Text>
                  <Text style={styles.infoText}>(3 meses de anticipación)</Text>
                </View>
                <Text style={styles.cantidades}>
                  {rangosFechasCobrados["3meses"].length} Días
                </Text>
              </View>
              <Text style={styles.descripcion}>
                {rangosFechasCobrados["3meses"].length} Días x $
                {horasPorDia * 1}.00 = $
                {horasPorDia * 1 * rangosFechasCobrados["3meses"].length}.00
              </Text>
              <View style={styles.subTotalContainer}>
                <Text style={styles.subTotalTitle}>Subtotal</Text>
                <Text style={styles.subTotalCantidad}>
                  ${horasPorDia * 1 * rangosFechasCobrados["3meses"].length}.00
                </Text>
              </View>
              {rangosFechasCobrados["2meses"].length !== 0 && (
                <View>
                  <View style={styles.separatorGreenWide2} />
                </View>
              )}
            </View>
          )}
          {rangosFechasCobrados["2meses"].length > 0 && (
            <View>
              {/* View pitero */}
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}>Horas por día</Text>
                  <Text style={styles.infoText}>(2 meses de anticipación)</Text>
                </View>
                <Text style={styles.cantidades}>{horasPorDia} Hrs</Text>
              </View>
              <Text style={styles.descripcion}>
                {horasPorDia} x $2.00 = ${horasPorDia * 2}/día
              </Text>
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}> Días en destacado</Text>
                  <Text style={styles.infoText}>(2 meses de anticipación)</Text>
                </View>
                <Text style={styles.cantidades}>
                  {rangosFechasCobrados["2meses"].length} Días
                </Text>
              </View>
              <Text style={styles.descripcion}>
                {rangosFechasCobrados["2meses"].length} Días x $
                {horasPorDia * 2}.00 = $
                {horasPorDia * 2 * rangosFechasCobrados["2meses"].length}.00
              </Text>
              <View style={styles.subTotalContainer}>
                <Text style={styles.subTotalTitle}>Subtotal</Text>
                <Text style={styles.subTotalCantidad}>
                  ${horasPorDia * 2 * rangosFechasCobrados["2meses"].length}.00
                </Text>
              </View>
              {rangosFechasCobrados["1mes"].length !== 0 && (
                <View>
                  <View style={styles.separatorGreenWide2} />
                </View>
              )}
            </View>
          )}
          {rangosFechasCobrados["1mes"].length > 0 && (
            <View>
              {/* View pitero */}
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}>Horas por día</Text>
                  <Text style={styles.infoText}>(1 mes de anticipación)</Text>
                </View>
                <Text style={styles.cantidades}>{horasPorDia} Hrs</Text>
              </View>
              <Text style={styles.descripcion}>
                {horasPorDia} x $5.00 = ${horasPorDia * 5}/día
              </Text>
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}> Días en destacado</Text>
                  <Text style={styles.infoText}>(1 mes de anticipación)</Text>
                </View>
                <Text style={styles.cantidades}>
                  {rangosFechasCobrados["1mes"].length} Días
                </Text>
              </View>
              <Text style={styles.descripcion}>
                {rangosFechasCobrados["1mes"].length} Días x ${horasPorDia * 5}
                .00 = ${horasPorDia * 5 * rangosFechasCobrados["1mes"].length}
                .00
              </Text>
              <View style={styles.subTotalContainer}>
                <Text style={styles.subTotalTitle}>Subtotal</Text>
                <Text style={styles.subTotalCantidad}>
                  ${horasPorDia * 5 * rangosFechasCobrados["1mes"].length}.00
                </Text>
              </View>
              {rangosFechasCobrados["3dias"].length !== 0 && (
                <View>
                  <View style={styles.separatorGreenWide2} />
                </View>
              )}
            </View>
          )}
          {rangosFechasCobrados["3dias"].length > 0 && (
            <View>
              {/* View pitero */}
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}>Horas por día</Text>
                  <Text style={styles.infoText}>(3 días de anticipación)</Text>
                </View>
                <Text style={styles.cantidades}>{horasPorDia} Hrs</Text>
              </View>
              <Text style={styles.descripcion}>
                {horasPorDia} x $10.00 = ${horasPorDia * 10}/día
              </Text>
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}> Días en destacado</Text>
                  <Text style={styles.infoText}>(3 días de anticipación)</Text>
                </View>
                <Text style={styles.cantidades}>
                  {rangosFechasCobrados["3dias"].length} Días
                </Text>
              </View>
              <Text key="8" style={styles.descripcion}>
                {rangosFechasCobrados["3dias"].length} Días x $
                {horasPorDia * 10}.00 = $
                {horasPorDia * 10 * rangosFechasCobrados["3dias"].length}.00
              </Text>
              <View style={styles.subTotalContainer}>
                <Text style={styles.subTotalTitle}>Subtotal</Text>
                <Text style={styles.subTotalCantidad}>
                  ${horasPorDia * 10 * rangosFechasCobrados["3dias"].length}.00
                </Text>
              </View>
              {rangosFechasCobrados["diaevento"].length !== 0 && (
                <View>
                  <View style={styles.separatorGreenWide2} />
                </View>
              )}
            </View>
          )}
          {rangosFechasCobrados["diaevento"].length > 0 && (
            <View>
              {/* View pitero */}
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}>Horas por día</Text>
                  <Text style={styles.infoText}>(Día del evento)</Text>
                </View>
                <Text style={styles.cantidades}>{horasPorDia} Hrs</Text>
              </View>
              <Text key="9" style={styles.descripcion}>
                {horasPorDia} x $20.00 = ${horasPorDia * 20}/día
              </Text>
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}> Días en destacado</Text>
                  <Text style={styles.infoText}>(Día del evento)</Text>
                </View>
                <Text style={styles.cantidades}>
                  {rangosFechasCobrados["diaevento"].length} Días
                </Text>
              </View>
              <Text key="10" style={styles.descripcion}>
                {rangosFechasCobrados["diaevento"].length} Días x $
                {horasPorDia * 20}.00 = $
                {horasPorDia * 20 * rangosFechasCobrados["diaevento"].length}.00
              </Text>
              <View style={styles.subTotalContainer}>
                <Text style={styles.subTotalTitle}>Subtotal</Text>
                <Text style={styles.subTotalCantidad}>
                  ${horasPorDia * 20 * rangosFechasCobrados["diaevento"].length}
                  .00
                </Text>
              </View>
            </View>
          )}
          {total < 10 && (
            <View>
              <View>
                <View style={styles.separatorGreenWide2} />
              </View>
              <View style={styles.containerTituloHoras}>
                <View style={styles.info}>
                  <Text style={styles.infoTitle}>Tarifa mínima</Text>
                  <Text style={styles.infoText}>(Cuota mínima)</Text>
                </View>
                <Text style={styles.cantidades}>$10.00</Text>
              </View>
              <View style={styles.subTotalContainer}>
                <Text style={styles.subTotalTitle}>Subtotal</Text>
                <Text style={styles.subTotalCantidad}>$10.00</Text>
              </View>
            </View>
          )}
          <View style={styles.separatorGreen} />
          {/* esto es el bloque del total */}
          <View style={styles.subTotalContainer}>
            <Text style={styles.subTotalTitle}>Total</Text>
            <Text></Text>
            <Text style={styles.totalCantidad}>
              ${total >= 10 ? total : 10}
              .00
            </Text>
          </View>
        </View>
      </ScrollView>

      <View>
        <View style={styles.nextButtonContainer}>
          <NavButton
            type={"destacar"}
            handlePress={() => {
              setIsModalVisible(true);
            }}
          />
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}> Cancelar </Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        isVisible={isModalVisible}
        message={modalMessage}
        paymentDetails={{
          // precio minimo = 10
          total: total >= 10 ? total : 10,
          id_evento: Number(evento),
          id_usuario: session.user.id,
          tipo_pago: "destacar_evento",
          desglose_costos: paymentBreakdown,
        }}
        onPress={async () => {
          setModalType("exito");
          setIsModalVisible(false);
          setIsLoading(true);
          //   setTimeout(() => {
          await uploadEvent();
          setModalType("exito");
          setIsLoading(false);
          setIsModalVisible2(true);
          //   }, 1000);
        }}
        exitButtonPress={() => {
          setModalType("cancelado");
          setIsModalVisible(false);
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            setIsModalVisible2(true);
          }, 1000);
        }}
      />

      <CheckoutResultModal isVisible={isModalVisible2} type={modalType} />

      {isLoading && <LoadingScreen />}
    </SafeAreaView>
  );
};

export default FeatureEventPayment;
