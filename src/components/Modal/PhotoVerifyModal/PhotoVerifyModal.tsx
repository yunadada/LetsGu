import style from "./PhotoVerifyModal.module.css";

type Props = {
  imgUrl?: string;
};

const PhotoVerifyModal = ({ imgUrl }: Props) => {
  return (
    <div className={style.modalOverlay}>
      <div className={style.photoBox}>
        <img src={imgUrl} alt="업로드한 사진"></img>
        <div className={style.scanBar}></div>
      </div>
      <div className={style.description}>
        <p>사진 정보 인식 중</p>
        <p>AI가 보다 정확하게 확인중이에요.</p>
      </div>
    </div>
  );
};

export default PhotoVerifyModal;
