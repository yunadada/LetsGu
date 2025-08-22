import { IoIosClose } from "react-icons/io";
import type { UnwrittenLogType, WrittenLogType } from "../../../types/review";
import style from "./MissionHistoryDetailItem.module.css";

type Props = {
  data: UnwrittenLogType | WrittenLogType;
};

const MissionHistoryDetailItem = ({ data }: Props) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  return (
    <div className={style.container}>
      <img className={style.img} src={data.imageUrl}></img>
      <div className={style.contents}>
        <p className={style.location}>{data.address}</p>
        <h3 className={style.name}>{data.placeName}</h3>
        <p className={style.description}>{data.content}</p>
        <p className={style.date}>{formatDate(data.createdAt)}</p>
      </div>
    </div>
  );
};

export default MissionHistoryDetailItem;
