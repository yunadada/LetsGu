import style from "./GuideBox.module.css";
import Alert from "../../assets/Alert.svg";

type Props = {
  text: string;
};

const GuideBox = ({ text }: Props) => {
  return (
    <div className={style.guideWrapper}>
      <img className={style.guideIcon} src={Alert} alt="" aria-hidden />
      <p className={style.guideText}>{text}</p>
    </div>
  );
};

export default GuideBox;
