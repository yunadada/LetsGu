import style from "./PhotoVerifyPage.module.css";
import Header from "../../components/Header/Header";
import { HiOutlinePlus } from "react-icons/hi";
import CameraIcon from "../../assets/CameraIcon.svg";
import { useRef, useState } from "react";
import PhotoVerifyModal from "../../components/Modal/PhotoVerifyModal/PhotoVerifyModal";
import SuccessPhotoVerify from "../../components/Modal/SuccessPhotoVerify/SuccessPhotoVerify";
import FailPhotoVerify from "../../components/Modal/FailPhotoVerify/FailPhotoVerify";
import ToggleBox from "../../components/ToggleBox/ToggleBox";
import { errorToast, warningToast } from "../../utils/ToastUtil/toastUtil";
import { useLocation } from "react-router-dom";
import {
  getImgUploadUrl,
  postUploadUrl,
  uploadImageToPresignedUrl,
  verifyImage,
} from "../../api/MissionVerification/MissionVerification";

type ModalMode = "none" | "analyzing" | "success" | "fail";

const PhotoVerifyPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("none");

  const location = useLocation();
  const missionId = location.state?.missionId as number | undefined;

  if (!missionId) {
    errorToast("미션 정보를 찾을 수 없습니다.");
    return null;
  }

  const clickUploadBox = () => {
    fileInputRef.current?.click();
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      warningToast("사진 촬영에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setPhotoFile(file);

    if (previewPhoto) {
      URL.revokeObjectURL(previewPhoto);
    }

    const imgUrl = URL.createObjectURL(file);
    setPreviewPhoto(imgUrl);

    setModalMode("none");
  };

  const analyzePhoto = async () => {
    if (modalMode !== "analyzing") {
      setModalMode("analyzing");
    }

    try {
      if (!photoFile) {
        errorToast("업로드된 사진이 존재하지 않습니다.");
        return;
      }

      const res = await getImgUploadUrl(missionId);
      if (!res.data.success) throw new Error("업로드 URL 발급 실패");

      const { uploadUrl, uploadKey, uploadPreset } = res.data.data;

      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("upload_preset", uploadPreset);

      const response = await uploadImageToPresignedUrl({
        uploadUrl,
        formData,
      });

      const imageUrl = response.data.secure_url;

      const imageResource = {
        imageUrl: imageUrl,
        uploadKey: uploadKey,
      };
      const jobResponse = await postUploadUrl({ missionId, imageResource });

      const accessToken = localStorage.getItem("accessToken");
      const resultResponse = await verifyImage(
        jobResponse.data.data.jobId,
        accessToken as string
      );

      if (resultResponse === "COMPLETED") {
        setModalMode("success");
      } else {
        setModalMode("fail");
      }
    } catch (error) {
      console.log("에러", error);
      setModalMode("fail");
    }
  };

  const retryUpload = () => {
    if (modalMode !== "none") {
      setModalMode("none");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (previewPhoto) {
      URL.revokeObjectURL(previewPhoto);
    }

    setPreviewPhoto("");
  };

  return (
    <div className={style.wrapper}>
      <Header title={"미션 인증하기"} />
      <ToggleBox title="사진 가이드" />
      <div className={style.contents}>
        <div className={style.subTitle}>
          <img src={CameraIcon}></img>
          <p>사진 인증하기</p>
        </div>
        <div className={style.uploadBox} onClick={clickUploadBox}>
          {previewPhoto ? (
            <img src={previewPhoto} alt="미리보기" />
          ) : (
            <>
              <p>장소 인증을 위해 </p>
              <p>
                상단의 <strong>사진 가이드</strong>를 참고하여
              </p>
              <p>사진을 업로드해 주세요.</p>
              <div className={style.plusIcon}>
                <HiOutlinePlus />
              </div>
            </>
          )}

          <input
            className={style.input}
            type="file"
            capture="environment"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleCapture}
          />
        </div>
        {modalMode !== "analyzing" && (
          <button
            className={style.verifyButton}
            disabled={!previewPhoto}
            onClick={analyzePhoto}
          >
            인증 완료!
          </button>
        )}
      </div>

      {modalMode === "analyzing" && <PhotoVerifyModal imgUrl={previewPhoto} />}
      {modalMode === "success" && <SuccessPhotoVerify />}
      {modalMode === "fail" && <FailPhotoVerify onRetry={retryUpload} />}
    </div>
  );
};

export default PhotoVerifyPage;
