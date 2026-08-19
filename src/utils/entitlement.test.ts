import { isMember, membershipOf } from "@/utils/entitlement";
import { UserType } from "@/interfaces/users";

const person = (fields: Partial<UserType>) => fields as UserType;

describe("membershipOf", () => {
  it("reports the tier the server sent", () => {
    expect(membershipOf(person({ membership_tier: "supporter" }))).toBe(
      "supporter",
    );
  });

  it("reports nothing for somebody who has not paid", () => {
    expect(membershipOf(person({}))).toBeNull();
    expect(isMember(person({}))).toBe(false);
  });

  it("treats an empty tier as absent", () => {
    // The server already reports a lapsed membership as absent; this is the
    // second line, so a blank string cannot read as a membership.
    expect(membershipOf(person({ membership_tier: "   " }))).toBeNull();
  });

  it("survives having nobody at all", () => {
    expect(membershipOf(null)).toBeNull();
    expect(isMember(undefined)).toBe(false);
  });

  it("does not confuse a role with a membership", () => {
    // They are different columns for a reason: a role is what somebody may do
    // to other people's work, membership is what they paid for.
    expect(isMember(person({ role_id: BigInt(2) }))).toBe(false);
  });
});
