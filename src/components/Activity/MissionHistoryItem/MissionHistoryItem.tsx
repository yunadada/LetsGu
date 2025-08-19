import style from "./MissionHistoryItem.module.css";
import { MdEdit } from "react-icons/md";

type Props = {
  status: "unwritten" | "written";
};

const MissionHistoryItem = ({ status }: Props) => {
  return (
    <div className={style.container}>
      <img
        className={style.img}
        src="https://picsum.photos/seed/picsum/200/300"
      />
      {status === "unwritten" ? (
        <button className={style.edit}>
          <MdEdit />
        </button>
      ) : (
        ""
      )}

      <p>구미시 지산동 845-85</p>
      <h3>지산샛강생태공원</h3>
    </div>
  );
};

export default MissionHistoryItem;
