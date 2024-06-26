import { datesHaveTheSameDay, getDateData } from "../lib/dates";
import { EventImage } from "../types/events.types";

export type PossibleError = string | null;

interface EventCreationFields {
  name: string;
  description: string;
  date: Date;
  hour: Date;
  selectedCategories: number[];
  country: string;
  direction: string;
  duration: string;
  cost: string;
  image: EventImage;
}

export interface EventCreationValidationErrors {
  name: PossibleError;
  description: PossibleError;
  date: PossibleError;
  hour: PossibleError;
  selectedCategories: PossibleError;
  country: PossibleError;
  direction: PossibleError;
  duration: PossibleError;
  cost: PossibleError;
  image: PossibleError;
}

export function validateEventCreationData(
  eventData: EventCreationFields
): EventCreationValidationErrors {
  const eventCreationErrors = {
    name: validateRequired("nombre", eventData.name),
    description: validateRequired("descripción", eventData.description),
    date: validateDate(eventData.date),
    hour: validateHour(eventData.date, eventData.hour),
    selectedCategories: validateCategories(eventData.selectedCategories),
    country: validateCountry(eventData.country),
    direction: validateRequired("dirección", eventData.direction),
    duration: validateDuration(eventData.duration),
    cost: validateCost(eventData.cost),
    image: validateImage(eventData.image),
  };

  return eventCreationErrors;
}

function validateRequired(fieldName: string, value: string) {
  if (!value || value.length == 0) {
    return `El campo de ${fieldName} es requerido`;
  }
  return null;
}

function validateDate(date: Date) {
  if (!date) {
    return "Fecha requerida";
  }
  return null;
}

function validateHour(date: Date, hour: Date) {
  if (!hour) {
    return "Hora requerida";
  }

  const currentDate = new Date();

  if (datesHaveTheSameDay(date, currentDate)) {
    const currentDateData = getDateData(currentDate);

    const selectedDateData = getDateData(hour);

    if (selectedDateData.hour < currentDateData.hour) {
      return "Esa hora ya ha pasado";
    }

    if (
      selectedDateData.hour === currentDateData.hour &&
      selectedDateData.minute <= currentDateData.minute
    ) {
      return "Esa hora ya ha pasado";
    }
  }

  return null;
}

function validateCategories(categoryIds: number[]) {
  if (!categoryIds || categoryIds.length === 0) {
    return "Por favor selecciona una categoría";
  }
  return null;
}

function validateCountry(country: string) {
  // undefined cuando se selecciona el mar o algo raro
  if (!country || (country !== "Mexico" && country !== "México")) {
    return "Por favor selecciona una ubicación dentro de México";
  }

  return null;
}

function validateDuration(duration: string) {
  const error = validateRequired("duración", duration);
  if (error) return error;

  const parsedDuration = Number(duration);

  // posible Nan
  if (isNaN(parsedDuration)) {
    return "Escribe un valor númerico";
  }

  if (!Number.isInteger(parsedDuration)) {
    return "Escribe un valor entero";
  }

  if (parsedDuration <= 0) {
    return "La duración no puede ser 0 o negativa";
  }

  if (parsedDuration > 24) {
    return "La duración no puede ser mayor a 24 horas";
  }

  return null;
}

function validateCost(cost: string) {
  // si no se proporciono un costo, no hay problema, es opcional, por defecto es 0
  if (!cost) {
    return null;
  }

  const parsedCost = Number(cost);

  // posible Nan
  if (isNaN(parsedCost)) {
    return "Escribe un valor númerico";
  }

  if (parsedCost < 0) {
    return "El costo no puede ser menor a 0";
  }

  return null;
}

function validateImage(image: EventImage) {
  if (!image) {
    return "Por favor selecciona una imagen";
  }
  return null;
}
