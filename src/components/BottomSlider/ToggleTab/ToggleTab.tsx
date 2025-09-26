import type { SliderLevel } from "../../../hooks/useMissions";
import type { Tab } from "../../../Pages/MapPage/MapPage";
import style from "./ToggleTab.module.css";

type Props = {
  tab: Tab;
  setTab: React.Dispatch<React.SetStateAction<Tab>>;
  setSliderLevel: React.Dispatch<React.SetStateAction<SliderLevel>>;
};

const ToggleTab = ({ tab, setTab, setSliderLevel }: Props) => {
  return (
    <div className={style.toggleBox} aria-label="미션/리뷰 토글">
      <button
        type="button"
        className={`${style.toggleButton} ${
          tab === "mission" ? style.selected : ""
        }`}
        onClick={() => setTab("mission")}
      >
        미션
      </button>
      <div className={style.verticalLine} />
      <button
        type="button"
        className={`${style.toggleButton} ${
          tab === "review" ? style.selected : ""
        }`}
        onClick={() => {
          setTab("review");
          setSliderLevel("full");
        }}
      >
        리뷰
      </button>
    </div>
  );
};

export default ToggleTab;
