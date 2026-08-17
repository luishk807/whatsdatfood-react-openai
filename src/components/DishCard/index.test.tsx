import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DishCard from "@/components/DishCard";
import { MenuItemType, MenuItemPhoto } from "@/interfaces/restaurants";
import { DishScore } from "@/interfaces/ranking";
import { VOTE, RANKING } from "@/customConstants/ranking";
import { DISH_LABELS, RANKING_LABELS } from "@/customConstants/labels";

const photo = (url: string): MenuItemPhoto => ({ url_m: url }) as MenuItemPhoto;

const dish = (extra: Partial<MenuItemType> = {}): MenuItemType => ({
  id: 42,
  name: "Single Steak",
  description: "A steak, singular",
  category: "Mains",
  top_choice: false,
  price: 24.5,
  ...extra,
});

const score = (extra: Partial<DishScore> = {}): DishScore => ({
  id: 42,
  score: 3.2,
  average: 3.3,
  voteCount: 2,
  isRanked: false,
  ...extra,
});

describe("DishCard", () => {
  it("shows the dish name and a formatted price", () => {
    render(<DishCard item={dish()} />);

    expect(screen.getByText("Single Steak")).toBeInTheDocument();
    expect(screen.getByText("$24.50")).toBeInTheDocument();
  });

  it("omits the price rather than printing $0.00 when there is none", () => {
    render(<DishCard item={dish({ price: undefined })} />);

    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
  });

  it("shows a vote count instead of a rank while votes are thin", () => {
    render(<DishCard item={dish()} score={score({ voteCount: 3 })} />);

    expect(
      screen.getByText(RANKING_LABELS.voteCount(3)),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(RANKING_LABELS.topStripTitle),
    ).not.toBeInTheDocument();
  });

  it("badges the dish only once it is genuinely ranked", () => {
    render(
      <DishCard
        item={dish()}
        score={score({ voteCount: RANKING.MIN_VOTES_TO_RANK, isRanked: true })}
      />,
    );

    expect(screen.getByText(RANKING_LABELS.topStripTitle)).toBeInTheDocument();
  });

  it("marks an AI suggestion as unverified rather than ranked", () => {
    render(<DishCard item={dish({ top_choice: true })} />);

    expect(
      screen.getByText(DISH_LABELS.popularUnverified),
    ).toBeInTheDocument();
  });

  it("renders the photo when the menu carried one", () => {
    render(
      <DishCard
        item={dish({ images: [photo("https://example.test/steak.jpg")] })}
      />,
    );

    expect(screen.getByAltText("Single Steak")).toHaveAttribute(
      "src",
      "https://example.test/steak.jpg",
    );
  });

  it("offers an upload when there is no photo yet", async () => {
    const onAddPhoto = jest.fn();
    const { container } = render(
      <DishCard item={dish()} onAddPhoto={onAddPhoto} />,
    );

    // The tile is the upload funnel, so it carries the invitation rather
    // than a "no photo" apology - a menu with few photos was otherwise a
    // screen of identical grey boxes saying nothing useful.
    expect(
      screen.getByRole("button", { name: DISH_LABELS.addPhoto }),
    ).toBeInTheDocument();
    expect(screen.queryByText(DISH_LABELS.noPhoto)).not.toBeInTheDocument();

    const picker = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(
      picker,
      new File(["b"], "dinner.jpg", { type: "image/jpeg" }),
    );

    expect(onAddPhoto).toHaveBeenCalledTimes(1);
    expect(onAddPhoto.mock.calls[0][0]).toMatchObject({ id: 42 });
    expect(onAddPhoto.mock.calls[0][1]).toBeInstanceOf(File);
  });

  it("does not open the detail sheet from an empty tile", () => {
    // The empty tile carries the upload button; a button cannot be nested
    // inside another button, and tapping it should not open an empty sheet.
    const onOpen = jest.fn();
    render(<DishCard item={dish()} onOpen={onOpen} onAddPhoto={jest.fn()} />);

    expect(
      screen.queryByRole("button", { name: "Single Steak" }),
    ).not.toBeInTheDocument();
  });

  it("credits the uploader of a community photo", () => {
    render(
      <DishCard
        item={dish({
          images: [
            {
              url_m: "https://example.test/steak.jpg",
              source: "community",
              owner: "luis",
            } as MenuItemPhoto,
          ],
        })}
      />,
    );

    expect(screen.getByText(DISH_LABELS.photoBy("luis"))).toBeInTheDocument();
  });

  it("shows progress on the dish being uploaded", () => {
    render(<DishCard item={dish()} onAddPhoto={jest.fn()} uploadingDishId={42} />);

    expect(
      screen.getByRole("button", { name: DISH_LABELS.uploading }),
    ).toBeDisabled();
  });

  it("passes the dish back with the vote", async () => {
    const onVote = jest.fn();
    render(<DishCard item={dish()} canVote onVote={onVote} />);

    await userEvent.click(screen.getByLabelText(DISH_LABELS.recommend));

    expect(onVote).toHaveBeenCalledWith(dish(), VOTE.up);
  });

  it("carries one vote control, not two", () => {
    // Two circles on every tile scattered dozens of tiny controls across a
    // menu and competed with the photographs. The down vote lives in the
    // detail sheet, where somebody has stopped to look at one dish.
    render(<DishCard item={dish()} canVote onVote={jest.fn()} />);

    expect(screen.getByLabelText(DISH_LABELS.recommend)).toBeInTheDocument();
    expect(screen.queryByLabelText(DISH_LABELS.voteDown)).not.toBeInTheDocument();
  });

  it("says how many people have voted", () => {
    render(
      <DishCard
        item={dish()}
        score={{ id: 1, score: 4, average: 4, voteCount: 24, isRanked: true }}
      />,
    );

    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("opens the detail view when a photo is tapped", async () => {
    const onOpen = jest.fn();
    const item = dish({ images: [photo("https://example.test/steak.jpg")] });
    render(<DishCard item={item} onOpen={onOpen} />);

    await userEvent.click(screen.getByRole("button", { name: "Single Steak" }));

    expect(onOpen).toHaveBeenCalledWith(item);
  });
});
