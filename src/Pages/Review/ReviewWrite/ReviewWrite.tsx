import Header from "../../../components/Header/Header";
import style from "./ReviewWrite.module.css";
import Mark from "../../../assets/MarkIcon.svg";
import { useEffect, useState, type ChangeEvent } from "react";
import SuccessReviewModal from "../../../components/Modal/SuccessReviewModal/SuccessReviewModal";
import { submitReview } from "../../../api/reviews";
import { errorToast, warningToast } from "../../../utils/ToastUtil/toastUtil";
import { useLocation, useNavigate } from "react-router-dom";
import type { ReviewWriteState } from "../../../types/review";

const ReviewWrite = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const state = (location.state ?? {}) as ReviewWriteState;
  const missionId = state.missionId;
  const placeName = state.placeName;

  const [reviewContent, setReviewContent] = useState("");
  const [isReviewSubmittedModalOpen, setIsReviewSubmittedModalOpen] =
    useState(false);

  const handleSaveReviewContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setReviewContent(e.currentTarget.value);
  };

  const registerReview = async () => {
    try {
      if (!reviewContent) {
        warningToast("리뷰를 작성해주세요.");
        return;
      }

      const data = { completedMissionId: missionId, content: reviewContent };
      const res = await submitReview(data);

      console.log("리뷰 제출", res.data);
      if (res.data.success) {
        setIsReviewSubmittedModalOpen(true);
      }
    } catch (e) {
      console.log(e);
      errorToast("에러 발생");
    }
  };

  useEffect(() => {
    if (!missionId) {
      warningToast("다시 시도해주세요.");
      navigate(-1);
    }
  }, [missionId, navigate]);

  return (
    <div className={style.wrapper}>
      <Header title="리뷰 남기기" />
      <div className={style.contents}>
        <div className={style.subTitle}>
          <p>미션은 어땠나요?</p>
          <p>
            자유롭게 <span>리뷰</span>를 <span>남겨보세요.</span>
          </p>
        </div>
        <div className={style.location}>
          <img src={Mark} alt="" />
          <p>{placeName}</p>
        </div>
        <div className={style.textareaWrapper}>
          <textarea
            maxLength={3000}
            className={style.input}
            value={reviewContent}
            onChange={handleSaveReviewContent}
          />
          <div className={style.textLength}>{reviewContent.length}/3000</div>
        </div>
        <button className={style.submitButton} onClick={registerReview}>
          리뷰 등록하기
        </button>
      </div>
      {isReviewSubmittedModalOpen && <SuccessReviewModal />}
    </div>
  );
};

export default ReviewWrite;
