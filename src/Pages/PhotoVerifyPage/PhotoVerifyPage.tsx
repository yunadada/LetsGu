import style from "./PhotoVerifyPage.module.css";
import MissionVerificationHeader from "../../components/Header/MissionVerificationHeader";
import { HiOutlinePlus } from "react-icons/hi";
import CameraIcon from "../../assets/CameraIcon.svg";
import { useRef, useState } from "react";
import PhotoVerifyModal from "../../components/Modal/PhotoVerifyModal/PhotoVerifyModal";
import SuccessPhotoVerify from "../../components/Modal/SuccessPhotoVerify/SuccessPhotoVerify";
import FailPhotoVerify from "../../components/Modal/FailPhotoVerify/FailPhotoVerify";

type ModalMode = "none" | "analyzing" | "success" | "fail";

const PhotoVerifyPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string>("");
  const [modalMode, setModalMode] = useState<ModalMode>("none");

  const clickUploadBox = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      alert("사진을 선택해주세요.");
      return;
    }

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

    // try {
    //   // TODO: 서버에 이미지 전송
    //   setModalMode("success");
    // } catch (error) {
    //   setModalMode("fail");
    // }
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
      <MissionVerificationHeader title={"미션 인증하기"} />
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
                <strong>사진을 추가</strong>해 주세요.
              </p>
              <div className={style.plusIcon}>
                <HiOutlinePlus />
              </div>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={uploadFile}
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
