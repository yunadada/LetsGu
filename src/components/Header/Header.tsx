import style from "./Header.module.css";
import { IoChevronBackOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  title: string;
};

const Header = ({ title }: Props) => {
  const navigate = useNavigate();

  return (
    <header className={style.header}>
      <button onClick={() => navigate(-1)}>
        <IoChevronBackOutline />
      </button>
      <p>{title}</p>
    </header>
  );
};

export default Header;
