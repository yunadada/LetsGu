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
export default function MissionActiveCard({
  description,
  collapsed = false,
  onToggle,
  onQuit,
  onCertify,
  badgeText = "수행중인 미션",
  selectedMission,
}: Props) {
  const raw = selectedMission?.placeCategory as
    | keyof typeof categoryIcons
    | undefined;
  const catKey: MarkerCategory = (
    raw && raw in categoryIcons ? raw : "LIFE_CONVENIENCE"
  ) as MarkerCategory;

  return (
    <section className="mission-active-card" aria-live="polite">
      <div className="mac-top">
        <span className="mac-badge">{badgeText}</span>
        <button className="mac-fold" type="button" onClick={onToggle}>
          접기 <span className="mac-chevron">{collapsed ? "▾" : "▴"}</span>
        </button>
      </div>

      {!collapsed && (
        <>
          {/* 핀 래퍼로 감싸기 */}
          <div className="mac-pin">
            <img src={categoryIcons[catKey]} alt="" width={20} height={30} />
          </div>

          <p className="mac-desc">{description}</p>

          <div className="mac-footer">
            <button className="mac-ghost" type="button" onClick={onQuit}>
              미션 그만두기
            </button>
            <i className="mac-divider" />
            <button className="mac-ghost" type="button" onClick={onCertify} >
              미션 인증하기
            </button>
          </div>
        </>
      )}
    </section>
  );
}
