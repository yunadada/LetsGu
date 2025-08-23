import { Link } from "react-router-dom";
import style from "./TabBarItem.module.css";

type Props = {
  img: string;
  text: string;
  navUrl: string;
};

const TabBarItem = ({ img, text, navUrl }: Props) => {
  return (
    <Link className={style.container} to={navUrl}>
      <div className={style.circle}>
        <img src={img} />
      </div>
      <p>{text}</p>
    </Link>
  );
};

export default TabBarItem;
