import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "@/components/Footer";
import { SITE_LABELS, LEGAL_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

const show = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

describe("Footer", () => {
  it("carries the brand and what the product does", () => {
    show();

    expect(screen.getByText(SITE_LABELS.brand)).toBeInTheDocument();
    expect(screen.getByText(SITE_LABELS.tagline)).toBeInTheDocument();
  });

  it("has no placeholder text in it", () => {
    // It shipped rendering the literal words "Footer" and "Contact" as its
    // entire content. A test is cheaper than noticing that in production.
    show();

    expect(screen.queryByText("Footer")).not.toBeInTheDocument();
    expect(screen.queryByText(/lorem/i)).not.toBeInTheDocument();
  });

  it("links contact somewhere real", () => {
    show();

    expect(screen.getByText(SITE_LABELS.contact)).toHaveAttribute(
      "href",
      "mailto:info@whatsdatfood.com",
    );
  });

  it("has no link without a destination", () => {
    const { container } = show();

    container.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
    });
  });

  it("links the policies, which is where the photo licence lives", () => {
    // These had to exist before strangers upload photographs: the terms are
    // the only place the right to display their photo is granted.
    show();

    expect(screen.getByText(LEGAL_LABELS.privacy)).toHaveAttribute(
      "href",
      ROUTES.privacy,
    );
    expect(screen.getByText(LEGAL_LABELS.terms)).toHaveAttribute(
      "href",
      ROUTES.terms,
    );
  });
});
