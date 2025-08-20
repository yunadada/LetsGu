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
  return new Promise(async (resolve, reject) => {
    const url = `${
      import.meta.env.VITE_REACT_APP_BASE_URL
    }api/v1/missions/analyze/${jobId}/events`;

    try {
      const controller = new AbortController();
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        reject(new Error(`❌ SSE 연결 실패: ${response.status}`));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          const lines = rawEvent.split("\n");
          let eventType = "";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataStr += line.slice(5).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            console.log("📨 SSE 메시지 수신:", { eventType, data });

            if (eventType === "verification") {
              if (data.eventType === "completed") {
                resolve("COMPLETED");
                controller.abort();
                return;
              } else if (
                data.eventType === "failed" ||
                data.eventType === "error"
              ) {
                reject(data);
                controller.abort();
                return;
              }
            }
          } catch (e) {
            console.error("❌ SSE 데이터 파싱 오류:", e);
          }
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
