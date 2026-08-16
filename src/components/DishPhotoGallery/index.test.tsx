import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DishPhotoGallery from "@/components/DishPhotoGallery";
import { MenuItemPhoto } from "@/interfaces/restaurants";
import { DISH_LABELS } from "@/customConstants/labels";
import { REPORT_REASONS } from "@/customConstants/images";

const photo = (extra: Partial<MenuItemPhoto> = {}): MenuItemPhoto =>
  ({
    id: 1,
    url_m: "https://example.test/a.jpg",
    name: "Short rib",
    owner: "luis",
    source: "community",
    is_primary: false,
    helpful_count: 0,
    ...extra,
  }) as MenuItemPhoto;

describe("DishPhotoGallery", () => {
  it("invites the first photo when there are none", () => {
    render(<DishPhotoGallery photos={[]} />);

    expect(screen.getByText(DISH_LABELS.noPhotosYet)).toBeInTheDocument();
  });

  it("shows every photo, not only the hero", () => {
    render(
      <DishPhotoGallery
        photos={[
          photo({ id: 1, is_primary: true }),
          photo({ id: 2, url_m: "https://example.test/b.jpg" }),
        ]}
      />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("marks which photo the menu is showing", () => {
    render(<DishPhotoGallery photos={[photo({ is_primary: true })]} />);

    expect(screen.getByText(DISH_LABELS.heroPhoto)).toBeInTheDocument();
  });

  it("credits the uploader", () => {
    render(<DishPhotoGallery photos={[photo({ owner: "luis" })]} />);

    expect(screen.getByText(DISH_LABELS.photoBy("luis"))).toBeInTheDocument();
  });

  it("labels an unattributed photo as stock", () => {
    render(<DishPhotoGallery photos={[photo({ owner: undefined })]} />);

    expect(screen.getByText(DISH_LABELS.stockPhoto)).toBeInTheDocument();
  });

  it("sends a helpful vote", async () => {
    const onVote = jest.fn();
    render(
      <DishPhotoGallery
        photos={[photo({ id: 7 })]}
        canParticipate
        onVote={onVote}
      />,
    );

    await userEvent.click(screen.getByLabelText(DISH_LABELS.markHelpful));

    expect(onVote).toHaveBeenCalledWith("7");
  });

  it("shows the helpful count", () => {
    render(<DishPhotoGallery photos={[photo({ helpful_count: 12 })]} />);

    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("cannot vote twice on the same photo", async () => {
    const onVote = jest.fn();
    render(
      <DishPhotoGallery
        photos={[photo({ id: 7 })]}
        canParticipate
        hasVoted={() => true}
        onVote={onVote}
      />,
    );

    const button = screen.getByLabelText(DISH_LABELS.markedHelpful);
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onVote).not.toHaveBeenCalled();
  });

  it("cannot vote or report while signed out", () => {
    render(<DishPhotoGallery photos={[photo()]} canParticipate={false} />);

    expect(screen.getByLabelText(DISH_LABELS.markHelpful)).toBeDisabled();
    expect(screen.getByLabelText(DISH_LABELS.reportPhoto)).toBeDisabled();
    expect(screen.getByLabelText(DISH_LABELS.markHelpful)).toHaveAttribute(
      "title",
      DISH_LABELS.signInToHelp,
    );
  });

  it("asks for a reason before reporting", async () => {
    const onReport = jest.fn();
    render(
      <DishPhotoGallery
        photos={[photo({ id: 9 })]}
        canParticipate
        onReport={onReport}
      />,
    );

    // Reporting is never one tap: a stray tap should not flag someone's photo.
    await userEvent.click(screen.getByLabelText(DISH_LABELS.reportPhoto));
    expect(screen.getByText(DISH_LABELS.reportPrompt)).toBeInTheDocument();
    expect(onReport).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText(REPORT_REASONS[0].label));
    expect(onReport).toHaveBeenCalledWith("9", REPORT_REASONS[0].value);
  });

  it("closes the reason list on cancel without reporting", async () => {
    const onReport = jest.fn();
    render(
      <DishPhotoGallery photos={[photo()]} canParticipate onReport={onReport} />,
    );

    await userEvent.click(screen.getByLabelText(DISH_LABELS.reportPhoto));
    await userEvent.click(screen.getByText(DISH_LABELS.cancel));

    expect(screen.queryByText(DISH_LABELS.reportPrompt)).not.toBeInTheDocument();
    expect(onReport).not.toHaveBeenCalled();
  });

  it("offers an upload only when one is possible", async () => {
    const onAddPhoto = jest.fn();
    const { rerender, container } = render(<DishPhotoGallery photos={[]} />);
    expect(screen.queryByText(DISH_LABELS.addPhoto)).not.toBeInTheDocument();

    rerender(<DishPhotoGallery photos={[]} onAddPhoto={onAddPhoto} />);
    const picker = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    expect(picker).toHaveAttribute("capture", "environment");
    await userEvent.upload(
      picker,
      new File(["b"], "d.jpg", { type: "image/jpeg" }),
    );
    expect(onAddPhoto).toHaveBeenCalledTimes(1);
  });
});
