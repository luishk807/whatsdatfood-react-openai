import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, type MockedResponse } from "@apollo/client/testing";
import ContactPage from "@/components/ContactPage";
import {
  CONTACT_AVAILABLE,
  SEND_CONTACT_MESSAGE,
} from "@/graphql/queries/contact";
import { CONTACT } from "@/customConstants";
import { CONTACT_LABELS } from "@/customConstants/labels";

const availability = (contactAvailable: boolean): MockedResponse => ({
  request: { query: CONTACT_AVAILABLE },
  result: { data: { contactAvailable } },
});

const filled = {
  name: "Luis",
  email: "luis@example.invalid",
  subject: "A missing restaurant",
  message: "There is a dumpling place on Main Street you are missing.",
  website: "",
};

const accepted: MockedResponse = {
  request: { query: SEND_CONTACT_MESSAGE, variables: { input: filled } },
  result: { data: { sendContactMessage: true } },
};

const refused: MockedResponse = {
  request: { query: SEND_CONTACT_MESSAGE, variables: { input: filled } },
  error: new Error("That is a lot of messages. Try again a little later."),
};

const show = (mocks: MockedResponse[]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ContactPage />
    </MockedProvider>,
  );

const fillIn = async () => {
  await userEvent.type(screen.getByLabelText(CONTACT_LABELS.name), filled.name);
  await userEvent.type(
    screen.getByLabelText(CONTACT_LABELS.email),
    filled.email,
  );
  await userEvent.type(
    screen.getByLabelText(CONTACT_LABELS.subject),
    filled.subject,
  );
  await userEvent.type(
    screen.getByLabelText(CONTACT_LABELS.message),
    filled.message,
  );
};

describe("ContactPage", () => {
  it("asks for no account", async () => {
    // The person reporting a wrong menu is the one least likely to have one.
    show([availability(true)]);

    expect(
      await screen.findByRole("button", { name: CONTACT_LABELS.submit }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
  });

  it("sends what was typed", async () => {
    show([availability(true), accepted]);
    await screen.findByRole("button", { name: CONTACT_LABELS.submit });

    await fillIn();
    await userEvent.click(
      screen.getByRole("button", { name: CONTACT_LABELS.submit }),
    );

    expect(await screen.findByText(CONTACT_LABELS.sent)).toBeInTheDocument();
  });

  it("names the receipt, which is the part somebody can check", async () => {
    show([availability(true), accepted]);
    await screen.findByRole("button", { name: CONTACT_LABELS.submit });

    await fillIn();
    await userEvent.click(
      screen.getByRole("button", { name: CONTACT_LABELS.submit }),
    );

    expect(await screen.findByText(CONTACT_LABELS.sentHelp)).toBeInTheDocument();
  });

  it("shows the server's refusal verbatim", async () => {
    // "That is a lot of messages" explains a rule. "Something went wrong"
    // explains nothing and invites an immediate retry.
    show([availability(true), refused]);
    await screen.findByRole("button", { name: CONTACT_LABELS.submit });

    await fillIn();
    await userEvent.click(
      screen.getByRole("button", { name: CONTACT_LABELS.submit }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /lot of messages/i,
    );
  });

  it("offers an address instead of a form it cannot send", async () => {
    // The same rule as the map with no token: a control that fails on submit
    // wastes somebody's message and their time.
    show([availability(false)]);

    expect(
      await screen.findByText(CONTACT.FALLBACK_EMAIL),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: CONTACT_LABELS.submit }),
    ).not.toBeInTheDocument();
  });

  it("hides the honeypot from everybody who is not a bot", async () => {
    // Not focusable, not announced, not visible. Anything a person could
    // reach is a field a person could fill in by accident, and that would
    // silently throw their message away.
    show([availability(true)]);
    await screen.findByRole("button", { name: CONTACT_LABELS.submit });

    const trap = document.getElementById("contact-website");

    expect(trap).toBeInTheDocument();
    expect(trap).toHaveAttribute("tabindex", "-1");

    // The wrapper is display:none rather than positioned off-screen, so it is
    // out of the accessibility tree and out of the tab order both. Asserted on
    // the wrapper because that is where the hiding happens.
    const wrapper = trap?.closest("[aria-hidden='true']") as HTMLElement | null;

    expect(wrapper).not.toBeNull();
    expect(wrapper).not.toBeVisible();
  });

  it("does not let somebody type past what the server accepts", async () => {
    show([availability(true)]);
    await screen.findByRole("button", { name: CONTACT_LABELS.submit });

    expect(screen.getByLabelText(CONTACT_LABELS.message)).toHaveAttribute(
      "maxlength",
      String(CONTACT.MAX_MESSAGE),
    );
  });
});
