import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhotoUploadAction from "@/components/PhotoUploadAction";
import { UPLOAD_VARIANT, UploadVariant } from "@/interfaces/photos";

const file = (name = "dinner.jpg") =>
  new File(["binary"], name, { type: "image/jpeg" });

const pickerIn = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe("PhotoUploadAction", () => {
  const variants = Object.values(UPLOAD_VARIANT) as UploadVariant[];

  it("hands the chosen file to the caller", async () => {
    const onSelect = jest.fn();
    const { container } = render(
      <PhotoUploadAction onSelect={onSelect} label="Add your photo" />,
    );

    await userEvent.upload(pickerIn(container), file());

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it.each(variants)("opens the camera directly in the %s variant", (variant) => {
    // The whole point is one tap: the person who can take the photo is sitting
    // at the table. Every entry point shares this because they share the input -
    // four copies of it is how one of them quietly stops doing it.
    const { container } = render(
      <PhotoUploadAction
        variant={variant}
        onSelect={jest.fn()}
        label="Add your photo"
      />,
    );

    const picker = pickerIn(container);

    expect(picker).toHaveAttribute("capture", "environment");
    expect(picker).toHaveAttribute("accept", "image/*");
  });

  it("lets the same file be chosen twice", async () => {
    // The input keeps its value, so without a reset a second attempt at the same
    // photo fires no change event at all - which reads as the button being dead.
    const onSelect = jest.fn();
    const { container } = render(
      <PhotoUploadAction onSelect={onSelect} label="Add your photo" />,
    );

    await userEvent.upload(pickerIn(container), file("same.jpg"));
    await userEvent.upload(pickerIn(container), file("same.jpg"));

    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("says so and refuses a second tap while a file is in flight", () => {
    render(
      <PhotoUploadAction
        onSelect={jest.fn()}
        label="Add your photo"
        uploadingLabel="Uploading…"
        uploading
      />,
    );

    expect(screen.getByRole("button", { name: "Uploading…" })).toBeDisabled();
  });

  it("keeps its label while uploading if no progress label was given", () => {
    render(
      <PhotoUploadAction onSelect={jest.fn()} label="Add your photo" uploading />,
    );

    expect(screen.getByRole("button", { name: "Add your photo" })).toBeDisabled();
  });

  it("carries no icon inline, where it sits inside a sentence", () => {
    // The link variant reads as part of the disclosure line; an icon in the
    // middle of a sentence is punctuation nobody asked for.
    const { container } = render(
      <PhotoUploadAction
        variant={UPLOAD_VARIANT.link}
        onSelect={jest.fn()}
        label="Add your photo"
      />,
    );

    expect(container.querySelector("svg")).toBeNull();
  });

  it("carries an icon where it stands on its own", () => {
    const { container } = render(
      <PhotoUploadAction
        variant={UPLOAD_VARIANT.chip}
        onSelect={jest.fn()}
        label="Add your photo"
      />,
    );

    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("keeps the picker out of the tab order", () => {
    // The button is the control; a bare file input beside it is a second tab
    // stop that looks like nothing.
    const { container } = render(
      <PhotoUploadAction onSelect={jest.fn()} label="Add your photo" />,
    );

    expect(pickerIn(container)).toHaveAttribute("tabindex", "-1");
  });
});
