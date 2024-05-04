jest.mock("expo-router");

import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";

import { fireEvent, render } from "@testing-library/react-native";
import VerificationCodeForm from "./VerificationCodeForm";

const submitOtpMock = jest.fn((code: string) => code === "123456");
const pushMock = jest.fn();
const searchParamsMock = {
  id: "1",
  email: "johndoe@mail.com",
  verificationType: "sign-up",
};

describe("OTP Code verification", () => {
  it("should render correctly", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
    });

    useLocalSearchParams.mockReturnValue(searchParamsMock);

    const { findByDisplayValue } = render(
      <VerificationCodeForm submitOtp={submitOtpMock} />
    );

    const codeInput = await findByDisplayValue("");
    expect(codeInput).toBeTruthy();
  });

  it("should enter OTP and validate", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
    });

    useLocalSearchParams.mockReturnValue(searchParamsMock);

    const { findByDisplayValue } = render(
      <VerificationCodeForm submitOtp={submitOtpMock} />
    );
    const codeInput = await findByDisplayValue("");

    fireEvent.changeText(codeInput, "123456");
    expect(codeInput.props.value).toBe("123456");
    expect(submitOtpMock).toHaveBeenCalled();
    expect(submitOtpMock).toHaveReturnedWith(true);
  });

  it("should enter OTP and fail validation", async () => {
    useRouter.mockReturnValue({
      push: pushMock,
    });

    useLocalSearchParams.mockReturnValue(searchParamsMock);

    const { findByDisplayValue } = render(
      <VerificationCodeForm submitOtp={submitOtpMock} />
    );
    const codeInput = await findByDisplayValue("");

    fireEvent.changeText(codeInput, "123457");
    expect(codeInput.props.value).toBe("123457");
    expect(submitOtpMock).toHaveBeenCalled();
    expect(submitOtpMock).toHaveReturnedWith(false);
  });
});
