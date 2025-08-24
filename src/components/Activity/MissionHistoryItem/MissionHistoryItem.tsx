import { Link } from "react-router-dom";
import style from "./MissionHistoryItem.module.css";
import { MdEdit } from "react-icons/md";
import type { UnwrittenLogType, WrittenLogType } from "../../../types/review";
import { useState } from "react";
import ReviewDetailModal from "../../Modal/ReviewDetailModal/ReviewDetailModal";

type Props =
  | { status: "unwritten"; data: UnwrittenLogType }
  | { status: "written"; data: WrittenLogType };

const MissionHistoryItem = ({ status, data }: Props) => {
  const actData = data;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 타입 가드: UnwrittenLogType인지 확인
  const isUnwrittenLog = (
    data: UnwrittenLogType | WrittenLogType
  ): data is UnwrittenLogType => {
    return (data as UnwrittenLogType).completedMissionId !== undefined;
  };

  // 타입 가드: WrittenLogType인지 확인
  const isWrittenLog = (
    data: UnwrittenLogType | WrittenLogType
  ): data is WrittenLogType => {
    return (data as WrittenLogType).reviewId !== undefined;
  };

  return (
    <>
      <div
        className={style.container}
        onClick={status === "written" ? openModal : undefined}
      >
        <img className={style.img} src={actData.imageUrl} alt="미션" />
        {status === "unwritten" && isUnwrittenLog(actData) && (
          <Link
            className={style.edit}
            to={{
              pathname: "/reviewWrite",
            }}
            state={{
              missionId: actData.completedMissionId,
              placeName: actData.placeName,
            }}
          >
            <MdEdit />
          </Link>
        )}

        <p>{actData.address}</p>
        <h3>{actData.placeName}</h3>
      </div>
      {isModalOpen && isWrittenLog(actData) && (
        <ReviewDetailModal data={actData} closeModal={closeModal} />
      )}
    </>
  );
};

export default MissionHistoryItem;
