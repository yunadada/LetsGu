import CulturePin from "./CulturePin.png";
import NaturePin from "./NaturePin.png";
import FoodPin from "./FoodPin.png";
import ArtExhibitionPin from "./ArtExhibitionPin.png";
import LifeConveniencePin from "./LifeConveniencePin.png";
import ClearPin from "../../assets/ClearPin.svg";

export const categoryIcons = {
  CULTURE_HISTORY: CulturePin,
  NATURE_PARK: NaturePin,
  FOOD_CAFE: FoodPin,
  ART_EXHIBITION_EXPERIENCE: ArtExhibitionPin,
  LIFE_CONVENIENCE: LifeConveniencePin,
  COMPLETED: ClearPin,
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
    COMPLETED: {
      url: categoryIcons.COMPLETED,
      scaledSize: new google.maps.Size(50, 50),
    },
  };
}
