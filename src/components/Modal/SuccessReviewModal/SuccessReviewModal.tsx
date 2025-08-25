import { FiCheck } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import style from "./SuccessReviewModal.module.css";
import { Link } from "react-router-dom";

const SuccessReviewModal = () => {
  return (
    <div className={style.modalOverlay}>
      <div className={style.wrapper}>
        <Link className={style.closeIcon} to="/activityLog" replace>
          <IoIosClose />
        </Link>
        <div className={style.checkIcon}>
          <FiCheck />
        </div>
        <h4>리뷰 작성 완료!</h4>
        <p>
          <strong>+100 리워드</strong>를 적립해드렸어요.
        </p>
      </div>
    </div>
  );
};

export default SuccessReviewModal;
