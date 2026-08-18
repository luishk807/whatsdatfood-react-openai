import { render, screen } from "@testing-library/react";
import FoodCredAmount from "@/components/FoodCredAmount";

describe("FoodCredAmount", () => {
  it("always names the unit", () => {
    render(<FoodCredAmount amount={620} />);

    expect(screen.getByText("620")).toBeInTheDocument();
    expect(screen.getByText("Food Cred")).toBeInTheDocument();
  });

  it("signs an award but not a total", () => {
    const { rerender } = render(<FoodCredAmount amount={10} signed />);
    expect(screen.getByText("+10")).toBeInTheDocument();

    rerender(<FoodCredAmount amount={10} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.queryByText("+10")).toBeNull();
  });

  it("keeps a penalty's minus sign", () => {
    render(<FoodCredAmount amount={-10} signed />);

    expect(screen.getByText("-10")).toBeInTheDocument();
  });

  it("never reads as money", () => {
    // Not a preference. The moment reputation looks like a currency somebody
    // asks what it is worth, and the answer has to be "nothing".
    const { container } = render(<FoodCredAmount amount={1240} />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/[$€£]/);
    expect(text).not.toMatch(/points|coins|balance|wallet|redeem/i);
  });

  it("draws no emoji, so the mark can be replaced later", () => {
    const { container } = render(<FoodCredAmount amount={5} />);

    // An SVG, not a character: an emoji renders differently per platform and
    // could not be swapped for an uploaded graphic without editing every use.
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
