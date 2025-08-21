import style from "./NavItem.module.css";
import Arrow from "../../../assets/Arrow.svg";
import { useNavigate } from "react-router-dom";

type Props = {
  thumbnail: string;
  title: string;
  contents: React.ReactNode;
};

const NavItem = ({ thumbnail, title, contents }: Props) => {
  const navigate = useNavigate();

  const routePage = () => {
    switch (title) {
      case "마이페이지":
        navigate("/myPage");
        break;
      case "미션 수행하기":
        navigate("/map");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className={style.container}>
      <div className={style.img}>
        <img src={thumbnail} />
      </div>
      <button className={style.navButton} onClick={routePage}>
        <p>{title}</p>
        <img src={Arrow} />
      </button>
      <div className={style.contents}>{contents}</div>
    </div>
  );
};

export default NavItem;
