import { useCallback } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  MY_RESTAURANT_CLAIMS,
  IS_RESTAURANT_OWNER,
  CLAIM_RESTAURANT,
  VERIFICATION_METHODS,
  UPDATE_RESTAURANT_FACTS,
  UPDATE_DISH_FACTS,
  DISCONTINUE_DISH,
} from "@/graphql/queries/ownership";
import {
  ClaimSubmission,
  RestaurantClaimType,
  VerificationMethodType,
} from "@/interfaces/ownership";
import { MenuItemType } from "@/interfaces/restaurants";
import { _get } from "@/utils";
import useAuth from "@/customHooks/useAuth";

/**
 * Claiming a restaurant and correcting its facts.
 *
 * Every price and phone number in the database started as a language model's
 * guess. This is how the person who knows the truth replaces it — and the
 * server refuses anything beyond facts, so nothing here can reach a review, a
 * photo or a rating.
 */
const useRestaurantOwnership = () => {
  const { user } = useAuth();

  const [fetchClaims, { loading: claimsLoading }] = useLazyQuery(
    MY_RESTAURANT_CLAIMS,
    { fetchPolicy: "network-only" },
  );
  const [checkOwner] = useLazyQuery(IS_RESTAURANT_OWNER, {
    fetchPolicy: "network-only",
  });
  const [claimMutation, { loading: claiming }] = useMutation(CLAIM_RESTAURANT);
  const [fetchMethods] = useLazyQuery(VERIFICATION_METHODS, {
    // The list changes when a provider is enabled on the server, which is
    // not something that happens between two taps.
    fetchPolicy: "cache-first",
  });
  const [updateRestaurant, { loading: savingRestaurant }] = useMutation(
    UPDATE_RESTAURANT_FACTS,
  );
  const [updateDish, { loading: savingDish }] = useMutation(UPDATE_DISH_FACTS);
  const [discontinue] = useMutation(DISCONTINUE_DISH);

  const loadClaims = useCallback(async (): Promise<RestaurantClaimType[]> => {
    if (!user) {
      return [];
    }

    const resp = await fetchClaims();
    return _get<RestaurantClaimType[]>(resp, "data.myRestaurantClaims", []) ?? [];
  }, [user, fetchClaims]);

  const isOwnerOf = useCallback(
    async (slug?: string): Promise<boolean> => {
      if (!slug || !user) {
        return false;
      }

      const resp = await checkOwner({ variables: { slug } });
      return !!_get(resp, "data.isRestaurantOwner");
    },
    [user, checkOwner],
  );

  /**
   * Submit a claim, with everything the wizard collected.
   *
   * One input rather than four arguments: the wizard gains fields as
   * verification methods are added, and a new field on an input is backward
   * compatible where a new argument is a rewrite.
   */
  const claim = useCallback(
    async (input: ClaimSubmission) => {
      const resp = await claimMutation({
        variables: {
          input: {
            slug: input.slug,
            role: input.role,
            verification_method: input.verificationMethod,
            claimant_name: input.claimantName || null,
            business_email: input.businessEmail || null,
            business_phone: input.businessPhone || null,
            explanation: input.explanation || null,
          },
        },
      });
      return _get(resp, "data.claimRestaurant");
    },
    [claimMutation],
  );

  const loadVerificationMethods = useCallback(
    async (slug: string): Promise<VerificationMethodType[]> => {
      try {
        const resp = await fetchMethods({ variables: { slug } });
        return _get<VerificationMethodType[]>(
          resp,
          "data.verificationMethods",
          [],
        ) ?? [];
      } catch {
        // A claim wizard that cannot ask what methods exist should say so
        // rather than guess at one - the whole point of asking the server is
        // that the answer changes without a release.
        return [];
      }
    },
    [fetchMethods],
  );

  const saveRestaurantFacts = useCallback(
    async (slug: string, changes: Record<string, unknown>) => {
      const resp = await updateRestaurant({
        variables: { input: { slug, ...changes } },
      });
      return _get(resp, "data.updateRestaurantFacts");
    },
    [updateRestaurant],
  );

  const saveDishFacts = useCallback(
    async (dishId: string | number, changes: Record<string, unknown>) => {
      const resp = await updateDish({
        variables: { input: { id: String(dishId), ...changes } },
      });
      return _get(resp, "data.updateDishFacts");
    },
    [updateDish],
  );

  const discontinueDish = useCallback(
    async (dish: MenuItemType) => {
      if (!dish?.id) {
        return false;
      }

      const resp = await discontinue({ variables: { dishId: String(dish.id) } });
      return !!_get(resp, "data.discontinueDish");
    },
    [discontinue],
  );

  return {
    loadClaims,
    isOwnerOf,
    claim,
    loadVerificationMethods,
    saveRestaurantFacts,
    saveDishFacts,
    discontinueDish,
    claimsLoading,
    claiming,
    saving: savingRestaurant || savingDish,
    canManage: !!user,
  };
};

export default useRestaurantOwnership;
