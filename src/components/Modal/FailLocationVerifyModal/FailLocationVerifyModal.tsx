import { useNavigate } from "react-router-dom";
import style from "./FailLocationVerifyModal.module.css";

type Props = {
  handleModal: React.Dispatch<React.SetStateAction<boolean>>;
  retryLocationVerification: () => Promise<void>;
  errorSentences: {
    sentence1: string;
    sentence2: string;
  };
};

const FailLocationVerifyModal = ({
  handleModal,
  retryLocationVerification,
  errorSentences,
}: Props) => {
  const navigate = useNavigate();

  const handleRetryLocationVerification = async () => {
    handleModal(false);
    await retryLocationVerification();
  };

  const cancelLocationVerify = () => {
    navigate("/map");
  };

  return (
    <div className={style.modalOverlay}>
      <div className={style.modal}>
        <h4>위치인증 실패</h4>
        <p>{errorSentences.sentence1}</p>
        <p>{errorSentences.sentence2}</p>
        <div className={style.button}>
          <button className={style.cancelButton} onClick={cancelLocationVerify}>
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
