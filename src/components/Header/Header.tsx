import style from "./Header.module.css";
import { IoChevronBackOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

type Props = {
  title: string;
};

const MissionVerificationHeader = ({ title }: Props) => {
  return (
    <header className={style.header}>
      <Link to="/">
        <IoChevronBackOutline />
      </Link>
      <p>{title}</p>
    </header>
  );
};

export default MissionVerificationHeader;
