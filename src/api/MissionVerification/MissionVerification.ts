import axios from "axios";
import axiosInstance from "../../lib/axiosInstance";
import type {
  ImageUploadRequest,
  LocationAuthRequest,
  MissionImageUploadRequest,
} from "../../types/verification";

export const verifyLocation = async ({
  missionId,
  userLocation,
}: LocationAuthRequest) => {
  return await axiosInstance.post(
    `/api/v1/missions/${missionId}/gps`,
    userLocation
  );
};

export const getImgUploadUrl = async (missionId: number) => {
  return await axiosInstance.get(`/api/v1/missions/${missionId}/upload-url`);
};

export const uploadImageToPresignedUrl = async ({
  uploadUrl,
  formData,
}: ImageUploadRequest) => {
  return await axios.post(uploadUrl, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const postUploadUrl = async ({
  missionId,
  imageResource,
}: MissionImageUploadRequest) => {
  return await axiosInstance.post(
    `/api/v1/missions/${missionId}/verify-image`,
    imageResource
  );
};

export const verifyImage = (jobId: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = `${
      import.meta.env.VITE_REACT_APP_BASE_URL
    }/api/v1/missions/analyze/${jobId}/events`;

    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener("verification", (event) => {
      const status = (event as MessageEvent).data;

      if (status === "COMPLETED") {
        resolve(status);
        eventSource.close();
      } else if (status === "FAILED" || status === "ERROR") {
        reject(status);
        eventSource.close();
      }
    });

    eventSource.onerror = (err) => {
      reject(err);
      eventSource.close();
    };
  });
};
