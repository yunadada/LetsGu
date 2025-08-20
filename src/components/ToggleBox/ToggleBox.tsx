import style from "./ToggleBox.module.css";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import GuideIcon from "../../assets/GuideIcon.svg";
import { useState } from "react";

type Props = {
  title: string;
};

const ToggleBox = ({ title }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={style.container}>
      <div className={`${style.collapsed} ${isExpanded ? style.open : ""}`}>
        <div className={style.title}>
          <img src={GuideIcon} />
          <p>{title}</p>
        </div>
        <button onClick={toggleExpand}>
          {isExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </button>
      </div>
      {isExpanded ? (
        <>
          <div
            className={`${style.expanded} ${isExpanded ? style.active : ""}`}
          >
            <hr />
            <img src="https://picsum.photos/seed/picsum/200/300" />
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default ToggleBox;
