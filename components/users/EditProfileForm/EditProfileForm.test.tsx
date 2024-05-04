import React from "react";
import { useRouter, useNavigation } from "expo-router";

import { render, fireEvent, act, waitFor } from "@testing-library/react-native";

import EditProfileForm from "./EditProfileForm";
import { UserProfileContext } from "../../../src/providers/UserProfileProvider";
import { AuthContext } from "../../../src/providers/AuthProvider";
import { supabase } from "../../../src/supabase";

jest.mock("expo-router");

const mockUserContextValue = {
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

const mockUpdatedValues = {
  nombres: "Jane",
  apellidos: "Does",
  celular: "6621234527",
};

const mockAuthContextValue = {
  session: {
    user: {
      id: "a032b321-73c3-4494-bfdc-ad042843b96b",
      email: "johndoe@mail.com",
    },
  },
};

useRouter.mockReturnValue({
  navigate: jest.fn(),
  back: jest.fn(),
});

useNavigation.mockReturnValue({
  dispatch: jest.fn(),
  addListener: jest.fn(),
});

const mockFailPhoneValidation = jest.fn(() => ({
  eq: jest.fn((field: string, value: string) => ({
    data: [{ id: "a032b321-73c3-4494-bfdc-ad042843b96b" }],
  })),
}));

const mockPassPhoneValidation = jest.fn(() => ({
  eq: jest.fn((field: string, value: string) => ({
    data: [],
  })),
}));

const mockFailUserUpdate = jest.fn(() => ({
  eq: jest.fn((field: string, value: string) => ({
    error: new Error("User update failed"),
  })),
}));

const mockPassUserUpdate = jest.fn(() => ({
  eq: jest.fn((field: string, value: string) => ({
    error: null,
  })),
}));

describe("Account configuration", () => {
  it("should render the account configuration screen, email input should not be editable", async () => {
    const { findByText, findByDisplayValue } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserProfileContext.Provider value={mockUserContextValue}>
          <EditProfileForm />
        </UserProfileContext.Provider>
      </AuthContext.Provider>
    );

    await findByText("Nombre(s)");
    await findByDisplayValue(mockUserContextValue.userProfile.nombres);

    await findByText("Apellido(s)");
    await findByDisplayValue(mockUserContextValue.userProfile.apellidos);

    await findByText("Email");
    const emailInput = await findByDisplayValue(
      mockUserContextValue.userProfile.email
    );
    fireEvent.changeText(emailInput, "johndoe@email.com");
    expect(emailInput.props.value).toBe(mockUserContextValue.userProfile.email);

    await findByText("Celular");
    findByDisplayValue(mockUserContextValue.userProfile.celular);

    const changePasswordButton = await findByText("Cambiar Contraseña");
    fireEvent.press(changePasswordButton);
    expect(useRouter().navigate).toHaveBeenCalled();

    await findByText("Guardar Cambios");

    const cancelButton = await findByText(" Cancelar ");
    fireEvent.press(cancelButton);
    expect(useRouter().back).toHaveBeenCalled();
  });

  it("should edit first name, last name, and phone number", async () => {
    supabase.from = jest.fn(() => ({
      update: mockPassUserUpdate,
      select: mockPassPhoneValidation,
    }));

    const { findByText, findByDisplayValue } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserProfileContext.Provider value={mockUserContextValue}>
          <EditProfileForm />
        </UserProfileContext.Provider>
      </AuthContext.Provider>
    );

    const firstNameInput = await findByDisplayValue(
      mockUserContextValue.userProfile.nombres
    );
    fireEvent.changeText(firstNameInput, mockUpdatedValues.nombres);

    const lastNameInput = await findByDisplayValue(
      mockUserContextValue.userProfile.apellidos
    );
    fireEvent.changeText(lastNameInput, mockUpdatedValues.apellidos);

    const phoneInput = await findByDisplayValue(
      mockUserContextValue.userProfile.celular
    );
    fireEvent.changeText(phoneInput, mockUpdatedValues.celular);

    const saveButton = await findByText("Guardar Cambios");

    act(() => {
      fireEvent.press(saveButton);
    });

    await waitFor(
      async () => {
        expect(mockPassUserUpdate).toHaveBeenCalledWith({
          nombres: mockUpdatedValues.nombres,
          apellidos: mockUpdatedValues.apellidos,
          celular: mockUpdatedValues.celular,
        });
        expect(mockUserContextValue.updateUserProfile).toHaveBeenCalledWith({
          ...mockUserContextValue.userProfile,
          nombres: mockUpdatedValues.nombres,
          apellidos: mockUpdatedValues.apellidos,
          celular: mockUpdatedValues.celular,
        });

        expect(
          await findByText("Perfil actualizado exitosamente")
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it("should change the user's first name only", async () => {
    supabase.from = jest.fn(() => ({
      update: mockPassUserUpdate,
      select: mockPassPhoneValidation,
    }));

    const { findByText, findByDisplayValue } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserProfileContext.Provider value={mockUserContextValue}>
          <EditProfileForm />
        </UserProfileContext.Provider>
      </AuthContext.Provider>
    );

    const firstNameInput = await findByDisplayValue(
      mockUserContextValue.userProfile.nombres
    );
    fireEvent.changeText(firstNameInput, mockUpdatedValues.nombres);

    const saveButton = await findByText("Guardar Cambios");

    act(() => {
      fireEvent.press(saveButton);
    });

    await waitFor(
      async () => {
        expect(mockPassUserUpdate).toHaveBeenCalledWith({
          nombres: mockUpdatedValues.nombres,
          apellidos: mockUserContextValue.userProfile.apellidos,
          celular: mockUserContextValue.userProfile.celular,
        });
        expect(mockUserContextValue.updateUserProfile).toHaveBeenCalledWith({
          ...mockUserContextValue.userProfile,
          nombres: mockUpdatedValues.nombres,
        });

        expect(
          await findByText("Perfil actualizado exitosamente")
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it("should change the user's last name only", async () => {
    supabase.from = jest.fn(() => ({
      update: mockPassUserUpdate,
      select: mockPassPhoneValidation,
    }));

    const { findByText, findByDisplayValue } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserProfileContext.Provider value={mockUserContextValue}>
          <EditProfileForm />
        </UserProfileContext.Provider>
      </AuthContext.Provider>
    );

    const lastNameInput = await findByDisplayValue(
      mockUserContextValue.userProfile.apellidos
    );
    fireEvent.changeText(lastNameInput, mockUpdatedValues.apellidos);

    const saveButton = await findByText("Guardar Cambios");

    act(() => {
      fireEvent.press(saveButton);
    });

    await waitFor(
      async () => {
        expect(mockPassUserUpdate).toHaveBeenCalledWith({
          nombres: mockUserContextValue.userProfile.nombres,
          apellidos: mockUpdatedValues.apellidos,
          celular: mockUserContextValue.userProfile.celular,
        });
        expect(mockUserContextValue.updateUserProfile).toHaveBeenCalledWith({
          ...mockUserContextValue.userProfile,
          apellidos: mockUpdatedValues.apellidos,
        });

        expect(
          await findByText("Perfil actualizado exitosamente")
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it("should change the user's phone number only", async () => {
    supabase.from = jest.fn(() => ({
      update: mockPassUserUpdate,
      select: mockPassPhoneValidation,
    }));

    const { findByText, findByDisplayValue } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserProfileContext.Provider value={mockUserContextValue}>
          <EditProfileForm />
        </UserProfileContext.Provider>
      </AuthContext.Provider>
    );

    const phoneInput = await findByDisplayValue(
      mockUserContextValue.userProfile.celular
    );
    fireEvent.changeText(phoneInput, mockUpdatedValues.celular);

    const saveButton = await findByText("Guardar Cambios");

    act(() => {
      fireEvent.press(saveButton);
    });

    await waitFor(
      async () => {
        expect(mockPassUserUpdate).toHaveBeenCalledWith({
          nombres: mockUserContextValue.userProfile.nombres,
          apellidos: mockUserContextValue.userProfile.apellidos,
          celular: mockUpdatedValues.celular,
        });
        expect(mockUserContextValue.updateUserProfile).toHaveBeenCalledWith({
          ...mockUserContextValue.userProfile,
          celular: mockUpdatedValues.celular,
        });

        expect(
          await findByText("Perfil actualizado exitosamente")
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it("should display an error message if the phone number is already in use", async () => {
    supabase.from = jest.fn(() => ({
      update: mockFailUserUpdate,
      select: mockFailPhoneValidation,
    }));

    const { findByText, findByDisplayValue } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserProfileContext.Provider
          value={{
            ...mockUserContextValue,
            updateUserProfile: mockFailPhoneValidation,
          }}
        >
          <EditProfileForm />
        </UserProfileContext.Provider>
      </AuthContext.Provider>
    );

    const phoneInput = await findByDisplayValue(
      mockUserContextValue.userProfile.celular
    );
    fireEvent.changeText(phoneInput, mockUpdatedValues.celular);

    const saveButton = await findByText("Guardar Cambios");

    act(() => {
      fireEvent.press(saveButton);
    });

    waitFor(
      async () => {
        expect(
          await findByText("El número de celular ingresado ya está en uso")
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it("should display an error message if the user update fails", async () => {
    supabase.from = jest.fn(() => ({
      update: mockFailUserUpdate,
      select: mockFailPhoneValidation,
    }));

    const { findByText, findByDisplayValue } = render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <UserProfileContext.Provider
          value={{
            ...mockUserContextValue,
            updateUserProfile: mockFailUserUpdate,
          }}
        >
          <EditProfileForm />
        </UserProfileContext.Provider>
      </AuthContext.Provider>
    );

    const phoneInput = await findByDisplayValue(
      mockUserContextValue.userProfile.celular
    );
    fireEvent.changeText(phoneInput, mockUpdatedValues.celular);

    const saveButton = await findByText("Guardar Cambios");

    act(() => {
      fireEvent.press(saveButton);
    });

    waitFor(
      async () => {
        expect(await findByText("Error al actualizar perfil")).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });
});
