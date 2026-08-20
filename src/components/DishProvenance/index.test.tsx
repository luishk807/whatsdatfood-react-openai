import { render, screen } from "@testing-library/react";
import DishProvenance from "@/components/DishProvenance";
import { DISH_SOURCE, DISH_VERIFICATION } from "@/customConstants";
import { MENU_EDIT_LABELS } from "@/customConstants/labels";

/**
 * The component whose most important behaviour is rendering nothing.
 *
 * Almost every dish in this product was read off a menu by a language model.
 * A badge saying so on all of them is a badge on none of them, and it turns a
 * menu into a database listing.
 */
describe("DishProvenance", () => {
  it("says nothing about an ordinary extracted dish", () => {
    // The common case, and the whole design.
    const { container } = render(
      <DishProvenance
        source={DISH_SOURCE.ai}
        verification_status={DISH_VERIFICATION.unverified}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("says a dish is not available", () => {
    render(
      <DishProvenance
        source={DISH_SOURCE.ai}
        verification_status={DISH_VERIFICATION.unverified}
        is_available={false}
      />,
    );

    expect(screen.getByText(MENU_EDIT_LABELS.unavailable)).toBeInTheDocument();
  });

  it("puts availability ahead of everything else", () => {
    // The only one of these that changes an order. Reading it after ordering
    // is too late.
    render(
      <DishProvenance
        source={DISH_SOURCE.owner}
        verification_status={DISH_VERIFICATION.ownerVerified}
        is_available={false}
      />,
    );

    expect(screen.getByText(MENU_EDIT_LABELS.unavailable)).toBeInTheDocument();
    expect(
      screen.queryByText(MENU_EDIT_LABELS.ownerVerified),
    ).not.toBeInTheDocument();
  });

  it("says when the restaurant has confirmed a dish", () => {
    render(
      <DishProvenance
        source={DISH_SOURCE.owner}
        verification_status={DISH_VERIFICATION.ownerVerified}
      />,
    );

    expect(
      screen.getByText(MENU_EDIT_LABELS.ownerVerified),
    ).toBeInTheDocument();
  });

  it("names the diner who added a dish", () => {
    // A contribution with somebody standing behind it reads differently from
    // an anonymous one.
    render(
      <DishProvenance
        source={DISH_SOURCE.community}
        verification_status={DISH_VERIFICATION.approved}
        added_by="Luis"
      />,
    );

    expect(
      screen.getByText(MENU_EDIT_LABELS.communityBy("Luis")),
    ).toBeInTheDocument();
  });

  it("drops the name on a card, where there is no room for it", () => {
    render(
      <DishProvenance
        source={DISH_SOURCE.community}
        verification_status={DISH_VERIFICATION.approved}
        added_by="Luis"
        compact
      />,
    );

    expect(screen.getByText(MENU_EDIT_LABELS.community)).toBeInTheDocument();
  });

  it("says a submission is still waiting", () => {
    // Pending dishes are shown rather than hidden, so they have to say so —
    // otherwise the menu asserts something nobody has checked.
    render(
      <DishProvenance
        source={DISH_SOURCE.community}
        verification_status={DISH_VERIFICATION.pending}
      />,
    );

    expect(screen.getByText(MENU_EDIT_LABELS.pending)).toBeInTheDocument();
  });

  it("shows one thing at a time", () => {
    // Two chips on a card is the beginning of a badge shelf.
    const { container } = render(
      <DishProvenance
        source={DISH_SOURCE.community}
        verification_status={DISH_VERIFICATION.pending}
        added_by="Luis"
      />,
    );

    expect(container.querySelectorAll("span")).toHaveLength(1);
  });
});
