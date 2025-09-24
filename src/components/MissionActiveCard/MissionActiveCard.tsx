import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import type { Mission } from "../../api/mission";
import { categoryIcons } from "../../assets/icons/markerIcons";
import type { MarkerCategory } from "../../assets/icons/markerIcons";
import style from "./MissionActiveCard.module.css";
import { useNavigate } from "react-router-dom";

type Props = {
  mission: Mission | null;
  collapsed: boolean;
  setActiveCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveMission: React.Dispatch<React.SetStateAction<Mission | null>>;
  setSelectedMission: React.Dispatch<React.SetStateAction<Mission | null>>;
  badgeText?: string; // 기본: 수행중인 미션
};

const MissionActiveCard = ({
  mission,
  collapsed = false,
  setActiveCollapsed,
  setActiveMission,
  setSelectedMission,
  badgeText = "수행중인 미션",
}: Props) => {
  const missionCategory = mission?.placeCategory;
  const categoryKey: MarkerCategory =
    missionCategory && missionCategory in categoryIcons
      ? missionCategory
      : "LIFE_CONVENIENCE";

  const navigate = useNavigate();

  const handleToggle = () => {
    setActiveCollapsed(!collapsed);
  };

  const handleQuit = () => {
    setActiveMission(null);
    setSelectedMission(null);
    console.log("현재 선택된 미션", mission);
  };

  const handleCertify = () => {
    if (!mission) return;

    navigate("/locationVerification", {
      state: { missionId: mission.missionId, placeName: mission.placeName },
    });
  };

  return (
    <div className={style.activeBox} aria-live="polite">
      <div className={style.activeBoxHeader}>
        <span className={style.badgeText}>{badgeText}</span>
        <button
          className={style.toggleButton}
          type="button"
          onClick={handleToggle}
        >
          {collapsed ? (
            <>
              <IoIosArrowDown /> 펼치기
            </>
          ) : (
            <>
              <IoIosArrowUp />
              접기
            </>
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className={style.missionContents}>
            <img src={categoryIcons[categoryKey]} alt="" />
            <p className={style.missionDescription}>{mission?.description}</p>
          </div>

          <div className={style.activeBoxFooter}>
            <button type="button" onClick={handleQuit}>
              미션 그만두기
            </button>
            <div className={style.verticalLine} />
            <button type="button" onClick={handleCertify}>
              미션 인증하기
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MissionActiveCard;
