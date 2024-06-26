import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import BaseTextInput from "../../common/BaseTextInput/BaseTextInput";
import styles from "./createEventForm.style";
import DatePicker from "../../common/DatePicker/DatePicker";
import TimePicker from "../../common/TimePicker/TimePicker";
import { formatHour, getDateAfterCertainMonths } from "../../../src/lib/dates";
import SelectMultiple from "../../common/MultiSelect/MultiSelect";
import { getGeographicInformationFromLatLong } from "../../../src/services/geography";
import { getAllCategories } from "../../../src/services/categories";
import { COLORS, SIZES } from "../../../constants/theme";
import Map from "../../common/Map/Map";
import ImageSelector from "../../common/ImageSelector/ImageSelector";

import { Stack, router } from "expo-router";
import { useDispatch } from "react-redux";
import { Coordinates } from "../../../src/types/geography.types";
import { uploadFields } from "../../../src/slices/createEventFormSlice";
import {
  EventCreationValidationErrors,
  validateEventCreationData,
} from "../../../src/validations/eventCreation";
import React from "react";
import {
  GeographicApiInfoResult,
  GeographicInfo,
} from "../../../src/types/geography.types";
import ReturnButton from "../../common/ReturnButton/ReturnButton";

interface SelectableCategory {
  id: number;
  emojiAndText: string;
}

