import style from "./ReviewItem.module.css";
import Profile from "../../../../../assets/defaultProfileImg.svg";
import { formatDate } from "../../../../../utils/dateUtils";

const ReviewItem = () => {
  const { year, month, day } = formatDate();

  return (
    <div className={style.container}>
      <div className={style.infoHeader}>
        <div className={style.userInfo}>
          <img src={Profile} alt="프로필" className={style.profileImg} />
          <p className={style.name}>홍길동</p>
        </div>
        <p className={style.date}>
          {`${year}.${month.padStart(2, "0")}.${day.padStart(2, "0")}`}
        </p>
      </div>
      <div className={style.review}>리뷰를 작성합니다.</div>
      <img
        src="https://picsum.photos/seed/picsum/200/300"
        className={style.missionImg}
      />
    </div>
  );
};

export default ReviewItem;
