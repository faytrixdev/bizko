import { R2_CONFIG } from "./r2";
import { r2KeyPrefix, type R2MediaKind } from "./mediaKinds";
import {
  avatarSizeLimitBytes,
  getLimits,
  imageSizeLimitBytes,
  thumbnailSizeLimitBytes,
  videoSizeLimitBytes,
  type Plan,
  type PlanLimits,
} from "./plans";

/** Which `portfolio_items` rows a kind's row-count guard inspects. */
export type PortfolioRowScope = "all" | "video" | "none";

export type MediaLimitError = "videos_limit" | "portfolio_limit";

export interface MediaKindSpec {
  /** Row set the pre-signature guard counts. `"none"` disables that guard. */
  rowScope: PortfolioRowScope;
  /** Cap the row count is compared against; `null` disables the guard. */
  rowCap: ((limits: PlanLimits) => number) | null;
  /** Whether the *total* portfolio cap also applies, on top of `rowCap`. */
  alsoCapsTotalRows: boolean;
  /** Error returned when a row cap is reached. */
  rowCapError: MediaLimitError;
  /** Objects tolerated beyond the row cap, absorbing interrupted uploads. */
  orphanSlack: number;
  /** Used when `rowCap` is disabled (avatars: one live object, old ones GC'd). */
  absoluteOrphanCap: number | null;
  /** Hard per-object byte ceiling for this kind, after the bucket-level backstop. */
  sizeLimitBytes: (plan: Plan) => number;
}

const imageSizeLimit = (): number =>
  Math.min(imageSizeLimitBytes(), R2_CONFIG.maxImageSizeBytes);

/** Grid-sized images stay small: nothing ever zooms into a poster or an avatar. */
const thumbnailSizeLimit = (): number =>
  Math.min(thumbnailSizeLimitBytes(), R2_CONFIG.maxImageSizeBytes);

const avatarSizeLimit = (): number =>
  Math.min(avatarSizeLimitBytes(), R2_CONFIG.maxImageSizeBytes);

export const MEDIA_KIND_SPECS: Record<R2MediaKind, MediaKindSpec> = {
  video: {
    rowScope: "video",
    rowCap: (limits) => limits.videos,
    // A video is also a portfolio item, so the total cap applies too.
    alsoCapsTotalRows: true,
    rowCapError: "videos_limit",
    orphanSlack: 5,
    absoluteOrphanCap: null,
    sizeLimitBytes: (plan) => Math.min(videoSizeLimitBytes(plan), R2_CONFIG.maxVideoSizeBytes),
  },
  image: {
    rowScope: "all",
    rowCap: (limits) => limits.portfolioItems,
    alsoCapsTotalRows: false,
    rowCapError: "portfolio_limit",
    orphanSlack: 5,
    absoluteOrphanCap: null,
    sizeLimitBytes: imageSizeLimit,
  },
  // A video poster frame: no `portfolio_items` row of its own, but the parent
  // video's row does consume a portfolio slot, so the total cap still applies.
  thumb: {
    rowScope: "all",
    rowCap: (limits) => limits.portfolioItems,
    alsoCapsTotalRows: false,
    rowCapError: "portfolio_limit",
    orphanSlack: 5,
    absoluteOrphanCap: null,
    sizeLimitBytes: thumbnailSizeLimit,
  },
  // Exactly one avatar is live per member and the previous one is removed on
  // success, so there is no row to count — only a small absolute cap.
  avatar: {
    rowScope: "none",
    rowCap: null,
    alsoCapsTotalRows: false,
    rowCapError: "portfolio_limit",
    orphanSlack: 0,
    absoluteOrphanCap: 5,
    sizeLimitBytes: avatarSizeLimit,
  },
};

export function mediaSpec(kind: R2MediaKind): MediaKindSpec {
  return MEDIA_KIND_SPECS[kind];
}

/**
 * How many R2 objects may sit under this kind's prefix for a member.
 *
 * Rows and objects are counted separately on purpose: a presigned PUT does not
 * create a `portfolio_items` row, so without an object-level cap a member
 * could upload unlimited files and never reach their plan limit.
 */
export function orphanCapFor(kind: R2MediaKind, plan: Plan): number {
  const spec = mediaSpec(kind);
  if (spec.rowCap) {
    const cap = spec.rowCap(getLimits(plan));
    if (Number.isFinite(cap)) return cap + spec.orphanSlack;
  }
  return spec.absoluteOrphanCap ?? 5000;
}

/** The bucket prefix the orphan counter must list for this kind. */
export function orphanPrefixFor(kind: R2MediaKind, userId: string): string {
  return r2KeyPrefix(kind, userId);
}
