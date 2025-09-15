import style from "./NavItem.module.css";
import { useNavigate } from "react-router-dom";

type Props = {
  thumbnail: string;
  title: string;
};

const NavItem = ({ thumbnail, title }: Props) => {
  const navigate = useNavigate();

  const routePage = () => {
    switch (title) {
      case "활동 내역":
        navigate("/activityLog");
        break;
      case "리워드 샵":
        navigate("/shop");
        break;
      case "내 지갑":
        navigate("/wallet");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className={style.container} onClick={routePage}>
      <div className={style.circle}>
        <img src={thumbnail} />
      </div>
      <p>{title}</p>
    </div>
  );
};

export default NavItem;
