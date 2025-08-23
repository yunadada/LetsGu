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

  return (
    <>
      <div
        className={style.container}
        onClick={status === "written" ? openModal : undefined}
      >
        <img className={style.img} src={actData.imageUrl} alt="미션" />
        {status === "unwritten" ? (
          <Link
            className={style.edit}
            to={{
              pathname: "/reviewWrite",
            }}
            state={{ missionId: actData.completedMissionId }}
          >
            <MdEdit />
          </Link>
        ) : (
          ""
        )}

        <p>{actData.address}</p>
        <h3>{actData.placeName}</h3>
      </div>
      {isModalOpen && (
        <ReviewDetailModal data={actData} closeModal={closeModal} />
      )}
    </>
  );
};

export default MissionHistoryItem;
