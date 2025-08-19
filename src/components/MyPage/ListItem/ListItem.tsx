import style from "./ListItem.module.css";
import { IoChevronForwardOutline } from "react-icons/io5";

type Props = {
  text: string;
};

const ListItem = ({ text }: Props) => {
  return (
    <div className={style.container}>
      <p>{text}</p>
      <IoChevronForwardOutline />
    </div>
  );
};

export default ListItem;
