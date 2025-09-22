import style from "./Loading.module.css";
import Spinner from "../../assets/Spinner.gif";

type Props = {
  text?: string;
};

const Loading = ({ text }: Props) => {
  return (
    <div className={style.wrapper}>
      <img src={Spinner} alt="로딩" />
      <p>{text}</p>
    </div>
  );
};

export default Loading;
