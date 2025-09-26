import type { Mission } from "../../../../api/mission";
import style from "./MissionSection.module.css";

type Props = {
  selectedMission: Mission;
  acceptMission: () => void;
};

const MissionSection = ({ selectedMission, acceptMission }: Props) => {
  return (
    <div className={style.container}>
      <div className={style.content}>
        <div className={style.description}>{selectedMission.description}</div>
        <p className={style.location}>{selectedMission.address}</p>
      </div>
      {selectedMission.tip.trim() && (
        <div className={style.tip}>
          <div className={style.tipTag}>TMI</div>
          <p>{selectedMission.tip}</p>
        </div>
      )}
      <button
        className={style.acceptButton}
        onClick={acceptMission}
        disabled={selectedMission.isCompleted}
      >
        {selectedMission.isCompleted ? "완료된 미션" : "미션 수락하기"}
      </button>
    </div>
  );
};

export default MissionSection;
