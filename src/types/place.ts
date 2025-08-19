import type { MarkerCategory } from "../assets/icons/markerIcons";

export interface Place {
  id: number;
  address: string;
  lat: number;
  lng: number;
  name: string;
  category: MarkerCategory;
}