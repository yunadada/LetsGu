import style from "./ActivityLog.module.css";
import Header from "../../components/Header/Header";
import { useState } from "react";
import EmptyText from "../../components/Activity/EmptyText/EmptyText";
import MissionHistoryItem from "../../components/Activity/MissionHistoryItem/MissionHistoryItem";

const ActivityLog = () => {
  const [activeTab, setActiveTab] = useState<"unwritten" | "written">(
    "unwritten"
  );

  return (
    <div className={style.wrapper}>
      <Header title="활동 내역" />
      <div className={style.navBar}>
        <button
          className={`${style.unwritten} ${
            activeTab === "unwritten" ? style.active : ""
          }`}
          onClick={() => setActiveTab("unwritten")}
        >
          작성 가능한 리뷰(0)
        </button>
        <button
          className={`${style.written} ${
            activeTab === "written" ? style.active : ""
          }`}
          onClick={() => setActiveTab("written")}
        >
          작성한 리뷰(0)
        </button>
      </div>
      <div className={style.contents}>
        {/* <EmptyText type={activeTab} /> */}
        <div className={style.hasItem}>
          <MissionHistoryItem status={activeTab} />
          <MissionHistoryItem status={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
