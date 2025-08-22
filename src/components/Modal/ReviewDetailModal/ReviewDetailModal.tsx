import style from "./ReviewDetailModal.module.css";
import MissionHistoryDetailItem from "../../Activity/MissionHistoryDetailItem/MissionHistoryDetailItem";
import type { UnwrittenLogType, WrittenLogType } from "../../../types/review";
// import { IoIosClose } from "react-icons/io";

type Props = {
  data: UnwrittenLogType | WrittenLogType;
  closeModal: () => void;
};

const ReviewDetailModal = ({ data, closeModal }: Props) => {
  return (
    <div className={style.modalOverlay}>
      <MissionHistoryDetailItem data={data} />
      <button type="button" className={style.closeButton} onClick={closeModal}>
        닫기
      </button>
      {/* <button type="button" className={style.closeButton}>
        <IoIosClose />
      </button> */}
    </div>
  );
};

export default ReviewDetailModal;
