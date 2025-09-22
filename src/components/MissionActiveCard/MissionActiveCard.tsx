import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import type { Mission } from "../../api/mission";
import { categoryIcons } from "../../assets/icons/markerIcons";
import type { MarkerCategory } from "../../assets/icons/markerIcons";
import "./MissionActiveCard.css";

type Props = {
  description: string;
  collapsed?: boolean;
  onToggle?: () => void;
  onQuit?: () => void;
  onCertify?: () => void;
  badgeText?: string; // 기본: 수행중인 미션
  selectedMission: Mission | null;
};

const MissionActiveCard = ({
  description,
  collapsed = false,
  onToggle,
  onQuit,
  onCertify,
  badgeText = "수행중인 미션",
  selectedMission,
}: Props) => {
  const missionCategory = selectedMission?.placeCategory;
  const categoryKey: MarkerCategory =
    missionCategory && missionCategory in categoryIcons
      ? missionCategory
      : "LIFE_CONVENIENCE";

  return (
    <section className="mission-active-card" aria-live="polite">
      <div className="mac-top">
        <span className="mac-badge">{badgeText}</span>
        <button className="mac-fold" type="button" onClick={onToggle}>
          {collapsed ? <IoIosArrowDown /> : <IoIosArrowUp />}
          접기
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="mac-pin">
            <img
              src={categoryIcons[categoryKey]}
              alt=""
              width={40}
              height={60}
            />
          </div>

          <p className="mac-desc">{description}</p>

          <div className="mac-footer">
            <button className="mac-ghost" type="button" onClick={onQuit}>
              미션 그만두기
            </button>
            <i className="mac-divider" />
            <button className="mac-ghost" type="button" onClick={onCertify}>
              미션 인증하기
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default MissionActiveCard;
