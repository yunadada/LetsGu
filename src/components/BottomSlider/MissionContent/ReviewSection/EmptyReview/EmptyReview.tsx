import style from "./EmptyReview.module.css";
import duck from "../.././../../../assets/duck.png";

const EmptyReview = () => (
  <div className={style.container}>
    <p className={style.text}>
      리뷰를 남기고 <strong>리워드</strong>를 받아보세요!
    </p>
    <img className={style.duckImg} src={duck} alt="" aria-hidden />
  </div>
);

export default EmptyReview;
