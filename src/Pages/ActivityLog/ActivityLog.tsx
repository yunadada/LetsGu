import style from "./ActivityLog.module.css";
import Header from "../../components/Header/Header";
import { useEffect, useRef, useState } from "react";
import EmptyText from "../../components/Activity/EmptyText/EmptyText";
import MissionHistoryItem from "../../components/Activity/MissionHistoryItem/MissionHistoryItem";
import { getActivityOverview, loadMore } from "../../api/reviews";
import type {
  PageResponse,
  ReviewCount,
  UnwrittenLogType,
  WrittenLogType,
} from "../../types/review";

const ActivityLog = () => {
  const [reviewCount, setReviewCount] = useState<ReviewCount>({
    unWrittenReviewCount: 0,
    writtenReviewCount: 0,
  });
  const [unwrittenLog, setUnwrittenLog] = useState<UnwrittenLogType[]>([]);
  const [unwrittenHasNext, setUnwrittenHasNext] = useState<PageResponse>({});

  const [writtenLog, setWrittenLog] = useState<WrittenLogType[]>([]);
  const [writtenHasNext, setWrittenHasNext] = useState<PageResponse>({});

  const unwrittenLoader = useRef<HTMLDivElement | null>(null);
  const writtenLoader = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<"unwritten" | "written">(
    "unwritten"
  );

  // 작성 가능한 리뷰
  const fetchUnwrittenMore = async () => {
    const res = await loadMore(
      "/api/v1/reviews/unwritten/page",
      unwrittenHasNext.nextId
    );
    const moreData = res.data.data;
    setUnwrittenLog((prev) => [...prev, ...moreData.data]);
    setUnwrittenHasNext({
      hasNext: moreData.hasNext,
      nextCreatedAt: moreData.nextCreatedAt,
      nextId: moreData.nextId,
    });
  };

  // 작성한 리뷰
  const fetchWrittenMore = async () => {
    const res = await loadMore(
      "/api/v1/reviews/written/page",
      writtenHasNext.nextId
    );
    const moreData = res.data.data;
    setWrittenLog((prev) => [...prev, ...moreData.data]);
    setWrittenHasNext({
      hasNext: moreData.hasNext,
      nextCreatedAt: moreData.nextCreatedAt,
      nextId: moreData.nextId,
    });
  };

  useEffect(() => {
    const getOverview = async () => {
      try {
        const res = await getActivityOverview();

        if (res.data.success) {
          const data = res.data.data;
          setReviewCount({
            unWrittenReviewCount: data.unWrittenReviewCount,
            writtenReviewCount: data.writtenReviewCount,
          });

          setUnwrittenLog(data.unwritten);
          setWrittenLog(data.written);

          setUnwrittenHasNext(data.unwrittenPage);
          setWrittenHasNext(data.writtenPage);
        }
      } catch (e) {
        console.log(e);
      }
    };

    getOverview();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          if (activeTab === "unwritten" && unwrittenHasNext.hasNext) {
            fetchUnwrittenMore();
          } else if (activeTab === "written" && writtenHasNext.hasNext) {
            fetchWrittenMore();
          }
        }
      },
      { threshold: 1.0 }
    );

    if (activeTab === "unwritten" && unwrittenLoader.current) {
      observer.observe(unwrittenLoader.current);
    }
    if (activeTab === "written" && writtenLoader.current) {
      observer.observe(writtenLoader.current);
    }

    return () => observer.disconnect();
  }, [activeTab, unwrittenHasNext, writtenHasNext]);

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
          작성 가능한 리뷰({reviewCount?.unWrittenReviewCount})
        </button>
        <button
          className={`${style.written} ${
            activeTab === "written" ? style.active : ""
          }`}
          onClick={() => setActiveTab("written")}
        >
          작성한 리뷰({reviewCount?.writtenReviewCount})
        </button>
      </div>
      <div className={style.contents}>
        {activeTab === "unwritten" ? (
          reviewCount.unWrittenReviewCount === 0 ? (
            <EmptyText type="unwritten" />
          ) : (
            <div className={style.hasItem}>
              {unwrittenLog.map((item) => (
                <MissionHistoryItem
                  status="unwritten"
                  key={item.completedMissionId}
                  data={item}
                />
              ))}
              {unwrittenHasNext.hasNext && <div ref={unwrittenLoader} />}
            </div>
          )
        ) : reviewCount.writtenReviewCount === 0 ? (
          <EmptyText type="written" />
        ) : (
          <div className={style.hasItem}>
            {writtenLog.map((item) => (
              <MissionHistoryItem
                status="written"
                key={item.reviewId}
                data={item}
              />
            ))}
            {writtenHasNext.hasNext && <div ref={writtenLoader} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
