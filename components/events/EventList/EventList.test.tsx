import { useRouter } from "expo-router";
import React from "react";

import { fireEvent, render } from "@testing-library/react-native";

import EventList from "./EventList";
import { EventsContext } from "../../../src/providers/EventsProvider";
import SearchBar from "../../common/SearchBar/SearchBar";

jest.mock("expo-router");

useRouter.mockReturnValue({
  navigate: jest.fn(),
});

const mockEvents = [
  {
    id: "9aed3e4b-cbd3-4d12-ae62-aa127a044664",
    portada: "https://placehold.co/600x400",
    fecha: "2024-05-06",
    hora: "15:00",
    cantidad_asistentes: 10,
    nombre: "Evento 1",
    direccion: "Calle 123",
    categorias: [{ color: "#7145d6", emoji: "✅" }],
    estatus: "disponible",
  },
  {
    id: "bd60864d-817c-4a2b-8784-fb4b8cae7314",
    portada: "https://placehold.co/600x400",
    fecha: "2024-05-07",
    hora: "12:00",
    cantidad_asistentes: 15,
    nombre: "Evento 2",
    direccion: "Calle 1233",
    categorias: [{ color: "#7145d6", emoji: "✅" }],
    estatus: "disponible",
  },
  {
    id: "7c766bb4-90ca-4dba-9cca-9dccbb9a3b92",
    portada: "https://placehold.co/600x400",
    fecha: "2024-04-08",
    hora: "16:00",
    cantidad_asistentes: 25,
    nombre: "Evento 3",
    direccion: "Calle 122",
    categorias: [{ color: "#7145d6", emoji: "✅" }],
    estatus: "lleno",
  },
  {
    id: "7e81ba8f-40b2-481c-8e20-276478b71537",
    portada: "https://placehold.co/600x400",
    fecha: "2024-05-03",
    hora: "11:00",
    cantidad_asistentes: 10,
    nombre: "Evento 4",
    direccion: "Calle 223",
    categorias: [{ color: "#7145d6", emoji: "✅" }],
    estatus: "pasado",
  },
  {
    id: "710fdf50-e999-48b2-a7ee-e1928c26f238",
    portada: "https://placehold.co/600x400",
    fecha: "2024-06-06",
    hora: "17:00",
    cantidad_asistentes: 5,
    nombre: "Evento 5",
    direccion: "Calle 523",
    categorias: [{ color: "#7145d6", emoji: "✅" }],
    estatus: "disponible",
  },
];

const mockEventsContextValue = {
  loading: {
    loading: true,
    events: [],
  },
  noEvents: {
    loading: false,
    events: [],
  },
  events: {
    loading: false,
    events: mockEvents,
  },
};

describe("Explore events", () => {
  it("should render a loading spinner", async () => {
    const { findByTestId } = render(
      <EventsContext.Provider value={mockEventsContextValue.loading}>
        <EventList />
      </EventsContext.Provider>
    );

    const loadingSpinner = await findByTestId("EventList:Loading");
    expect(loadingSpinner).toBeTruthy();
  });

  it("should render a message when there are no events", async () => {
    const { findByText } = render(
      <EventsContext.Provider value={mockEventsContextValue.noEvents}>
        <EventList />
      </EventsContext.Provider>
    );

    const noEventsMessage = await findByText("No se encontraron eventos");
    expect(noEventsMessage).toBeTruthy();
  });

  it("should render a list of available events", async () => {
    const { findByTestId } = render(
      <EventsContext.Provider value={mockEventsContextValue.events}>
        <EventList />
      </EventsContext.Provider>
    );

    const eventList = await findByTestId("EventList:Container");
    expect(eventList).toBeTruthy();
    expect(eventList.props.children.length).toBe(3);
  });
});
