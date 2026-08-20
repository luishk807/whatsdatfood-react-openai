import { useState, type FC, useEffect, useMemo, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import {
  RestaurantType,
  MenuItemType,
  RestCategoryMenu,
} from "@/interfaces/restaurants";
import { CustomKeyPairObj } from "@/interfaces";
import { SeverityType } from "@/types";
import LoadingComponent from "@/components/LoadingComponent";
import RestaurantHeader from "@/components/RestaurantHeader";
import RestaurantDetailsSheet from "@/components/RestaurantDetailsSheet";
import "./index.css";
import Loading from "@/components/Loading";
import { _get } from "@/utils";
import { convertCurrency } from "@/utils/numbers";
import { LOADING_TYPES, RATING_TYPE } from "@/customConstants";
import SkeletonMenuItem from "@/components/SkeletonLoaders/MenuResultPage";
import SkeletonRatingListing from "@/components/SkeletonLoaders/RatingModalListing";
import SkeletonRatingCreate from "@/components/SkeletonLoaders/RatingCreateForm";
import useRestaurantMutation from "@/customHooks/useRestaurantMutations";
import useAuth from "@/customHooks/useAuth";
import BookmarkButton from "../BookmarkButton";
import ClaimRestaurantButton from "@/components/ClaimRestaurantButton";
import TopDishStrip from "@/components/TopDishStrip";
import DishGrid from "@/components/DishGrid";
import DishPhoto from "@/components/DishPhoto";
import BottomSheet from "@/components/BottomSheet";
import useDishRanking from "@/customHooks/useDishRanking";
import useDishVotes from "@/customHooks/useDishVotes";
import useDishPhotoUpload from "@/customHooks/useDishPhotoUpload";
import FoodCredAward from "@/components/FoodCredAward";
import TopContributors from "@/components/TopContributors";
import AddDishAction from "@/components/AddDishAction";
import SuggestCorrection from "@/components/SuggestCorrection";
import FoodCredIcon from "@/components/FoodCredIcon";
import { LEADERBOARD_LABELS } from "@/customConstants/reputation";
import useRestaurantLeaderboard from "@/customHooks/useRestaurantLeaderboard";
import useDishPhotos from "@/customHooks/useDishPhotos";
import useDishOrders from "@/customHooks/useDishOrders";
import DishPhotoGallery from "@/components/DishPhotoGallery";
import DishRecommendation from "@/components/DishRecommendation";
import DietaryTags from "@/components/DietaryTags";
import useSnackbarHook from "@/customHooks/useSnackBar";
import {
  groupDishesByCategory,
  getDishPhotoUrl,
  getDishPhotoSource,
  sectionId,
  TOP_SECTION_ID,
} from "@/utils/dish";
import PhotoUploadAction from "@/components/PhotoUploadAction";
import { UPLOAD_VARIANT } from "@/interfaces/photos";
import { IMAGE_SOURCE } from "@/customConstants/images";
import CategoryNav from "@/components/CategoryNav";
import useActiveSection from "@/customHooks/useActiveSection";
import { MenuSection } from "@/interfaces/ranking";
import {
  MENU_LABELS,
  RANKING_LABELS,
  DISH_LABELS,
  ORDER_LABELS,
  OWNER_LABELS,
} from "@/customConstants/labels";
import { RatingToogleType, VoteValue } from "@/types";
import { MenuItemPhoto } from "@/interfaces/restaurants";

const LazyRatingCreate = lazy(() => import("@/components/RatingFormCreate"));
const LazyRatingList = lazy(() => import("@/components/RatingList"));

const MenuResults: FC = () => {
  const { getRestaurantListBySlug, getRestaurantListBySlugQuery } =
    useRestaurantMutation();
  const { loading } = getRestaurantListBySlugQuery;
  const { restaurant } = useParams();

  const [showDetails, setShowDetails] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [tastingMenuData, setTastingMenuData] = useState<
    CustomKeyPairObj<string>[] | null
  >(null);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantType | null>(
    null,
  );
  const [dinerCount, setDinerCount] = useState(0);
  /**
   * The open sheet is identified, not copied.
   *
   * It used to hold the dish object itself, which made the sheet a snapshot
   * taken when it opened: recording an order refetched the menu and the sheet
   * went on showing the old row, so the button still said "I ordered this" and
   * the recommend share never moved until it was closed and reopened.
   */
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [detailMode, setDetailMode] = useState<RatingToogleType>(
    RATING_TYPE.list,
  );

  const { checkAuthQuery, user } = useAuth();
  const { initialized } = checkAuthQuery;
  const { showSnackBar, SnackbarComponent } = useSnackbarHook();
  const { standings } = useRestaurantLeaderboard(restaurant);

  const {
    upload,
    uploadingDishId,
    error: uploadError,
    clearError: clearUploadError,
    award: uploadAward,
    clearAward: clearUploadAward,
  } = useDishPhotoUpload();
  const {
    load: loadPhotos,
    voteHelpful,
    report: reportPhoto,
    hasVoted,
    canParticipate,
    loading: photosLoading,
  } = useDishPhotos();
  const [dishPhotos, setDishPhotos] = useState<MenuItemPhoto[]>([]);
  const { toggle: toggleOrdered, canRecord } = useDishOrders();

  /**
   * The menu as it arrived. There is nothing to fold in any more: dish
   * photography is community uploads only, so a dish's photos come down with
   * the menu payload and a dish without one has none until somebody takes it.
   */
  const dishes = menuItems;

  const restaurantMenu = useMemo<RestCategoryMenu>(
    () => groupDishesByCategory(dishes),
    [dishes],
  );

  // isRanked is no longer read here: topDishes is empty unless something has
  // been ranked, so the strip's own presence is the signal.
  const { scores, topDishes } = useDishRanking(dishes);
  const { votes, submitVote, canVote } = useDishVotes(dishes);

  const categories = useMemo(
    () => Object.keys(restaurantMenu),
    [restaurantMenu],
  );

  /** Jump targets for the sticky bar: the strip when it exists, then sections. */
  const sections = useMemo<MenuSection[]>(
    () => [
      ...(topDishes.length
        ? [{ id: TOP_SECTION_ID, label: RANKING_LABELS.topStripNav }]
        : []),
      ...categories.map((category) => ({
        id: sectionId(category),
        label: category,
      })),
    ],
    [topDishes.length, categories],
  );

  const activeSection = useActiveSection(
    useMemo(() => sections.map((section) => section.id), [sections]),
  );

  /** Always the current row for the open dish, never the one it opened with. */
  const selectedDish = useMemo(
    () =>
      selectedDishId === null
        ? null
        : (dishes.find((item) => Number(item?.id) === selectedDishId) ?? null),
    [dishes, selectedDishId],
  );

  const handleJump = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddPhoto = async (item: MenuItemType, file: File) => {
    const uploaded = await upload(item, file);

    if (uploaded) {
      // Bypass the cache so the new photo actually appears.
      handleFetchRestaurant(true);
    }
  };

  const handleFetchRestaurant = async (forceNetwork?: boolean) => {
    if (restaurant) {
      const resp = await getRestaurantListBySlug(restaurant, forceNetwork);

      if (resp) {
        const items = _get<MenuItemType[]>(resp, "restaurantMenuItems", []);

        if (items && items.length) {
          setMenuItems(items);
        }

        setDinerCount(Number(_get(resp, "diner_count", 0)) || 0);

        if (resp instanceof Object && Object.keys(resp).length) {
          const tastingMenu = _get(resp, "tasting_menu_only");
          const drinkingPrice = _get(resp, "drink_pairing_price");
          const tastingPrice = _get(resp, "tasting_menu_price");

          if (tastingMenu) {
            setTastingMenuData([
              {
                label: MENU_LABELS.drinkPairingPrice,
                value: String(convertCurrency(Number(drinkingPrice))),
              },
              {
                label: MENU_LABELS.tastingMenuPrice,
                value: String(convertCurrency(Number(tastingPrice))),
              },
            ]);
          }

          setRestaurantInfo({
            name: _get(resp, "name"),
            address: _get(resp, "address"),
            city: _get(resp, "city"),
            state: _get(resp, "state"),
            postal_code: _get(resp, "postal_code"),
            michelin_score: _get(resp, "michelin_score"),
            rating: Number(_get(resp, "rating", 0)),
            phone: _get(resp, "phone"),
            payment_method: _get(resp, "payment_method"),
            delivery_method: _get(resp, "delivery_method"),
            letter_grade: _get(resp, "letter_grade"),
            description: _get(resp, "description"),
            businessHours: _get(resp, "businessHours"),
            tasting_menu_only: _get(resp, "tasting_menu_only"),
            tasting_menu_price: _get(resp, "tasting_menu_price"),
            price_range: _get(resp, "price_range"),
            drink_pairing_price: _get(resp, "drink_pairing_price"),
            reservation_required: _get(resp, "reservation_required"),
            reservation_available: _get(resp, "reservation_available"),
            website: _get(resp, "website"),
            email: _get(resp, "email"),
            parking_available: _get(resp, "parking_available"),
            cash_only: _get(resp, "cash_only"),
            card_payment: _get(resp, "card_payment"),
            drive_through: _get(resp, "drive_through"),
            delivery_option: _get(resp, "delivery_option"),
            // Easy to miss: this object is assembled field by field, so a new
            // field on the query is invisible here until it is named.
            champion: _get(resp, "champion", null),
            menu_verified_at: _get(resp, "menu_verified_at", null),
            menu_updated_at: _get(resp, "menu_updated_at", null),
            viewer_can_manage: _get(resp, "viewer_can_manage", false),
          });
        }
      }
    }
  };

  useEffect(() => {
    handleFetchRestaurant();
    // The id, not the user object. What this actually depends on is who is
    // asking, and `useAuth` happens to return a stable object today - the live
    // page fetches the menu exactly once. Depending on the identity means the
    // day that stops being true, the front door of every restaurant refetches on
    // every render, which is the request loop this codebase has already had in
    // MainSearchBar, BookmarkButton and RatingList.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant, user?.id]);

  useEffect(() => {
    if (uploadError) {
      showSnackBar(uploadError, "error");
      clearUploadError();
    }
  }, [uploadError]);

  const handleVote = async (item: MenuItemType, value: VoteValue) => {
    try {
      await submitVote(item, value);
    } catch (err) {
      showSnackBar("Could not save your vote", "error");
    }
  };

  const refreshPhotos = async (item: MenuItemType | null) => {
    setDishPhotos(item ? await loadPhotos(item.id) : []);
  };

  const handleOpenDish = (item: MenuItemType) => {
    setDetailMode(RATING_TYPE.list);
    setSelectedDishId(Number(item?.id ?? 0) || null);
    refreshPhotos(item);
  };

  const handleVotePhoto = async (imageId: string | number) => {
    await voteHelpful(imageId);
    // Reload: a vote can move which photo is the hero.
    refreshPhotos(selectedDish);
  };

  const handleReportPhoto = async (
    imageId: string | number,
    reason: string,
  ) => {
    const sent = await reportPhoto(imageId, reason);

    if (sent) {
      showSnackBar(DISH_LABELS.reportSubmitted, "success");
    }
  };

  const handleAddPhotoFromSheet = async (file: File) => {
    if (!selectedDish) {
      return;
    }

    if (await upload(selectedDish, file)) {
      refreshPhotos(selectedDish);
      handleFetchRestaurant(true);
    }
  };

  const handleReviewSubmitted = (message: string, severity: SeverityType) => {
    showSnackBar(message, severity);
    setDetailMode(RATING_TYPE.list);
    // Must bypass the cache: the menu is cache-first, so a plain refetch would
    // return the very data the new review was meant to replace.
    handleFetchRestaurant(true);
  };

  if (!initialized) {
    return (
      <Loading type={LOADING_TYPES.CUSTOM} customLoader={SkeletonMenuItem} />
    );
  }

  return (
    <div className="w-full">
      {SnackbarComponent}
      {/* The moment the photo lands, while the contributor is still looking at
          the dish they photographed. */}
      <FoodCredAward award={uploadAward} onDismiss={clearUploadAward} />
      <LoadingComponent
        showLoading={loading}
        customLoader={SkeletonMenuItem}
        type={LOADING_TYPES.CUSTOM}
        data={restaurantInfo}
      >
        {/* Kept out of the surrounding layout: the header owns its own,
            and nesting it was collapsing it to a column narrow enough to wrap
            the restaurant name one word per line. */}
        <RestaurantHeader
          restaurant={restaurantInfo}
          onOpenDetails={() => setShowDetails(true)}
          action={
            restaurantInfo && restaurant ? (
              <BookmarkButton slug={restaurant} />
            ) : null
          }
        />

        <div className="w-full">
          <div className="mx-auto w-full max-w-5xl px-4">
            <CategoryNav
              sections={sections}
              activeId={activeSection}
              onJump={handleJump}
            />
          </div>

          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-4">
            {/* Only when it has been earned. There is no heading here at all
                until some dish clears the vote threshold - a recommendation
                section that appears before it can recommend anything reprints
                the top of the menu directly above the menu. */}
            {topDishes.length > 0 && (
              <TopDishStrip
                id={TOP_SECTION_ID}
                items={topDishes}
                scores={scores}
                votes={votes}
                canVote={canVote}
                onVote={handleVote}
                onOpen={handleOpenDish}
                onAddPhoto={handleAddPhoto}
                uploadingDishId={uploadingDishId}
                dinerCount={dinerCount}
              />
            )}

            {categories.map((category) => (
              <section
                key={category}
                id={sectionId(category)}
                // Clears the sticky bar, which would otherwise cover the
                // heading of whichever section was just jumped to.
                className="flex scroll-mt-16 flex-col gap-3"
              >
                {/* Left-aligned with the grid, and counted. Centred headings
                    over a long menu give the eye nothing to run down. */}
                <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <h2 className="text-base font-semibold text-ink">
                    {category}
                  </h2>
                  <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                    {restaurantMenu[category].length}{" "}
                    {restaurantMenu[category].length === 1 ? "item" : "items"}
                  </span>
                </div>
                <DishGrid
                  items={restaurantMenu[category]}
                  scores={scores}
                  votes={votes}
                  canVote={canVote}
                  onVote={handleVote}
                  onOpen={handleOpenDish}
                  onAddPhoto={handleAddPhoto}
                  uploadingDishId={uploadingDishId}
                  dinerCount={dinerCount}
                />
              </section>
            ))}

            {/* At the very end of the food, before anything about the
                product itself. This is for the reader who scrolled the whole
                menu and can see something is not on it — a different person
                from the one who just arrived to pick something. */}
            <AddDishAction
              slug={restaurant || ""}
              sections={Object.keys(restaurantMenu)}
              canContribute={!!user?.id}
              onAdded={() => handleFetchRestaurant(true)}
            />

            {/* Below the whole menu on purpose. The food is the page and
                reputation supports it; a leaderboard above the dishes would
                invert that, and nobody arrived here to read a ranking of
                photographers. */}
            <TopContributors
              standings={standings}
              champion={restaurantInfo?.champion}
            />

            <section className="flex flex-col items-start gap-2 border-t border-line pt-6">
              <h2 className="text-sm font-semibold text-ink">
                {OWNER_LABELS.claimTitle}
              </h2>
              <p className="max-w-prose text-sm text-ink-muted">
                {OWNER_LABELS.claimBlurb}
              </p>
              <ClaimRestaurantButton slug={restaurant} />
            </section>
          </div>
        </div>
      </LoadingComponent>

      <RestaurantDetailsSheet
        restaurant={restaurantInfo}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />

      <BottomSheet
        open={!!selectedDish}
        title={selectedDish?.name}
        onClose={() => {
          setSelectedDishId(null);
          setDishPhotos([]);
        }}
      >
        {selectedDish && (
          <div className="flex flex-col gap-4">
            {/* Full width, not a 192px thumbnail floated in the middle. This
                is the sheet someone opened to see what the dish looks like. */}
            <DishPhoto
              url={getDishPhotoUrl(selectedDish)}
              alt={selectedDish.name}
              eager
            />

            {/* The disclosure is the ask. Somebody looking at a picture that is
                admittedly not this kitchen's is the most persuadable person in
                the product, and "have the real dish?" explains why their photo
                is worth having in a way an upload button cannot. */}
            {getDishPhotoSource(selectedDish) === IMAGE_SOURCE.stock && (
              <p className="-mt-2 text-xs text-ink-muted">
                {DISH_LABELS.stockPhoto} · {DISH_LABELS.stockPrompt}{" "}
                {canParticipate ? (
                  <PhotoUploadAction
                    variant={UPLOAD_VARIANT.link}
                    onSelect={(file) => handleAddPhotoFromSheet(file)}
                    label={DISH_LABELS.addYourPhoto}
                    uploadingLabel={DISH_LABELS.uploading}
                    uploading={uploadingDishId === Number(selectedDish.id)}
                  />
                ) : (
                  DISH_LABELS.signInToUpload
                )}
              </p>
            )}

            {/* Permanent credit, and separate from whoever's photo leads today.
                Being first to photograph a dish is the contribution this
                product most wants to exist, so it is said out loud and it does
                not change hands when a later photo wins the hero slot. */}
            {/* Bottom of the sheet, collapsed. A repair tool, not a call to
                action — it must not compete with the photograph or the vote,
                which are what somebody opened this for. */}
            {selectedDish.first_photographed_by && (
              <p className="-mt-1 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                <FoodCredIcon size={12} className="text-brand" />
                {LEADERBOARD_LABELS.firstPhotographed(
                  selectedDish.first_photographed_by,
                )}
              </p>
            )}

            {selectedDish.price !== undefined &&
              selectedDish.price !== null && (
                <p className="text-base font-semibold tabular-nums text-ink">
                  {convertCurrency(Number(selectedDish.price))}
                </p>
              )}

            {selectedDish.description && (
              <p className="text-sm leading-relaxed text-ink-muted">
                {selectedDish.description}
              </p>
            )}

            <DietaryTags item={selectedDish} showDisclaimer />

            {/* The headline answer, above everything else the sheet offers. */}
            <div className="border-y border-line py-4">
              <DishRecommendation
                item={selectedDish}
                vote={votes[Number(selectedDish.id)]}
                canVote={canVote}
                onVote={(value) => handleVote(selectedDish, value)}
              />
            </div>

            <button
              type="button"
              disabled={!canRecord}
              aria-pressed={!!selectedDish.ordered_by_me}
              title={
                canRecord ? undefined : DISH_LABELS.signInToRecordOrder
              }
              onClick={async () => {
                await toggleOrdered(selectedDish);
                // Bypass the cache: the share and the toggle both move.
                handleFetchRestaurant(true);
              }}
              className={
                selectedDish.ordered_by_me
                  ? "self-start rounded-full border border-brand bg-emerald-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                  : "self-start rounded-full border border-line px-3 py-1 text-xs font-medium text-ink disabled:opacity-50"
              }
            >
              {selectedDish.ordered_by_me
                ? DISH_LABELS.youOrderedThis
                : DISH_LABELS.orderedThis}
            </button>

            {/* Straight after saying they ordered it. This is the one person
                who definitely had the plate in front of them, and the moment
                they are most likely to still have the photo on their phone.

                Only the photo is offered here - the vote sits a few
                centimetres above in DishRecommendation, and asking twice in one
                sheet is how a product ends up answering one question in three
                places again. */}
            {selectedDish.ordered_by_me && canParticipate && (
              <div className="flex flex-wrap items-center gap-2 rounded-card bg-surface-sunken px-3 py-2">
                <span className="text-xs text-ink-muted">
                  {DISH_LABELS.orderedFollowUp}
                </span>
                <PhotoUploadAction
                  variant={UPLOAD_VARIANT.chip}
                  onSelect={(file) => handleAddPhotoFromSheet(file)}
                  label={DISH_LABELS.addYourPhoto}
                  uploadingLabel={DISH_LABELS.uploading}
                  uploading={uploadingDishId === Number(selectedDish.id)}
                />
              </div>
            )}

            {!!selectedDish.order_count && (
              <p className="text-xs text-ink-muted">
                {ORDER_LABELS.count(selectedDish.order_count)}
              </p>
            )}

            <DishPhotoGallery
              photos={dishPhotos}
              loading={photosLoading}
              canParticipate={canParticipate}
              hasVoted={hasVoted}
              onVote={handleVotePhoto}
              onReport={handleReportPhoto}
              onAddPhoto={canParticipate ? handleAddPhotoFromSheet : undefined}
              uploading={uploadingDishId === Number(selectedDish.id)}
            />

            {/* Reviews need a session, so a visitor browsing anonymously is
                invited to sign in rather than shown a failing request. */}
            {!user ? (
              <p className="text-sm text-ink-muted">
                {DISH_LABELS.signInToReview}
              </p>
            ) : detailMode === RATING_TYPE.create ? (
              <Suspense fallback={<SkeletonRatingCreate />}>
                <LazyRatingCreate
                  data={selectedDish}
                  onPrevious={() => setDetailMode(RATING_TYPE.list)}
                  onSubmit={handleReviewSubmitted}
                />
              </Suspense>
            ) : (
              <Suspense fallback={<SkeletonRatingListing />}>
                <LazyRatingList
                  data={selectedDish}
                  onOpenCreate={() => setDetailMode(RATING_TYPE.create)}
                />
              </Suspense>
            )}

            {/* Last thing in the sheet, and collapsed. The menus are extracted
                by a model, so they are wrong in ordinary ways and the person
                who can see that is sitting in front of the dish. It stays out
                of the way until somebody already thinks something is off. */}
            <SuggestCorrection
              dishId={Number(selectedDish.id)}
              canSuggest={canParticipate}
            />
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default MenuResults;
