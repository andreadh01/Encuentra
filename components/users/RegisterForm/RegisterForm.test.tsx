import { act, fireEvent, render } from "@testing-library/react-native";

import RegisterForm from "./RegisterForm";
import React from "react";

const elementTestIds = {
  firstNameInput: "RegisterForm:Input:FirstName",
  lastNameInput: "RegisterForm:Input:LastName",
  emailInput: "RegisterForm:Input:Email",
  passwordInput: "RegisterForm:Input:Password",
  phoneInput: "RegisterForm:Input:Phone",
  submitButton: "RegisterForm:Button:Submit",
  modalOne: "RegisterForm:ModalOne",
  modalOneMessage: "ModalOne:Text:Message",
  modalTwo: "RegisterForm:ModalTwo",
  modalTwoMessage: "ModalTwo:Text:Message",
};

const correctInputs = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@mail.com",
  password: "Password123",
  phone: "1234567890",
};

const incorrectInputs = {
  password: "password",
  email: "saulramos378@gmail.com",
  phone: "6624623692",
};

describe("Test registration form", () => {
  it("should render correctly", async () => {
    const { findByText } = render(<RegisterForm />);
    expect(await findByText("Registrarse")).toBeTruthy();
  });

  it("should not display the error modal", async () => {
    const { findByText, findByTestId, queryByTestId } = render(
      <RegisterForm />
    );
    expect(await findByText("Registrarse")).toBeTruthy();

    const firstNameInput = await findByTestId(elementTestIds.firstNameInput);
    expect(firstNameInput).toBeTruthy();

    fireEvent.changeText(firstNameInput, correctInputs.firstName);
    expect(firstNameInput.props.value).toBe(correctInputs.firstName);

    const lastNameInput = await findByTestId(elementTestIds.lastNameInput);
    expect(lastNameInput).toBeTruthy();

    fireEvent.changeText(lastNameInput, correctInputs.lastName);
    expect(lastNameInput.props.value).toBe(correctInputs.lastName);

    const emailInput = await findByTestId(elementTestIds.emailInput);
    expect(emailInput).toBeTruthy();

    fireEvent.changeText(emailInput, correctInputs.email);
    expect(emailInput.props.value).toBe(correctInputs.email);

    const passwordInput = await findByTestId(elementTestIds.passwordInput);
    expect(passwordInput).toBeTruthy();

    fireEvent.changeText(passwordInput, correctInputs.password);
    expect(passwordInput.props.value).toBe(correctInputs.password);

    const phoneInput = await findByTestId(elementTestIds.phoneInput);
    expect(phoneInput).toBeTruthy();

    fireEvent.changeText(phoneInput, correctInputs.phone);
    expect(phoneInput.props.value).toBe(correctInputs.phone);

    const registerButton = await findByTestId(elementTestIds.submitButton);
    expect(registerButton).toBeTruthy();

    fireEvent.press(registerButton);

    const modalOne = queryByTestId(elementTestIds.modalOne);
    expect(modalOne).toBeFalsy();

    const modalTwo = queryByTestId(elementTestIds.modalTwo);
    expect(modalTwo).toBeFalsy();

    // const modalMessage = await findByTestId("ModalOne:Text:Message");
    // console.log(modalMessage.props.children);
  });

  it("should display the error modal due to empty fields", async () => {
    const { findByTestId, queryByTestId } = render(<RegisterForm />);

    const registerButton = await findByTestId(elementTestIds.submitButton);
    expect(registerButton).toBeTruthy();

    fireEvent.press(registerButton);

    const modalOne = queryByTestId(elementTestIds.modalOne);
    expect(modalOne).toBeTruthy();

    const modalMessage = await findByTestId(elementTestIds.modalOneMessage);
    expect(modalMessage.props.children).toBe(
      "Por favor, complete todos los campos"
    );
  });

  it("should display the error modal due to invalid password", async () => {
    const { findByTestId, queryByTestId } = render(<RegisterForm />);

    const firstNameInput = await findByTestId(elementTestIds.firstNameInput);
    expect(firstNameInput).toBeTruthy();

    fireEvent.changeText(firstNameInput, correctInputs.firstName);
    expect(firstNameInput.props.value).toBe(correctInputs.firstName);

    const lastNameInput = await findByTestId(elementTestIds.lastNameInput);
    expect(lastNameInput).toBeTruthy();

    fireEvent.changeText(lastNameInput, correctInputs.lastName);
    expect(lastNameInput.props.value).toBe(correctInputs.lastName);

    const emailInput = await findByTestId(elementTestIds.emailInput);
    expect(emailInput).toBeTruthy();

    fireEvent.changeText(emailInput, correctInputs.email);
    expect(emailInput.props.value).toBe(correctInputs.email);

    const passwordInput = await findByTestId(elementTestIds.passwordInput);
    expect(passwordInput).toBeTruthy();

    fireEvent.changeText(passwordInput, incorrectInputs.password);
    expect(passwordInput.props.value).toBe(incorrectInputs.password);

    const phoneInput = await findByTestId(elementTestIds.phoneInput);
    expect(phoneInput).toBeTruthy();

    fireEvent.changeText(phoneInput, correctInputs.phone);
    expect(phoneInput.props.value).toBe(correctInputs.phone);

    const registerButton = await findByTestId(elementTestIds.submitButton);
    expect(registerButton).toBeTruthy();

    fireEvent.press(registerButton);

    const modalOne = queryByTestId(elementTestIds.modalOne);
    expect(modalOne).toBeTruthy();

    const modalMessage = await findByTestId(elementTestIds.modalOneMessage);
    expect(modalMessage.props.children).toBe(
      "La contraseña debe tener entre 8 y 15 caracteres, una letra mayúscula, un número y ningún espacio."
    );
  });

  it("should display the error modal due to email in use", async () => {
    const { findByTestId, queryByTestId } = render(<RegisterForm />);

    const firstNameInput = await findByTestId(elementTestIds.firstNameInput);
    expect(firstNameInput).toBeTruthy();

    fireEvent.changeText(firstNameInput, correctInputs.firstName);
    expect(firstNameInput.props.value).toBe(correctInputs.firstName);

    const lastNameInput = await findByTestId(elementTestIds.lastNameInput);
    expect(lastNameInput).toBeTruthy();

    fireEvent.changeText(lastNameInput, correctInputs.lastName);
    expect(lastNameInput.props.value).toBe(correctInputs.lastName);

    const emailInput = await findByTestId(elementTestIds.emailInput);
    expect(emailInput).toBeTruthy();

    fireEvent.changeText(emailInput, incorrectInputs.email);
    expect(emailInput.props.value).toBe(incorrectInputs.email);

    const passwordInput = await findByTestId(elementTestIds.passwordInput);
    expect(passwordInput).toBeTruthy();

    fireEvent.changeText(passwordInput, correctInputs.password);
    expect(passwordInput.props.value).toBe(correctInputs.password);

    const phoneInput = await findByTestId(elementTestIds.phoneInput);
    expect(phoneInput).toBeTruthy();

    fireEvent.changeText(phoneInput, correctInputs.phone);
    expect(phoneInput.props.value).toBe(correctInputs.phone);

    const registerButton = await findByTestId(elementTestIds.submitButton);
    expect(registerButton).toBeTruthy();

    await act(async () => {
      fireEvent.press(registerButton);

      await new Promise((r) => setTimeout(r, 2000));

      const modalTwo = queryByTestId(elementTestIds.modalTwo);
      expect(modalTwo).toBeTruthy();

      const modalMessage = await findByTestId(elementTestIds.modalTwoMessage);
      expect(modalMessage.props.children).toBe(
        "El correo ingresado ya está registrado"
      );
    });
  });

  it("should display the error modal due to email in use", async () => {
    const { findByTestId, queryByTestId } = render(<RegisterForm />);

    const firstNameInput = await findByTestId(elementTestIds.firstNameInput);
    expect(firstNameInput).toBeTruthy();

    fireEvent.changeText(firstNameInput, correctInputs.firstName);
    expect(firstNameInput.props.value).toBe(correctInputs.firstName);

    const lastNameInput = await findByTestId(elementTestIds.lastNameInput);
    expect(lastNameInput).toBeTruthy();

    fireEvent.changeText(lastNameInput, correctInputs.lastName);
    expect(lastNameInput.props.value).toBe(correctInputs.lastName);

    const emailInput = await findByTestId(elementTestIds.emailInput);
    expect(emailInput).toBeTruthy();

    fireEvent.changeText(emailInput, correctInputs.email);
    expect(emailInput.props.value).toBe(correctInputs.email);

    const passwordInput = await findByTestId(elementTestIds.passwordInput);
    expect(passwordInput).toBeTruthy();

    fireEvent.changeText(passwordInput, correctInputs.password);
    expect(passwordInput.props.value).toBe(correctInputs.password);

    const phoneInput = await findByTestId(elementTestIds.phoneInput);
    expect(phoneInput).toBeTruthy();

    fireEvent.changeText(phoneInput, incorrectInputs.phone);
    expect(phoneInput.props.value).toBe(incorrectInputs.phone);

    const registerButton = await findByTestId(elementTestIds.submitButton);
    expect(registerButton).toBeTruthy();

    await act(async () => {
      fireEvent.press(registerButton);

      await new Promise((r) => setTimeout(r, 2000));

      const modalTwo = queryByTestId(elementTestIds.modalTwo);
      expect(modalTwo).toBeTruthy();

      const modalMessage = await findByTestId(elementTestIds.modalTwoMessage);
      expect(modalMessage.props.children).toBe(
        "El número de teléfono ingresado ya está registrado"
      );
    });
  });
});
