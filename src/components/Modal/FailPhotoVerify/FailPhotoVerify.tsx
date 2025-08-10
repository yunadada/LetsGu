import style from "./FailPhotoVerify.module.css";

type Props = {
  onRetry: () => void;
};

const FailPhotoVerify = ({ onRetry }: Props) => {
  return (
    <div className={style.wrapper}>
      <p className={style.mainDescription}>사진 인식에 실패했습니다.</p>
      <p className={style.subDescription}>
        장소가 잘 나오도록 다시 시도해주세요.
      </p>
      <button className={style.button} onClick={() => onRetry()}>
        다시 사진 업로드하기
      </button>
    </div>
  );
};

export default FailPhotoVerify;
