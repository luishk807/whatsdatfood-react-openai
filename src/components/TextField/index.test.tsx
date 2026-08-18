import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextField from "@/components/TextField";

describe("TextField", () => {
  it("associates its label with its input", () => {
    // htmlFor was hardcoded to "inputfield" while the input's id is the field
    // name, so no label in the app pointed at anything: every form field,
    // including every password box, was unlabelled to a screen reader.
    render(<TextField label="Email" name="email" onChange={jest.fn()} />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
  });

  it("reports what was typed", async () => {
    const onChange = jest.fn();
    render(<TextField label="Email" name="email" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Email"), "hi");

    expect(onChange).toHaveBeenLastCalledWith("hi");
  });

  it("is controlled from the first render", () => {
    // value={undefined} makes React treat the input as uncontrolled and then
    // warn when the first keystroke makes it controlled.
    render(<TextField label="Email" name="email" onChange={jest.fn()} />);

    expect(screen.getByLabelText("Email")).toHaveValue("");
  });

  it("shows a default that arrives after the first render", () => {
    // The settings form renders before the user has been fetched, so the
    // default always arrives late. It used to be read once, at mount.
    const { rerender } = render(
      <TextField label="Email" name="email" onChange={jest.fn()} />,
    );

    expect(screen.getByLabelText("Email")).toHaveValue("");

    rerender(
      <TextField
        label="Email"
        name="email"
        defaultValue="someone@example.test"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Email")).toHaveValue("someone@example.test");
  });

  it("uses the label as a placeholder instead when asked", () => {
    render(
      <TextField label="Email" name="email" isPlaceholder onChange={jest.fn()} />,
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });
});
