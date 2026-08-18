import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DishPhoto from "@/components/DishPhoto";
import { DISH_LABELS } from "@/customConstants/labels";
import { IMAGE_SOURCE } from "@/customConstants/images";

const file = (name = "dinner.jpg") =>
  new File(["binary"], name, { type: "image/jpeg" });

const pickerFor = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe("DishPhoto", () => {
  it("shows the empty state when there is no photo", () => {
    render(<DishPhoto />);

    expect(screen.getByText(DISH_LABELS.noPhoto)).toBeInTheDocument();
  });

  it("renders the photo when there is one", () => {
    render(<DishPhoto url="https://example.test/a.jpg" alt="Short rib" />);

    expect(screen.getByAltText("Short rib")).toHaveAttribute(
      "src",
      "https://example.test/a.jpg",
    );
  });

  it("falls back to the empty state when the photo fails to load", async () => {
    // Third-party hosts return 403 often enough that this is a normal case.
    render(<DishPhoto url="https://example.test/gone.jpg" alt="Short rib" />);

    // fireEvent wraps the state update in act, unlike a raw dispatchEvent.
    fireEvent.error(screen.getByAltText("Short rib"));

    expect(await screen.findByText(DISH_LABELS.photoFailed)).toBeInTheDocument();
  });

  it("offers the picker only when an upload handler is given", () => {
    const { rerender, container } = render(<DishPhoto />);
    expect(screen.queryByText(DISH_LABELS.beFirst)).not.toBeInTheDocument();

    rerender(<DishPhoto onAddPhoto={jest.fn()} />);
    expect(screen.getByText(DISH_LABELS.beFirst)).toBeInTheDocument();
    expect(pickerFor(container)).toBeInTheDocument();
  });

  it("names the absence and asks, rather than looking broken", () => {
    // Dish photography is uploads only, so on most dishes this tile is the
    // whole menu row. A silent grey box reads as a failed request.
    render(<DishPhoto onAddPhoto={jest.fn()} />);

    expect(screen.getByText(DISH_LABELS.noPhoto)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: DISH_LABELS.beFirst }),
    ).toBeInTheDocument();
  });

  it("shortens the ask on a small tile", () => {
    // "Be the first to add a photo" wraps to four lines in a 140px card.
    render(<DishPhoto onAddPhoto={jest.fn()} compact />);

    expect(screen.getByText(DISH_LABELS.addPhotoShort)).toBeInTheDocument();
    expect(screen.queryByText(DISH_LABELS.beFirst)).not.toBeInTheDocument();
  });

  it("never renders generic imagery as a photo of the dish", () => {
    // Cuisine tiles and marketing panels illustrate an idea. Showing one under
    // a restaurant's name is the exact confusion the source split exists to
    // prevent.
    render(
      <DishPhoto
        url="https://example.test/generic-noodles.jpg"
        alt="Noodles"
        source={IMAGE_SOURCE.generic}
        onAddPhoto={jest.fn()}
      />,
    );

    expect(screen.queryByAltText("Noodles")).not.toBeInTheDocument();
    expect(screen.getByText(DISH_LABELS.noPhoto)).toBeInTheDocument();
  });

  it("opens the camera directly on a phone", () => {
    const { container } = render(<DishPhoto onAddPhoto={jest.fn()} />);
    const picker = pickerFor(container);

    // The person who can take the photo is at the table; one tap matters.
    expect(picker).toHaveAttribute("capture", "environment");
    expect(picker).toHaveAttribute("accept", "image/*");
  });

  it("hands the chosen file to the caller", async () => {
    const onAddPhoto = jest.fn();
    const { container } = render(<DishPhoto onAddPhoto={onAddPhoto} />);

    await userEvent.upload(pickerFor(container), file());

    expect(onAddPhoto).toHaveBeenCalledTimes(1);
    expect(onAddPhoto.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it("shows progress and blocks a second tap while uploading", () => {
    render(<DishPhoto onAddPhoto={jest.fn()} uploading />);

    const button = screen.getByRole("button", { name: DISH_LABELS.uploading });
    expect(button).toBeDisabled();
  });

  it("credits the uploader on a community photo", () => {
    render(
      <DishPhoto
        url="https://example.test/a.jpg"
        alt="Short rib"
        source={IMAGE_SOURCE.community}
        credit="luis"
      />,
    );

    expect(screen.getByText(DISH_LABELS.photoBy("luis"))).toBeInTheDocument();
    expect(screen.getByText(DISH_LABELS.communityPhoto)).toBeInTheDocument();
  });

  it("labels a stock photo as stock and credits nobody", () => {
    render(
      <DishPhoto
        url="https://example.test/a.jpg"
        alt="Short rib"
        source={IMAGE_SOURCE.stock}
      />,
    );

    expect(screen.getByText(DISH_LABELS.stockPhoto)).toBeInTheDocument();
    expect(screen.queryByText(/Photo by/)).not.toBeInTheDocument();
  });

  describe("reporting that there is nothing to show", () => {
    it("tells the caller when the host refuses the photo", async () => {
      const onUnavailable = jest.fn();
      render(
        <DishPhoto
          url="https://example.test/gone.jpg"
          alt="Short rib"
          onUnavailable={onUnavailable}
        />,
      );

      expect(onUnavailable).not.toHaveBeenCalled();

      fireEvent.error(screen.getByAltText("Short rib"));

      expect(await screen.findByText(DISH_LABELS.photoFailed)).toBeVisible();
      expect(onUnavailable).toHaveBeenCalledTimes(1);
    });

    it("tells the caller when there was never a photo", () => {
      const onUnavailable = jest.fn();
      render(<DishPhoto onUnavailable={onUnavailable} />);

      expect(onUnavailable).toHaveBeenCalledTimes(1);
    });

    it("does not fire again when the caller passes a fresh callback", () => {
      // A hook returning a new function identity each render, used as an effect
      // dependency, is a request loop - it has already hit three components
      // here. An inline arrow at the call site is exactly that shape.
      const onUnavailable = jest.fn();
      const { rerender } = render(<DishPhoto onUnavailable={onUnavailable} />);

      rerender(<DishPhoto onUnavailable={() => onUnavailable()} />);
      rerender(<DishPhoto onUnavailable={() => onUnavailable()} />);

      expect(onUnavailable).toHaveBeenCalledTimes(1);
    });

    it("stays quiet while the photo is fine", () => {
      const onUnavailable = jest.fn();
      render(
        <DishPhoto
          url="https://example.test/a.jpg"
          alt="Short rib"
          onUnavailable={onUnavailable}
        />,
      );

      expect(onUnavailable).not.toHaveBeenCalled();
    });
  });
});
