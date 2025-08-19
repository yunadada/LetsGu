import style from "./ReviewDetail.module.css";
import MissionHistoryDetailItem from "../../../components/Activity/MissionHistoryDetailItem/MissionHistoryDetailItem";
import Header from "../../../components/Header/Header";
import { HiOutlineArrowNarrowUp } from "react-icons/hi";
import { HiOutlineArrowNarrowDown } from "react-icons/hi";

const ReviewDetail = () => {
  return (
    <div className={style.wrapper}>
      <Header title="작성한 리뷰" />
      <div className={style.sortBar}>
        <p>
          리뷰 수 <span>5</span>
        </p>
        <div className={style.sort}>
          <span className={style.upArrow}>
            <HiOutlineArrowNarrowUp />
          </span>
          <span className={style.downArrow}>
            <HiOutlineArrowNarrowDown />
          </span>
          <p>날짜순</p>
        </div>
      </div>
      <div className={style.contents}>
        <MissionHistoryDetailItem />
      </div>
    </div>
  );
};

export default ReviewDetail;
