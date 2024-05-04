jest.mock("expo-router");
jest.mock("../../../src/supabase");

import { useRouter } from "expo-router";
import React from "react";

import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { supabase } from "../../../src/supabase";
import PasswordRecoveryForm from "./PasswordRecoveryForm";

const pushMock = jest.fn();

const updateUserMock = jest.fn(() => ({
  data: {},
  error: null,
}));

const passwords = {
  correct: "Password1",
  incorrect: "password",
};

describe("Password recovery form", () => {
  it("should render correctly", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
    });

    const { findByText, findByPlaceholderText } = render(
      <PasswordRecoveryForm />
    );

    await findByText("Restablece tu contraseña");
    await findByPlaceholderText("Nueva contraseña");
    await findByPlaceholderText("Vuelve a escribir la contraseña");
    await findByText("Restablecer");
  });

  it("should show error modal when passwords do not match", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
    });

    const { findByText, findByPlaceholderText, getByText } = render(
      <PasswordRecoveryForm />
    );

    const passwordInput = await findByPlaceholderText("Nueva contraseña");
    const passwordConfirmationInput = await findByPlaceholderText(
      "Vuelve a escribir la contraseña"
    );

    const resetButton = getByText("Restablecer");

    fireEvent.changeText(passwordInput, passwords.correct);
    fireEvent.changeText(passwordConfirmationInput, passwords.incorrect);

    act(() => {
      fireEvent.press(resetButton);
    });

    await findByText("Las contraseñas no coinciden");
  });

  it("should show error modal due to invalid password", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
    });

    const { findByText, findByPlaceholderText, getByText } = render(
      <PasswordRecoveryForm />
    );

    const passwordInput = await findByPlaceholderText("Nueva contraseña");
    const passwordConfirmationInput = await findByPlaceholderText(
      "Vuelve a escribir la contraseña"
    );

    const resetButton = getByText("Restablecer");

    fireEvent.changeText(passwordInput, passwords.incorrect);
    fireEvent.changeText(passwordConfirmationInput, passwords.incorrect);

    act(() => {
      fireEvent.press(resetButton);
    });

    await findByText(
      "La contraseña debe tener entre 8 y 15 caracteres, una letra mayúscula, un número y ningún espacio."
    );
  });

  it("should call updateUser with updated password", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
    });

    supabase.auth.updateUser = updateUserMock;

    const { findByText, findByPlaceholderText, getByText } = render(
      <PasswordRecoveryForm />
    );

    const passwordInput = await findByPlaceholderText("Nueva contraseña");
    const passwordConfirmationInput = await findByPlaceholderText(
      "Vuelve a escribir la contraseña"
    );

    const resetButton = getByText("Restablecer");

    fireEvent.changeText(passwordInput, passwords.correct);
    fireEvent.changeText(passwordConfirmationInput, passwords.correct);

    act(() => {
      fireEvent.press(resetButton);
    });

    expect(updateUserMock).toHaveBeenCalledWith({
      password: passwords.correct,
    });
    waitFor(
      () => {
        expect(pushMock).toHaveBeenCalledWith("/users/login");
      },
      { timeout: 3000 }
    );
  });
});
