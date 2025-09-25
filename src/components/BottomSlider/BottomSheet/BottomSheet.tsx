import type { Mission } from "../../../api/mission";
import type { SliderLevel } from "../../../hooks/useMissions";
import type { Tab } from "../../../Pages/MapPage/MapPage";
import MissionSection from "../MissionContent/MissionSection/MissionSection";
import ReviewSection from "../MissionContent/ReviewSection/ReviewSection";
import ToggleTab from "../ToggleTab/ToggleTab";
import style from "./BottomSheet.module.css";

type Props = {
  selectedMission: Mission;
  isOpen: boolean;
  setSliderLevel: React.Dispatch<React.SetStateAction<SliderLevel>>;
  tab: Tab;
  setTab: React.Dispatch<React.SetStateAction<Tab>>;
  acceptMission: () => void;
};

const BottomSheet = ({
  selectedMission,
  setSliderLevel,
  tab,
  setTab,
  acceptMission,
}: Props) => {
  return (
    <div className={style.container}>
      <hr />
      <ToggleTab tab={tab} setTab={setTab} setSliderLevel={setSliderLevel} />
      <div className={style.contents}>
        {tab === "review" ? (
          <ReviewSection missionId={selectedMission.missionId} />
        ) : (
          <MissionSection
            selectedMission={selectedMission}
            acceptMission={acceptMission}
          />
        )}
      </div>
    </div>
  );
};

export default BottomSheet;
