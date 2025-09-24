import EmptyReview from "./EmptyReview/EmptyReview";
import ReviewItem from "./ReviewItem/ReviewItem";
import style from "./ReviewSection.module.css";

const ReviewSection = () => {
  return (
    <div className={style.container}>
      {/* <EmptyReview /> */}
      {/* 리뷰 개수에 따른 조건부 렌더링 */}

      <div className={style.reviewHeader}>
        <p>
          리뷰 수 <strong>3</strong>
        </p>
        <div>
          <p>최신순</p>
        </div>
      </div>
      <div className={style.reviewContentsScroll}>
        <ReviewItem />
        <ReviewItem />
        <ReviewItem />
      </div>
    </div>
  );
};

export default ReviewSection;
