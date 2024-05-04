import { useFocusEffect } from "expo-router";
import React from "react";

import { fireEvent, render } from "@testing-library/react-native";

import ProfileScreen from "../ProfileScreen";
import { AuthContext } from "../../../src/providers/AuthProvider";
import { UserProfileContext } from "../../../src/providers/UserProfileProvider";
import { supabase } from "../../../src/supabase";

jest.mock("expo-router");
jest.mock("../../../src/supabase");

const mockContext = jest.mock(
  "../../../src/providers/UserProfileProvider",
  () => ({
    __esModule: true,
    default: React.createContext({}),
  })
);

const mockContextValue = {
  userProfile: {
    nombres: "John",
    apellidos: "Doe",
    email: "johndoe@mail.com",
    estado: "Sonora",
    municipio: "Hermosillo",
    celular: "6621234567",
    foto: "https://example.com/johndoe.jpg",
    rol: "user",
  },
  error: null,
  updateUserProfile: jest.fn(),
};

const mockAuthContextValue = {
  session: {
    user: {
      email: "johndoe@mail.com",
    },
  },
};

const MockUserProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProfileContext.Provider value={mockContextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

describe("Log out button", () => {
  it("should render the log out button", async () => {
    useFocusEffect.mockImplementation((_) => null);

    const { findByText } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <MockUserProvider>
          <ProfileScreen />
        </MockUserProvider>
      </AuthContext.Provider>
    );

    await findByText("Cerrar sesión");
  });

  it("should log out when the button is pressed", async () => {
    useFocusEffect.mockImplementation((_) => null);

    supabase.auth.signOut = jest.fn();

    const { findByText } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <MockUserProvider>
          <ProfileScreen />
        </MockUserProvider>
      </AuthContext.Provider>
    );

    const logOutButton = await findByText("Cerrar sesión");
    fireEvent.press(logOutButton);

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
