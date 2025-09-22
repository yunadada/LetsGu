// assets/icons/markerIcons.ts
import brownPin from "./brownPin.png";
import greenPin from "./greenPin.png";
import redPin from "./redPin.png";
import purplePin from "./purplePin.png";
import bluePin from "./bluePin.png";

export const categoryIcons = {
  CULTURE_HISTORY: brownPin,
  NATURE_PARK: greenPin,
  FOOD_CAFE: redPin,
  ART_EXHIBITION_EXPERIENCE: purplePin,
  LIFE_CONVENIENCE: bluePin,
} as const;

export type MarkerCategory = keyof typeof categoryIcons;

export function getMarkerIcons(
  google: typeof window.google
): Record<MarkerCategory, { url: string; scaledSize: google.maps.Size }> {
  return {
    CULTURE_HISTORY: {
      url: categoryIcons.CULTURE_HISTORY,
      scaledSize: new google.maps.Size(50, 50),
    },
    NATURE_PARK: {
      url: categoryIcons.NATURE_PARK,
      scaledSize: new google.maps.Size(50, 50),
    },
    FOOD_CAFE: {
      url: categoryIcons.FOOD_CAFE,
      scaledSize: new google.maps.Size(50, 50),
    },
    ART_EXHIBITION_EXPERIENCE: {
      url: categoryIcons.ART_EXHIBITION_EXPERIENCE,
      scaledSize: new google.maps.Size(50, 50),
    },
    LIFE_CONVENIENCE: {
      url: categoryIcons.LIFE_CONVENIENCE,
      scaledSize: new google.maps.Size(50, 50),
    },
  };
}
