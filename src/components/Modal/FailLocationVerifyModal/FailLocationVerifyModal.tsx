import style from "./FailLocationVerifyModal.module.css";

type Props = {
  handleModal: React.Dispatch<React.SetStateAction<boolean>>;
  retryLocationVerification: () => Promise<void>;
};

const FailLocationVerifyModal = ({
  handleModal,
  retryLocationVerification,
}: Props) => {
  const handleRetryLocationVerification = async () => {
    handleModal(false);
    await retryLocationVerification();
  };

  return (
    <div className={style.modalOverlay}>
      <div className={style.modal}>
        <h4>위치인증 실패</h4>
        <p>위치인증을 하려면 설정에서</p>
        <p>위치정보서비스(GPS)를 켜야 합니다.</p>
        <div className={style.button}>
          <button
            className={style.cancelButton}
            // onClick={//TODO 지도 화면으로 이동}
          >
            취소하기
          </button>
          <button
            className={style.reverifyButton}
            onClick={handleRetryLocationVerification}
          >
            다시 인증하기
          </button>
        </div>
      </div>
    </div>
  );
};
export default FailLocationVerifyModal;
