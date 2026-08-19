import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthField from "@/components/AuthField";
import { AUTH_LABELS } from "@/customConstants/labels";

describe("AuthField", () => {
  it("labels its input", () => {
    render(
      <AuthField id="email" label="Email" value="" onChange={jest.fn()} />,
    );

    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("reports what was typed", async () => {
    const onChange = jest.fn();
    render(
      <AuthField id="email" label="Email" value="" onChange={onChange} />,
    );

    await userEvent.type(screen.getByLabelText("Email"), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("hides a password until asked", async () => {
    // Typed one-handed, in a dim room, on a phone. Hiding it by default
    // without offering to show it is the wrong trade.
    render(
      <AuthField
        id="password"
        type="password"
        label="Password"
        revealable
        value="hunter2"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );

    await userEvent.click(screen.getByRole("button", { name: AUTH_LABELS.show }));

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });

  it("offers no reveal on a field that is not a password", () => {
    render(
      <AuthField
        id="email"
        label="Email"
        revealable
        value=""
        onChange={jest.fn()}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("describes the field by its hint", () => {
    render(
      <AuthField
        id="password"
        type="password"
        label="Password"
        hint="At least 8 characters"
        value=""
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "At least 8 characters",
    );
  });

  it("replaces the hint with the error rather than stacking both", () => {
    // Two lines of small text under one box, one of them now wrong, is how a
    // form starts arguing with itself.
    render(
      <AuthField
        id="password"
        type="password"
        label="Password"
        hint="At least 8 characters"
        error="Password must be at least 8 characters"
        value="short"
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.queryByText("At least 8 characters"),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
