import { FC } from "react";
import BottomSheet from "@/components/BottomSheet";
import BusinessHourDisplay from "@/components/BusinessHoursDisplay";
import { RestaurantDetailsSheetInterface, DetailRow } from "@/interfaces/venue";
import { VENUE_LABELS } from "@/customConstants/labels";
import { fullAddress, michelinStars, priceRange } from "@/utils/venue";

/**
 * Everything the restaurant page used to lead with.
 *
 * Kept rather than deleted - somebody occasionally wants the phone number -
 * but behind a tap, because none of it helps a person decide what to order.
 */
const RestaurantDetailsSheet: FC<RestaurantDetailsSheetInterface> = ({
  restaurant,
  open,
  onClose,
}) => {
  if (!restaurant) {
    return null;
  }

  const address = fullAddress(restaurant);
  const stars = michelinStars(restaurant);
  const price = priceRange(restaurant);

  const rows: DetailRow[] = [];

  if (address) {
    rows.push({ label: VENUE_LABELS.address, value: address });
  }

  if (restaurant.phone?.trim()) {
    rows.push({
      label: VENUE_LABELS.phone,
      value: (
        // A phone number on a phone should dial.
        <a href={`tel:${restaurant.phone}`} className="text-brand underline">
          {restaurant.phone}
        </a>
      ),
    });
  }

  if (restaurant.website?.trim()) {
    rows.push({
      label: VENUE_LABELS.website,
      value: (
        <a
          href={restaurant.website}
          target="_blank"
          rel="noreferrer noopener"
          className="break-all text-brand underline"
        >
          {restaurant.website}
        </a>
      ),
    });
  }

  if (price) {
    rows.push({ label: VENUE_LABELS.priceRange, value: price });
  }

  if (stars > 0) {
    rows.push({
      label: VENUE_LABELS.michelin,
      value: "★".repeat(stars),
    });
  }

  if (restaurant.payment_method?.trim()) {
    rows.push({
      label: VENUE_LABELS.payment,
      value: <span className="capitalize">{restaurant.payment_method}</span>,
    });
  }

  if (restaurant.reservation_required) {
    rows.push({
      label: VENUE_LABELS.reservationRequired,
      value: "Yes",
    });
  }

  if (restaurant.tasting_menu_only) {
    rows.push({
      label: VENUE_LABELS.tastingMenu,
      value: restaurant.tasting_menu_price
        ? `${restaurant.tasting_menu_price}`
        : "Yes",
    });
  }

  const hours = restaurant.businessHours ?? [];

  return (
    <BottomSheet
      open={open}
      title={VENUE_LABELS.detailsSheetTitle}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        {restaurant.description?.trim() && (
          <p className="text-sm leading-relaxed text-ink-muted">
            {restaurant.description}
          </p>
        )}

        {rows.length > 0 && (
          <dl className="flex flex-col gap-2 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex gap-3">
                <dt className="w-32 shrink-0 text-ink-muted">{row.label}</dt>
                <dd className="min-w-0 flex-1 text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {hours.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-ink">
              {VENUE_LABELS.hours}
            </h3>
            <BusinessHourDisplay schedules={hours} />
          </section>
        )}

        {rows.length === 0 && hours.length === 0 && (
          <p className="text-sm text-ink-muted">{VENUE_LABELS.noDetails}</p>
        )}
      </div>
    </BottomSheet>
  );
};

export default RestaurantDetailsSheet;
