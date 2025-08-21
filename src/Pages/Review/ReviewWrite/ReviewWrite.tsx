import Header from "../../../components/Header/Header";
import style from "./ReviewWrite.module.css";
import Mark from "../../../assets/MarkIcon.svg";
import { useState } from "react";

const ReviewWrite = () => {
  const [reviewContent, setReviewContent] = useState("");

  const handleSaveReviewConten = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setReviewContent(e.target.value);
  };

  const registerReview = () => {
    // TODO: 리뷰 등록 api 연결
  };

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
          <p>금오공과대학교</p>
        </div>
        <div className={style.textareaWrapper}>
          <textarea
            maxLength={3000}
            className={style.input}
            value={reviewContent}
            onChange={handleSaveReviewConten}
          />
          <div className={style.textLength}>{reviewContent.length}/3000</div>
        </div>
        <button className={style.submitButton} onClick={registerReview}>
          리뷰 등록하기
        </button>
      </div>
    </div>
  );
};

export default ReviewWrite;
