import style from "./ToggleBox.module.css";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import GuideIcon from "../../assets/GuideIcon.svg";
import { useState } from "react";

type Props = {
  title: string;
  imgUrl: string;
};

const ToggleBox = ({ title, imgUrl }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <div className={`${style.collapsed} ${isExpanded ? style.open : ""}`}>
          <div className={style.title}>
            <img src={GuideIcon} alt="가이드 이미지" />
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
              <img src={imgUrl} alt="가이드 이미지" />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ToggleBox;
