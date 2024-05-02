import React from "react";
import { render } from "@testing-library/react-native";

import ExitButton from "./ExitButton";

describe("<LinkButton />", () => {
  it("renders correctly", () => {
    const { toJSON } = render(<ExitButton handlePress={() => {}} />);
  });
});
