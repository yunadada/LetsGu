import style from "./PhotoVerifyPage.module.css";
import Header from "../../components/Header/Header";
import { HiOutlinePlus } from "react-icons/hi";
import CameraIcon from "../../assets/CameraIcon.svg";
import { useRef, useState } from "react";
import PhotoVerifyModal from "../../components/Modal/PhotoVerifyModal/PhotoVerifyModal";
import SuccessPhotoVerify from "../../components/Modal/SuccessPhotoVerify/SuccessPhotoVerify";
import FailPhotoVerify from "../../components/Modal/FailPhotoVerify/FailPhotoVerify";
import ToggleBox from "../../components/ToggleBox/ToggleBox";
import { warningToast } from "../../utils/ToastUtil/toastUtil";

type ModalMode = "none" | "analyzing" | "success" | "fail";

const PhotoVerifyPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string>("");
  const [modalMode, setModalMode] = useState<ModalMode>("none");

  const clickUploadBox = () => {
    fileInputRef.current?.click();
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      warningToast("사진 촬영에 실패했습니다. 다시 시도해주세요.");
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
