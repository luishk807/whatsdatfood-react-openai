import { fireEvent, render, screen } from "@testing-library/react";
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

    // The count is on the thumb now, but the rule is unchanged: below the
    // threshold a dish gets a number, never a rank.
    expect(
      screen.getByRole("button", { name: DISH_LABELS.recommend }),
    ).toHaveTextContent("3");
    expect(
      screen.queryByText(RANKING_LABELS.topBadge),
    ).not.toBeInTheDocument();
  });

  it("badges the dish only once it is genuinely ranked", () => {
    render(
      <DishCard
        item={dish()}
        score={score({ voteCount: RANKING.MIN_VOTES_TO_RANK, isRanked: true })}
      />,
    );

    expect(screen.getByText(RANKING_LABELS.topBadge)).toBeInTheDocument();
  });

  it("does not badge an AI suggestion as popular at all", () => {
    // It used to badge this "Popular". A dish nobody has voted on is not
    // popular, and the badge was appearing on the same page whose heading said
    // there were no votes yet.
    render(<DishCard item={dish({ top_choice: true })} />);

    expect(
      screen.queryByText(RANKING_LABELS.topBadge),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Popular")).not.toBeInTheDocument();
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
      screen.getByRole("button", { name: DISH_LABELS.addPhotoShort }),
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

  it("shows the recommend share once enough people have voted", () => {
    // On the thumb rather than as its own sentence. Voting is the ranking
    // mechanism, so the number belongs on the control that produces it - a pale
    // icon in the corner of the card said nothing at all.
    const item = dish({
      ratings: [5, 5, 5, 5, 1].map((rating, index) => ({
        id: `${index}`,
        rating,
        user_id: index + 1,
      })),
    } as never);

    render(<DishCard item={item} />);

    expect(
      screen.getByRole("button", { name: DISH_LABELS.recommend }),
    ).toHaveTextContent("80%");
  });

  it("shows a bare count rather than a share while votes are thin", () => {
    // The threshold is the whole point: "100% recommend" from one person is a
    // lie with a number attached.
    render(
      <DishCard
        item={dish()}
        score={{ id: 1, score: 4, average: 4, voteCount: 2, isRanked: false }}
      />,
    );

    const vote = screen.getByRole("button", { name: DISH_LABELS.recommend });

    expect(vote).toHaveTextContent("2");
    expect(vote).not.toHaveTextContent("%");
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

  it("never prints a fabricated price", () => {
    // The AI extraction leaves price at zero across most of a menu, and
    // formatting that as $0.00 told the reader a $180 omakase was free.
    render(<DishCard item={dish({ price: 0 })} />);

    expect(screen.getByText(DISH_LABELS.priceUnavailable)).toBeInTheDocument();
    expect(screen.queryByText(/\$0\.00/)).not.toBeInTheDocument();
  });

  it("prints a real price", () => {
    render(<DishCard item={dish({ price: 42 })} />);

    expect(screen.getByText("$42.00")).toBeInTheDocument();
  });

  it("stops opening the detail sheet once the photo turns out to be broken", () => {
    // The tile had a URL, so it rendered inside the open-the-sheet button. When
    // the host 403s it becomes an empty tile carrying the upload button, and the
    // browser reported a button nested inside a button.
    const onOpen = jest.fn();
    render(
      <DishCard
        item={dish({ images: [photo("https://example.test/gone.jpg")] })}
        onOpen={onOpen}
        onAddPhoto={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Single Steak" }),
    ).toBeInTheDocument();

    fireEvent.error(screen.getByAltText("Single Steak"));

    expect(
      screen.queryByRole("button", { name: "Single Steak" }),
    ).not.toBeInTheDocument();
  });

  it("never nests the upload button inside the detail button", () => {
    const { container } = render(
      <DishCard
        item={dish({ images: [photo("https://example.test/gone.jpg")] })}
        onOpen={jest.fn()}
        onAddPhoto={jest.fn()}
      />,
    );

    fireEvent.error(screen.getByAltText("Single Steak"));

    expect(container.querySelector("button button")).toBeNull();
  });

  it("gives the tile another chance when the photo changes", () => {
    // A lookup can find a working photo later in the session; the card must not
    // stay permanently marked as broken.
    const onOpen = jest.fn();
    const { rerender } = render(
      <DishCard
        item={dish({ images: [photo("https://example.test/gone.jpg")] })}
        onOpen={onOpen}
      />,
    );

    fireEvent.error(screen.getByAltText("Single Steak"));
    expect(
      screen.queryByRole("button", { name: "Single Steak" }),
    ).not.toBeInTheDocument();

    rerender(
      <DishCard
        item={dish({ images: [photo("https://example.test/found.jpg")] })}
        onOpen={onOpen}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Single Steak" }),
    ).toBeInTheDocument();
  });

  it("keeps the open control a sibling of the tile, never its parent", () => {
    // Structural, not behavioural: wrapping the tile means one commit somewhere
    // renders the upload button inside this one, and reacting after the fact
    // cannot unrender invalid DOM. Siblings are valid in every frame.
    render(
      <DishCard
        item={dish({ images: [photo("https://example.test/steak.jpg")] })}
        onOpen={jest.fn()}
        onAddPhoto={jest.fn()}
      />,
    );

    const open = screen.getByRole("button", { name: "Single Steak" });

    expect(open.querySelector("img")).toBeNull();
    expect(open.querySelector("button")).toBeNull();
  });

  it("drops the badge where the section heading already says it", () => {
    // Inside the most-loved strip the badge repeated the heading on every card
    // and stacked on top of the stock-photo disclosure in the same corner.
    render(
      <DishCard
        item={dish()}
        score={score({ voteCount: RANKING.MIN_VOTES_TO_RANK, isRanked: true })}
        hideRankBadge
      />,
    );

    expect(
      screen.queryByText(RANKING_LABELS.topBadge),
    ).not.toBeInTheDocument();
  });
});
