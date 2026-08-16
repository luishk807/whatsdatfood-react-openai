import { useState, type FC, useEffect, useMemo, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import { AlertColor } from "@mui/material";
import {
  RestaurantType,
  MenuItemType,
  RestCategoryMenu,
} from "@/interfaces/restaurants";
import { CustomKeyPairObj } from "@/interfaces";
import LoadingComponent from "@/components/LoadingComponent";
import MenuTitle from "@/components/MenuTitle";
import "./index.css";
import Loading from "@/components/Loading";
import { _get } from "@/utils";
import { convertCurrency } from "@/utils/numbers";
import { LOADING_TYPES, RATING_TYPE } from "@/customConstants";
import SkeletonMenuItem from "@/components/SkeletonLoaders/MenuResultPage";
import SkeletonRatingListing from "@/components/SkeletonLoaders/RatingModalListing";
import SkeletonRatingCreate from "@/components/SkeletonLoaders/RatingCreateForm";
import useRestaurantMutation from "@/customHooks/useRestaurantMutations";
import DashingDisplayBox from "@/components/DashingDisplayBox";
import useAuth from "@/customHooks/useAuth";
import RestaurantIconMenu from "@/components/RestaurantSocialOptions";
import BookmarkButton from "../BookmarkButton";
import TopDishStrip from "@/components/TopDishStrip";
import DishGrid from "@/components/DishGrid";
import DishPhoto from "@/components/DishPhoto";
import BottomSheet from "@/components/BottomSheet";
import useDishRanking from "@/customHooks/useDishRanking";
import useDishVotes from "@/customHooks/useDishVotes";
import useDishPhotoLookup from "@/customHooks/useDishPhotoLookup";
import useDishPhotoUpload from "@/customHooks/useDishPhotoUpload";
import useDishPhotos from "@/customHooks/useDishPhotos";
import useDishOrders from "@/customHooks/useDishOrders";
import DishPhotoGallery from "@/components/DishPhotoGallery";
import useSnackbarHook from "@/customHooks/useSnackBar";
import { groupDishesByCategory, getDishPhotoUrl } from "@/utils/dish";
import {
  MENU_LABELS,
  RANKING_LABELS,
  DISH_LABELS,
  ORDER_LABELS,
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

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [tastingMenuData, setTastingMenuData] = useState<
    CustomKeyPairObj<string>[] | null
  >(null);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantType | null>(
    null,
  );
  const [dinerCount, setDinerCount] = useState(0);
  const [selectedDish, setSelectedDish] = useState<MenuItemType | null>(null);
  const [detailMode, setDetailMode] = useState<RatingToogleType>(
    RATING_TYPE.list,
  );

  const { checkAuthQuery, user } = useAuth();
  const { initialized } = checkAuthQuery;
  const { showSnackBar, SnackbarComponent } = useSnackbarHook();

  const { found, lookup } = useDishPhotoLookup();
  const {
    upload,
    uploadingDishId,
    error: uploadError,
    clearError: clearUploadError,
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

  /** Dishes with any photo found on this page view folded back in. */
  const dishes = useMemo<MenuItemType[]>(
    () =>
      menuItems.map((item) => {
        const url = found[Number(item?.id ?? 0)];
        return url ? { ...item, image: url } : item;
      }),
    [menuItems, found],
  );

  const restaurantMenu = useMemo<RestCategoryMenu>(
    () => groupDishesByCategory(dishes),
    [dishes],
  );

  const { scores, topDishes, isRanked } = useDishRanking(dishes);
  const { votes, submitVote, canVote } = useDishVotes(dishes);

  const categories = useMemo(
    () => Object.keys(restaurantMenu),
    [restaurantMenu],
  );

  const handleDishVisible = (item: MenuItemType) => lookup(item?.id);

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
          });
        }
      }
    }
  };

  useEffect(() => {
    handleFetchRestaurant();
  }, [restaurant, user]);

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
    setSelectedDish(item);
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

  const handleReviewSubmitted = (message: string, severity: AlertColor) => {
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
    <Grid container className="w-full">
      {SnackbarComponent}
      <LoadingComponent
        showLoading={loading}
        customLoader={SkeletonMenuItem}
        type={LOADING_TYPES.CUSTOM}
        data={restaurantInfo}
      >
        {restaurantInfo && restaurant && <BookmarkButton slug={restaurant} />}

        <MenuTitle restaurant={restaurantInfo} />

        <Grid size={12} className="show-tasting-price-container">
          <DashingDisplayBox
            show={restaurantInfo?.tasting_menu_only}
            title={MENU_LABELS.tastingMenuTitle}
            data={tastingMenuData}
          />
        </Grid>

        <Grid size={12} sx={{ display: { lg: "none" } }}>
          {restaurantInfo && <RestaurantIconMenu restaurant={restaurantInfo} />}
        </Grid>

        <Grid size={12}>
          <div className="flex flex-col gap-8 px-4 pb-16 pt-2">
            <TopDishStrip
              items={topDishes}
              scores={scores}
              votes={votes}
              canVote={canVote}
              onVote={handleVote}
              onOpen={handleOpenDish}
              onVisible={handleDishVisible}
              onAddPhoto={handleAddPhoto}
              uploadingDishId={uploadingDishId}
              dinerCount={dinerCount}
              title={
                isRanked
                  ? RANKING_LABELS.topStripTitle
                  : RANKING_LABELS.suggestedTitle
              }
            />

            {categories.map((category) => (
              <section key={category} className="flex flex-col gap-3">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {category}
                </h2>
                <DishGrid
                  items={restaurantMenu[category]}
                  scores={scores}
                  votes={votes}
                  canVote={canVote}
                  onVote={handleVote}
                  onOpen={handleOpenDish}
                  onVisible={handleDishVisible}
                  onAddPhoto={handleAddPhoto}
                  uploadingDishId={uploadingDishId}
                  dinerCount={dinerCount}
                />
              </section>
            ))}
          </div>
        </Grid>
      </LoadingComponent>

      <BottomSheet
        open={!!selectedDish}
        title={selectedDish?.name}
        onClose={() => {
          setSelectedDish(null);
          setDishPhotos([]);
        }}
      >
        {selectedDish && (
          <div className="flex flex-col gap-4">
            <div className="mx-auto w-48">
              <DishPhoto
                url={getDishPhotoUrl(selectedDish)}
                alt={selectedDish.name}
                eager
              />
            </div>

            {selectedDish.description && (
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {selectedDish.description}
              </p>
            )}

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
                  ? "self-start rounded-full border border-emerald-600 bg-emerald-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  : "self-start rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-neutral-700 dark:text-neutral-200"
              }
            >
              {selectedDish.ordered_by_me
                ? DISH_LABELS.youOrderedThis
                : DISH_LABELS.orderedThis}
            </button>

            {!!selectedDish.order_count && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
          </div>
        )}
      </BottomSheet>
    </Grid>
  );
};

export default MenuResults;
