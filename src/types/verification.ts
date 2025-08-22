import type { UserLocation } from "./location";

export type LocationAuthRequest = {
  missionId: number;
  userLocation: UserLocation | null;
};

export type ImageUploadRequest = {
  uploadUrl: string;
  formData: FormData;
};

export type ImageResource = {
  imageUrl: string;
  uploadKey: string;
};

export type MissionImageUploadRequest = {
  missionId: number;
  imageResource: ImageResource;
};
