import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocationBadge from "@/components/LocationBadge";
import { LOCATION_LABELS } from "@/customConstants/labels";

/**
 * What a known location looks like once it is known.
 *
 * The point of this component is subtraction: a reader who has answered
 * should see one line, not the pair of large buttons that asked the question.
 */
describe("LocationBadge", () => {
  it("names the area", () => {
    render(<LocationBadge label="Flushing" onChange={jest.fn()} />);

    expect(screen.getByText("Flushing")).toBeInTheDocument();
  });

  it("says something vague and true before the server has named the area", () => {
    // A device fix arrives before `nameArea` has been told anything. "Near
    // you" is honest; an empty line looks broken and a guessed name is worse
    // than both.
    render(<LocationBadge label="" onChange={jest.fn()} />);

    expect(screen.getByText(LOCATION_LABELS.unnamedArea)).toBeInTheDocument();
  });

  it("offers a way to change it", async () => {
    const onChange = jest.fn();
    render(<LocationBadge label="Flushing" onChange={onChange} />);

    await userEvent.click(
      screen.getByRole("button", { name: LOCATION_LABELS.change }),
    );

    expect(onChange).toHaveBeenCalled();
  });

  it("does not ask the question again", () => {
    // The regression this component exists to fix: "Use my current location"
    // stayed on the homepage forever, above sections already using the answer.
    render(<LocationBadge label="Flushing" onChange={jest.fn()} />);

    expect(
      screen.queryByRole("button", { name: /use my current location/i }),
    ).not.toBeInTheDocument();
  });

  it("draws a pin rather than an emoji", () => {
    // An emoji is a different picture on every platform, cannot take the
    // theme's colour, and cannot be swapped without editing every call site.
    const { container } = render(
      <LocationBadge label="Flushing" onChange={jest.fn()} />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
    );
  });
});
