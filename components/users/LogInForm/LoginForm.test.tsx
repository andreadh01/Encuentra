jest.mock("expo-router");
jest.mock("../../../src/supabase");

import { useRouter } from "expo-router";
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";

import { supabase } from "../../../src/supabase";

import LogInForm from "./LogInForm";
import { AuthError } from "@supabase/supabase-js";

const pushMock = jest.fn();
const replaceMock = jest.fn();
const signInWithPasswordMock = jest.fn(
  ({ email, password }: { email: string; password: string }) => {
    return new Promise((r) => r({ error: null }));
  }
);

const supabaseQueryMock = jest.fn(() => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(() => ({
        data: { email: credentials.email },
        error: null,
      })),
    })),
  })),
}));

const incorrectSignInWithPasswordMock = jest.fn(
  ({ email, password }: { email: string; password: string }) => {
    return new Promise((r) =>
      r({
        error: new AuthError("El correo o celular no coinciden"),
        data: {
          user: null,
          session: null,
        },
      })
    );
  }
);

const credentials = {
  phone: "1234567890",
  email: "johndoe@mail.com",
  password: "password",
};

const incorrectCredentials = {
  phone: "1234567390",
  email: "johndoe1@mail.com",
  password: "passWord",
};

describe("Log in form", () => {
  it("should render correctly", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });

    supabase.auth.signInWithPassword = signInWithPasswordMock;

    const { findByText, findByPlaceholderText } = render(<LogInForm />);

    const emailInput = await findByPlaceholderText(
      "Correo electrónico o celular"
    );
    expect(emailInput).toBeTruthy();

    const passwordInput = await findByPlaceholderText("Contraseña");
    expect(passwordInput).toBeTruthy();

    const loginButton = await findByText("Iniciar Sesión");
    expect(loginButton).toBeTruthy();
  });

  it("should call login function with email", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });

    supabase.auth.signInWithPassword = signInWithPasswordMock;

    const { findByText, findByPlaceholderText } = render(<LogInForm />);

    const emailInput = await findByPlaceholderText(
      "Correo electrónico o celular"
    );
    const passwordInput = await findByPlaceholderText("Contraseña");
    const loginButton = await findByText("Iniciar Sesión");

    fireEvent.changeText(emailInput, credentials.email);
    fireEvent.changeText(passwordInput, credentials.password);

    act(() => {
      fireEvent.press(loginButton);
    });

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: credentials.email,
      password: credentials.password,
    });

    waitFor(
      () => {
        expect(replaceMock).toHaveBeenCalledWith("/events");
      },
      { timeout: 3000 }
    );
  });

  it("should call login function with phone", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });

    supabase.from = supabaseQueryMock;
    supabase.auth.signInWithPassword = signInWithPasswordMock;

    const { findByText, findByPlaceholderText } = render(<LogInForm />);

    const emailInput = await findByPlaceholderText(
      "Correo electrónico o celular"
    );
    const passwordInput = await findByPlaceholderText("Contraseña");
    const loginButton = await findByText("Iniciar Sesión");

    fireEvent.changeText(emailInput, credentials.phone);
    fireEvent.changeText(passwordInput, credentials.password);

    act(() => {
      fireEvent.press(loginButton);
    });

    expect(supabase.from).toHaveBeenCalled();
    waitFor(
      () => {
        expect(signInWithPasswordMock).toHaveBeenCalledWith({
          email: credentials.email,
          password: credentials.password,
        });
      },
      { timeout: 3000 }
    );

    waitFor(
      () => {
        expect(replaceMock).toHaveBeenCalledWith("/events");
      },
      { timeout: 3000 }
    );
  });

  it("should fail due to incorrect email", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });

    supabase.auth.signInWithPassword = incorrectSignInWithPasswordMock;

    const { findByText, findByPlaceholderText, queryByText } = render(
      <LogInForm />
    );

    const emailInput = await findByPlaceholderText(
      "Correo electrónico o celular"
    );
    const passwordInput = await findByPlaceholderText("Contraseña");
    const loginButton = await findByText("Iniciar Sesión");

    fireEvent.changeText(emailInput, incorrectCredentials.email);
    fireEvent.changeText(passwordInput, credentials.password);

    act(() => {
      fireEvent.press(loginButton);
    });

    waitFor(
      async () => {
        expect(replaceMock).not.toHaveBeenCalled();
        expect(
          await queryByText("El correo o celular no coinciden")
        ).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it("should fail due to incorrect phone number", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });

    supabase.from = supabaseQueryMock;
    supabase.auth.signInWithPassword = incorrectSignInWithPasswordMock;

    const { findByText, findByPlaceholderText, queryByText } = render(
      <LogInForm />
    );

    const emailInput = await findByPlaceholderText(
      "Correo electrónico o celular"
    );
    const passwordInput = await findByPlaceholderText("Contraseña");
    const loginButton = await findByText("Iniciar Sesión");

    fireEvent.changeText(emailInput, incorrectCredentials.phone);
    fireEvent.changeText(passwordInput, credentials.password);

    act(() => {
      fireEvent.press(loginButton);
    });

    expect(supabase.from).toHaveBeenCalled();
    waitFor(
      async () => {
        expect(replaceMock).not.toHaveBeenCalled();
        expect(
          await queryByText("El correo o celular no coinciden")
        ).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it("should fail due to incorrect password", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });

    supabase.auth.signInWithPassword = incorrectSignInWithPasswordMock;

    const { findByText, findByPlaceholderText, queryByText } = render(
      <LogInForm />
    );

    const emailInput = await findByPlaceholderText(
      "Correo electrónico o celular"
    );
    const passwordInput = await findByPlaceholderText("Contraseña");
    const loginButton = await findByText("Iniciar Sesión");

    fireEvent.changeText(emailInput, incorrectCredentials.phone);
    fireEvent.changeText(passwordInput, credentials.password);

    act(() => {
      fireEvent.press(loginButton);
    });

    waitFor(
      async () => {
        expect(replaceMock).not.toHaveBeenCalled();
        expect(await queryByText("La contraseña es incorrecta")).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });
});
