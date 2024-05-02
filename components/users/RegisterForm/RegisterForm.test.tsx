import { fireEvent, render } from "@testing-library/react-native";

import RegisterForm from "./RegisterForm";

describe("Test registration form", () => {
  it("should render correctly", async () => {
    const { findByText } = render(<RegisterForm />);
    expect(await findByText("Registrarse")).toBeTruthy();
  });

  it("should take input", async () => {
    const { findByText, findByTestId } = render(<RegisterForm />);
    expect(await findByText("Registrarse")).toBeTruthy();

    const firstNameInput = await findByTestId("firstNameInput");
    expect(firstNameInput).toBeTruthy();

    fireEvent.changeText(firstNameInput, "John");
    expect(firstNameInput.props.value).toBe("John");
    console.log("First name input: ", firstNameInput.props.value);

    const lastNameInput = await findByTestId("lastNameInput");
    expect(lastNameInput).toBeTruthy();

    fireEvent.changeText(lastNameInput, "Doe");
    expect(lastNameInput.props.value).toBe("Doe");
    console.log("Last name input: ", lastNameInput.props.value);

    const emailInput = await findByTestId("emailInput");
    expect(emailInput).toBeTruthy();

    fireEvent.changeText(emailInput, "johndoe@mail.com");
    expect(emailInput.props.value).toBe("johndoe@mail.com");
    console.log("Email input: ", emailInput.props.value);

    const passwordInput = await findByTestId("passwordInput");
    expect(passwordInput).toBeTruthy();

    fireEvent.changeText(passwordInput, "password");
    expect(passwordInput.props.value).toBe("password");
    console.log("Password input: ", passwordInput.props.value);

    const phoneInput = await findByTestId("phoneInput");
    expect(phoneInput).toBeTruthy();

    fireEvent.changeText(phoneInput, "1234567890");
    expect(phoneInput.props.value).toBe("1234567890");
    console.log("Phone input: ", phoneInput.props.value);
  });
});
