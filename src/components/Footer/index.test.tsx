import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";
import { SITE_LABELS } from "@/customConstants/labels";

describe("Footer", () => {
  it("carries the brand and what the product does", () => {
    render(<Footer />);

    expect(screen.getByText(SITE_LABELS.brand)).toBeInTheDocument();
    expect(screen.getByText(SITE_LABELS.tagline)).toBeInTheDocument();
  });

  it("has no placeholder text in it", () => {
    // It shipped rendering the literal words "Footer" and "Contact" as its
    // entire content. A test is cheaper than noticing that in production.
    render(<Footer />);

    expect(screen.queryByText("Footer")).not.toBeInTheDocument();
    expect(screen.queryByText(/lorem/i)).not.toBeInTheDocument();
  });

  it("links contact somewhere real", () => {
    render(<Footer />);

    expect(screen.getByText(SITE_LABELS.contact)).toHaveAttribute(
      "href",
      "mailto:info@whatsdatfood.com",
    );
  });

  it("has no link without a destination", () => {
    const { container } = render(<Footer />);

    container.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
    });
  });
});
