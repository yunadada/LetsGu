import style from "./ReviewDetailModal.module.css";
import MissionHistoryDetailItem from "../../Activity/MissionHistoryDetailItem/MissionHistoryDetailItem";
import type { WrittenLogType } from "../../../types/review";

type Props = {
  data: WrittenLogType;
  closeModal: () => void;
};

const ReviewDetailModal = ({ data, closeModal }: Props) => {
  return (
    <div className={style.modalOverlay}>
      <MissionHistoryDetailItem data={data} />
      <button type="button" className={style.closeButton} onClick={closeModal}>
        닫기
      </button>
    </div>
  );
};

export default ReviewDetailModal;
