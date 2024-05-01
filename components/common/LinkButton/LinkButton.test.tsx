import React from "react";
import { render } from "@testing-library/react-native";

import LinkButton from "./linkButton";

describe("<LinkButton />", () => {
  it("renders correctly", () => {
    const { toJSON } = render(
      <LinkButton handleNavigate={() => {}} text="Navigate" />
    );
  });
});
