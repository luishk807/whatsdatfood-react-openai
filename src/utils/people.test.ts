import { displayName } from "@/utils/people";
import { UserType } from "@/interfaces/users";

const person = (fields: Partial<UserType>) => fields as UserType;

describe("displayName", () => {
  it("prefers what the contributor chose", () => {
    expect(
      displayName(person({ display_name: "Luis", first_name: "Luisito" })),
    ).toBe("Luis");
  });

  it("falls back to the name parts for an account made before the column existed", () => {
    expect(displayName(person({ first_name: "Ada", last_name: "Lovelace" }))).toBe(
      "Ada Lovelace",
    );
  });

  it("falls back to the handle last", () => {
    // "@ada_lovelace2" is an implementation detail of a URL, not a name.
    expect(displayName(person({ username: "ada_lovelace2" }))).toBe(
      "ada_lovelace2",
    );
  });

  it("treats whitespace as absent rather than showing a blank", () => {
    expect(
      displayName(person({ display_name: "   ", first_name: "Ada" })),
    ).toBe("Ada");
  });

  it("survives having nobody at all", () => {
    // A review whose author was erased still renders; it just has no name.
    expect(displayName(null)).toBe("");
    expect(displayName(undefined)).toBe("");
  });
});
