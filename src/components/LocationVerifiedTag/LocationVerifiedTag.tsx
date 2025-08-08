import style from "./LocationVerifiedTag.module.css";
import Mark from "../../assets/MarkIcon.svg";

const LocationVerifiedTag = () => {
  return (
    <div className={style.tag}>
      <img src={Mark}></img>
      <p>위치인증 완료!</p>
    </div>
  );
};

export default LocationVerifiedTag;
