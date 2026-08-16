import { useMemo, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import useAuth from "@/customHooks/useAuth";
import useUserRating from "@/customHooks/useUserRating";
import { MenuItemType } from "@/interfaces/restaurants";
import { MENU_ITEM_RATINGS_FRAGMENT } from "@/graphql/queries/restaurants";
import { VOTE, VOTE_MIDPOINT } from "@/customConstants/ranking";
import { VoteValue } from "@/types";
import { _get } from "@/utils";

type VoteMap = Record<number, VoteValue | null>;

/**
 * The viewer's own vote per dish, read from the ratings already nested in the
 * menu payload — no extra request. A vote is written through the existing
 * addUserRating mutation, which the backend keys on user + dish, so voting
 * twice updates rather than duplicates.
 */
const useDishVotes = (items: MenuItemType[]) => {
  const { user } = useAuth();
  const { saveRating, submitRatingQuery } = useUserRating();
  const client = useApolloClient();
  const [pending, setPending] = useState<VoteMap>({});

  /**
   * Writes the vote into the normalised cache for that one dish, so the count
   * and the ranking move immediately. Refetching the whole menu instead would
   * risk a cold regeneration on the server.
   */
  const writeVoteToCache = useCallback(
    (dishId: number, ratingId: unknown, value: VoteValue) => {
      const cacheId = client.cache.identify({
        __typename: "RestaurantMenuItem",
        id: dishId,
      });

      if (!cacheId || !user) {
        return;
      }

      client.cache.updateFragment(
        {
          id: cacheId,
          fragment: MENU_ITEM_RATINGS_FRAGMENT,
          fragmentName: "MenuItemRatings",
        },
        (data: any) => {
          if (!data) {
            return data;
          }

          const existing = data.ratings ?? [];
          const isMine = (entry: any) =>
            Number(_get(entry, "user_id")) === Number(user.id);
          const mine = existing.find(isMine);

          const next = {
            __typename: "UserRating",
            id: mine?.id ?? ratingId,
            rating: value,
            user_id: user.id,
          };

          return {
            ...data,
            ratings: mine
              ? existing.map((entry: any) => (isMine(entry) ? next : entry))
              : [...existing, next],
          };
        },
      );
    },
    [client, user],
  );

  const votes = useMemo<VoteMap>(() => {
    const fromServer = items.reduce<VoteMap>((acc, item) => {
      const id = Number(item?.id ?? 0);

      if (!id) {
        return acc;
      }

      const mine = item.ratings?.find(
        (rating) => Number(rating?.user_id) === Number(user?.id),
      );

      acc[id] = mine
        ? Number(mine.rating) >= VOTE_MIDPOINT
          ? VOTE.up
          : VOTE.down
        : null;

      return acc;
    }, {});

    // Optimistic values win so the button responds on tap, not on round trip.
    return { ...fromServer, ...pending };
  }, [items, user, pending]);

  const submitVote = useCallback(
    async (item: MenuItemType, value: VoteValue) => {
      const id = Number(item?.id ?? 0);

      if (!id || !user) {
        return;
      }

      setPending((prev) => ({ ...prev, [id]: value }));

      try {
        const saved = (await saveRating({
          restaurant_menu_item_id: id,
          rating: value,
        })) as { id?: string | number } | null;

        writeVoteToCache(id, saved?.id, value);
      } catch (err) {
        setPending((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        throw err;
      }
    },
    [user, saveRating, writeVoteToCache],
  );

  return {
    votes,
    submitVote,
    canVote: !!user,
    saving: submitRatingQuery.loading,
  };
};

export default useDishVotes;
