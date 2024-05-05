import { useRouter } from "expo-router";
import React from "react";

import { fireEvent, render } from "@testing-library/react-native";

import EventDetails from "./EventDetailsComponent";
import { AuthContext } from "../../../src/providers/AuthProvider";
import { getGeographicInformationFromLatLong } from "../../../src/services/geography";
import { Category } from "../../../src/types/categories.types";
import { EventWithReactions } from "../../../src/types/events.types";
import { getMotivoReporte, getOrganizador } from "../../../src/services/events";
import {
  convertTimeTo12HourFormat,
  formatStrDateToSpanish,
} from "../../../src/lib/dates";

jest.mock("expo-router");
jest.mock("../../../src/services/geography");
jest.mock("../../../src/services/events");

const category: Category = {
  id: 1,
  nombre: "Categoría de prueba",
  color: "red",
  emoji: "🔥",
  created_at: "2024-06-01",
};

const event: EventWithReactions = {
  id_usuario: "229eadd4-dd3e-4c3b-9582-579b3a77bc35",
  nombre: "Evento de prueba",
  descripcion: "Descripción de prueba",
  fecha: "2024-06-01",
  hora: "18:00",
  duracion: 120,
  costo: 0,
  direccion: "Dirección de prueba",
  latitud_ubicacion: 19.4326,
  longitud_ubicacion: -99.1332,
  nombre_estado: "Sonora",
  nombre_municipio: "Hermosillo",
  categorias: [category],
  id: 1,
  portada: "https://placehold.co/600x400",
  bloqueado: false,
  created_at: "2024-06-01",
  cantidad_asistentes: 2,
  cantidad_me_gusta: 1,
  cantidad_no_me_gusta: 0,
  estatus: "disponible",
};

const mockAuthContextValue = {
  session: {
    user: {
      id: "a032b321-73c3-4494-bfdc-ad042843b96b",
      email: "johndoe@mail.com",
    },
  },
};

const passMocks = {
  reporte: new Promise((r) =>
    r({
      motivo: "Contenido inapropiado",
      descripcion: "Contenido inapropiado descripción",
    })
  ),
  geoInfo: new Promise((r) =>
    r({
      results: [
        {
          formatted: "Dirección de prueba, Hermosillo, Sonora, México",
        },
      ],
    })
  ),
  organizador: new Promise((r) =>
    r({
      id: "229eadd4-dd3e-4c3b-9582-579b3a77bc35",
      nombres: "John",
      apellidos: "Doe",
      celular: "1234567890",
      email: "johndoe@mail.com",
      foto: "https://placehold.co/400x400",
    })
  ),
};

const loadingMocks = {
  reporte: new Promise(() => {}),
  geoInfo: new Promise(() => {}),
  organizador: new Promise(() => {}),
};

const failMocks = {
  reporte: new Promise((r) =>
    r({
      data: null,
      error: "No se encontró el reporte",
    })
  ),
  geoInfo: new Promise((r) =>
    r({
      results: [],
    })
  ),
  organizador: new Promise((r) =>
    r({
      data: null,
      error: "No se encontró el organizador",
    })
  ),
};

getMotivoReporte.mockReturnValue(passMocks.reporte);
getGeographicInformationFromLatLong.mockReturnValue(passMocks.geoInfo);
getOrganizador.mockReturnValue(passMocks.organizador);

describe("Event details page", () => {
  it("should render a loading spinner", async () => {
    getGeographicInformationFromLatLong.mockReturnValue(loadingMocks.geoInfo);
    getOrganizador.mockReturnValue(loadingMocks.organizador);

    const { findByText } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <EventDetails event={event} />
      </AuthContext.Provider>
    );

    expect(await findByText("Cargando información del evento...")).toBeTruthy();
  });

  it("should render an error message when the geographic information is not found", async () => {
    getGeographicInformationFromLatLong.mockReturnValue(failMocks.geoInfo);
    getOrganizador.mockReturnValue(passMocks.organizador);

    const { findByText } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <EventDetails event={event} />
      </AuthContext.Provider>
    );

    expect(
      await findByText("No se encontró la ubicación del evento")
    ).toBeTruthy();
  });

  it("should render an error message when the organizer is not found", async () => {
    getGeographicInformationFromLatLong.mockReturnValue(passMocks.geoInfo);
    getOrganizador.mockReturnValue(failMocks.organizador);

    const { findByText } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <EventDetails event={event} />
      </AuthContext.Provider>
    );

    expect(
      await findByText("No se encontró el organizador del evento")
    ).toBeTruthy();
  });

  it("should render an error message when the event report is not found", async () => {
    getMotivoReporte.mockReturnValue(failMocks.reporte);
    getGeographicInformationFromLatLong.mockReturnValue(passMocks.geoInfo);
    getOrganizador.mockReturnValue(passMocks.organizador);

    const { findByText } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <EventDetails event={{ ...event, bloqueado: true }} />
      </AuthContext.Provider>
    );

    expect(
      await findByText("No se encontró el reporte del evento")
    ).toBeTruthy();
  });

  it("should render the event's report", async () => {
    getMotivoReporte.mockReturnValue(passMocks.reporte);
    getGeographicInformationFromLatLong.mockReturnValue(passMocks.geoInfo);
    getOrganizador.mockReturnValue(passMocks.organizador);

    const { findByText } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <EventDetails event={{ ...event, bloqueado: true }} />
      </AuthContext.Provider>
    );

    expect(await findByText("Evento no disponible")).toBeTruthy();
    expect(await findByText("Motivo de denuncia")).toBeTruthy();
    expect(
      await findByText("Contenido inapropiado", { exact: true })
    ).toBeTruthy();
  });

  it("should render the event details page", async () => {
    getMotivoReporte.mockReturnValue(passMocks.reporte);
    getGeographicInformationFromLatLong.mockReturnValue(passMocks.geoInfo);
    getOrganizador.mockReturnValue(passMocks.organizador);

    const { findByText } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <EventDetails event={event} />
      </AuthContext.Provider>
    );

    expect(await findByText(event.nombre!)).toBeTruthy();
    expect(await findByText(event.descripcion!)).toBeTruthy();
    expect(await findByText(formatStrDateToSpanish(event.fecha!))).toBeTruthy();
    expect(
      await findByText(convertTimeTo12HourFormat(event.hora!), { exact: false })
    ).toBeTruthy();
    expect(await findByText(event.direccion!)).toBeTruthy();
    expect(
      await findByText("Dirección de prueba, Hermosillo, Sonora, México")
    ).toBeTruthy();
    expect(await findByText(category.nombre)).toBeTruthy();
    expect(await findByText("Sin costo")).toBeTruthy();
  });
});
