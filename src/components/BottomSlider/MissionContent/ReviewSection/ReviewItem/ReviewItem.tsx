import style from "./ReviewItem.module.css";
import { formatDate } from "../../../../../utils/dateUtils";
import type { MissionReview } from "../../../../../types/review";

type Props = {
  review: MissionReview;
};

const ReviewItem = ({ review }: Props) => {
  const { year, month, day } = formatDate(review.reviewDate);

  return (
    <div className={style.container}>
      <div className={style.infoHeader}>
        <div className={style.userInfo}>
          <img
            src={review.profileImageUrl}
            alt="프로필"
            className={style.profileImg}
          />
          <p className={style.name}>{review.memberName}</p>
        </div>
        <p className={style.date}>
          {`${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`}
        </p>
      </div>
      <div className={style.review}>{review.reviewContent}</div>
      <img
        src={review.reviewImageUrl}
        className={style.missionImg}
        alt="리뷰 이미지"
      />
    </div>
  );
};

export default ReviewItem;
