import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import FormComponent from "@/components/FormComponent";
import { FIELD_TYPES } from "@/customConstants";
import { FormFieldType } from "@/interfaces";

const fields: FormFieldType[] = [
  { name: "first_name", label: "First Name", isRequired: true, type: FIELD_TYPES.textfield },
  { name: "email", label: "Email", isRequired: true, type: FIELD_TYPES.email },
  { name: "password", label: "Password", isRequired: true, type: FIELD_TYPES.password },
  { name: "confirm_password", label: "Confirm Password", isRequired: true, type: FIELD_TYPES.password },
];

const show = (onHandleSubmit = jest.fn()) => {
  render(
    <FormComponent
      fields={fields}
      submitLabel="Register"
      onHandleSubmit={onHandleSubmit}
    />,
  );
  return onHandleSubmit;
};

/** Every field filled in one go, the way autofill does it. */
const autofill = async () => {
  const inputs = await Promise.all(
    [
      ["First Name", "Ada"],
      ["Email", "ada@example.test"],
      ["Password", "hunter2hunter2"],
      ["Confirm Password", "hunter2hunter2"],
    ].map(async ([label, value]) => [await screen.findByLabelText(label), value] as const),
  );

  act(() => {
    inputs.forEach(([input, value]) =>
      fireEvent.change(input, { target: { value } }),
    );
  });
};

describe("FormComponent", () => {
  it("keeps every field when they are all filled at once", async () => {
    // Honest about what this does and does not prove. `handleOnChange` used to
    // spread `formData` from the closure instead of the updater form, which is
    // a real defect - two changes before a re-render read the same stale
    // snapshot and the second drops the first. It is fixed.
    //
    // This test does not catch it. React flushes between dispatched events even
    // inside a single `act`, so the handler gets a fresh closure every time and
    // the broken version passes this too - verified by reintroducing the bug.
    // What it does pin is the submit contract: every filled field reaches the
    // caller, which is worth having on its own.
    const onSubmit = show();

    await autofill();
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    expect(onSubmit.mock.calls[0][0]).toEqual({
      first_name: "Ada",
      email: "ada@example.test",
      password: "hunter2hunter2",
      confirm_password: "hunter2hunter2",
    });
  });

  it("still refuses a form with nothing in it", async () => {
    const onSubmit = show();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText(/form can't be empty/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("names the fields that are still missing", async () => {
    const onSubmit = show();

    fireEvent.change(await screen.findByLabelText("First Name"), {
      target: { value: "Ada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText(/email can't be empty/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("refuses when the two passwords differ", async () => {
    const onSubmit = show();

    fireEvent.change(await screen.findByLabelText("First Name"), { target: { value: "Ada" } });
    fireEvent.change(await screen.findByLabelText("Email"), { target: { value: "ada@example.test" } });
    fireEvent.change(await screen.findByLabelText("Password"), { target: { value: "one" } });
    fireEvent.change(await screen.findByLabelText("Confirm Password"), { target: { value: "two" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => expect(screen.getByText(/doesn't match/i)).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