export default function CreateEventForm() {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(null);
  const [hour, setHour] = useState<Date>(null);
  const [categories, setCategories] = useState<SelectableCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [markerCoordinates, setMarkerCoordinates] = useState<Coordinates>({
    latitude: 29.059304,
    longitude: -110.949333,
  });
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [direction, setDirection] = useState("");
  const [cost, setCost] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState<EventCreationValidationErrors>(null);

  useEffect(() => {
    getAllCategories().then(({ data, error }) => {
      const selectableCategories: SelectableCategory[] = data.map(
        (category) => {
          return {
            id: category.id,
            emoji: category.emoji,
            text: category.nombre,
            color: category.color,
            emojiAndText: `${category.emoji} ${category.nombre}`,
          };
        }
      );
      setCategories(selectableCategories);
    });
  }, []);

  useEffect(() => {
    if (!markerCoordinates) return;
    getGeographicInformationFromLatLong(
      markerCoordinates.latitude,
      markerCoordinates.longitude
    ).then((data: GeographicApiInfoResult) => {
      const geographicInfo: GeographicInfo = data.results[0];
      const country = geographicInfo.country;
      const city = geographicInfo.county;
      const state = geographicInfo.state;
      const direction = geographicInfo.address_line1;
      setCountry(country);
      setCity(city);
      setState(state);
      setDirection(direction);
    });
  }, [markerCoordinates]);

  return (
    <>
      {/* <Stack.Screen
        options={{
          contentStyle: styles.page,
        }}
      /> */}
      <SafeAreaView style={{ backgroundColor: COLORS.white }}>
        <ScrollView contentContainerStyle={styles.container}>
          <ReturnButton />
          <Text style={styles.header}>Crear evento</Text>
          <BaseTextInput
            value={name}
            onChangeText={setName}
            placeholder={"Nombre del evento"}
            style={[styles.inputText, errors?.name && styles.errorField]}
            placeholderTextColor={COLORS.grey}
            maxLength={100}
          />
          {errors?.name && <Text style={styles.errorText}>{errors.name}</Text>}
          <BaseTextInput
            value={description}
            onChangeText={setDescription}
            placeholder={"Descripción"}
            numberOfLines={3}
            multiline={true}
            style={[
              styles.inputText,
              errors?.description && styles.errorField,
              {
                maxHeight: SIZES.medium * 6,
              },
            ]}
            placeholderTextColor={COLORS.grey}
          />
          {errors?.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
          <View style={styles.dateInputsContainer}>
            <View style={styles.picker}>
              <DatePicker
                date={date}
                onChangeDate={setDate}
                label={"Fecha"}
                minimumDate={new Date()}
                maximumDate={getDateAfterCertainMonths(new Date(), 3)}
                style={errors?.date && styles.errorField}
              />
              {errors?.date && (
                <Text style={[styles.errorText, { flex: 1 }]}>
                  {errors.date}
                </Text>
              )}
            </View>
            <View style={styles.picker}>
              <TimePicker
                time={hour}
                onChangeTime={setHour}
                label={"Hora"}
                style={errors?.hour && styles.errorField}
              />
              <View style={styles.dateInputsContainer}>
                {errors?.hour && (
                  <Text style={[styles.errorText, { flex: 1 }]}>
                    {errors.hour}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <SelectMultiple
            data={categories}
            value={selectedCategories}
            labelField="emojiAndText"
            valueField="id"
            onChange={(categories) => {
              setSelectedCategories(categories);
            }}
            placeholder={
              selectedCategories.length === 0
                ? "Categorías"
                : categories
                    .filter((category) => {
                      return selectedCategories.includes(category.id);
                    })
                    .map((category) => {
                      return category.emojiAndText;
                    })
                    .join(", ")
            }
            searchPlaceholder="Buscar categoría"
            maxSelect={3}
            style={errors?.selectedCategories && styles.errorField}
          />
          {errors?.selectedCategories && (
            <Text style={styles.errorText}>{errors.selectedCategories}</Text>
          )}
          <Map
            markerCoordinates={markerCoordinates}
            markerDescription={{ title: name, description }}
            onDragEnd={setMarkerCoordinates}
          />
          {errors?.country && (
            <Text style={styles.errorText}>{errors.country}</Text>
          )}
          <BaseTextInput
            value={state}
            onChangeText={setState}
            placeholder={"Estado"}
            editable={false}
            style={[styles.inputText, styles.disabledInputText]}
            placeholderTextColor={COLORS.grey}
          />
          <BaseTextInput
            value={city}
            onChangeText={setCity}
            placeholder={"Municipio"}
            editable={false}
            style={[styles.inputText, styles.disabledInputText]}
            placeholderTextColor={COLORS.grey}
          />
          <BaseTextInput
            value={direction}
            onChangeText={setDirection}
            placeholder={"Dirección"}
            editable={true}
            style={[styles.inputText, errors?.direction && styles.errorField]}
            placeholderTextColor={COLORS.grey}
          />
          {errors?.direction && (
            <Text style={styles.errorText}>{errors.direction}</Text>
          )}
          <View style={styles.durationAndFileContainer}>
            <View style={styles.durationAndCostContainer}>
              <View
                style={[
                  styles.durationInputContainer,
                  styles.fieldErrorContainer,
                ]}
              >
                <BaseTextInput
                  value={duration}
                  onChangeText={setDuration}
                  placeholder={"Duración (horas)"}
                  style={[
                    styles.inputText,
                    errors?.duration && styles.errorField,
                  ]}
                  placeholderTextColor={COLORS.grey}
                  keyboardType="numeric"
                  inputMode="numeric"
                />
                {errors?.duration && (
                  <Text style={styles.errorText}>{errors.duration}</Text>
                )}
              </View>
              <View style={styles.fieldErrorContainer}>
                <BaseTextInput
                  value={cost}
                  onChangeText={setCost}
                  placeholder={"Costo (MXN)"}
                  style={[styles.inputText, errors?.cost && styles.errorField]}
                  placeholderTextColor={COLORS.grey}
                  keyboardType="numeric"
                  inputMode="numeric"
                />
                {!cost ? (
                  <Text style={styles.infoText}>
                    Gratis si no se provee un costo
                  </Text>
                ) : errors?.cost ? (
                  <Text style={styles.errorText}>{errors.cost}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.fieldErrorContainer}>
              <ImageSelector
                image={image}
                onImageChange={setImage}
                style={errors?.image && styles.errorField}
              />
              {errors?.image && (
                <Text style={[{ alignSelf: "center" }, styles.errorText]}>
                  {errors.image}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              const errors = validateEventCreationData({
                name,
                description,
                date,
                hour,
                duration,
                cost,
                selectedCategories,
                country,
                direction,
                image,
              });

              setErrors(errors);

              const isThereAnError = Object.values(errors).some(
                (error) => error
              );

              if (isThereAnError) {
                return;
              }

              dispatch(
                uploadFields({
                  name: name,
                  description: description,
                  date: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                  },
                  hour: formatHour(hour),
                  categoryIds: selectedCategories,
                  country: country,
                  duration: duration,
                  cost: cost,
                  markerCoordinates: markerCoordinates,
                  state_name: state,
                  city_name: city,
                  direction: direction,
                  image: image,
                })
              );
              router.push("/events/create/secondStep");
            }}
          >
            <Text style={styles.nextBtnText}>Siguiente</Text>
          </TouchableOpacity>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => {
              Alert.alert(
                "¿Cancelar la creación del evento?",
                "Se perderán los datos ingresados",
                [
                  { text: "Si", onPress: () => router.replace("/") },
                  { text: "No", onPress: () => {} },
                ]
              );
            }}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
