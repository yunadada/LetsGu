import axios from "axios";
import axiosInstance from "../../lib/axiosInstance";
import type {
  ImageUploadRequest,
  LocationAuthRequest,
  MissionImageUploadRequest,
} from "../../types/verification";
import { EventSourcePolyfill } from "event-source-polyfill";

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
  return await axios.post(uploadUrl, formData, {});
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

export const verifyImage = (
  jobId: string,
  accessToken: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = `${
      import.meta.env.VITE_REACT_APP_BASE_URL
    }/api/v1/missions/analyze/${jobId}/events`;

    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    eventSource.addEventListener("verification", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 SSE verification:", data);

        if (data.eventType === "completed") {
          resolve("COMPLETED");
          eventSource.close(); // 연결 닫기
        } else if (data.eventType === "failed" || data.eventType === "error") {
          reject(data);
          eventSource.close();
        }
      } catch (e) {
        console.error("❌ SSE 데이터 파싱 오류:", e);
      }
    });

    eventSource.onerror = (error) => {
      console.error("❌ SSE 연결 오류:", error);
      reject(error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  });
};
