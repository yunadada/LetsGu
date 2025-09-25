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
import { errorToast } from "../../utils/ToastUtil/toastUtil";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const ActivityLog = () => {
  const [reviewCount, setReviewCount] = useState<ReviewCount>({
    unWrittenReviewCount: 0,
    writtenReviewCount: 0,
  });

  const [unwrittenLog, setUnwrittenLog] = useState<UnwrittenLogType[]>([]);
  const [unwrittenHasNext, setUnwrittenHasNext] = useState<
    Omit<PageResponse, "data">
  >({
    hasNext: false,
    nextCreatedAt: "",
    nextId: 0,
  });

  const [writtenLog, setWrittenLog] = useState<WrittenLogType[]>([]);
  const [writtenHasNext, setWrittenHasNext] = useState<
    Omit<PageResponse, "data">
  >({
    hasNext: false,
    nextCreatedAt: "",
    nextId: 0,
  });

  const [activeTab, setActiveTab] = useState<"unwritten" | "written">(
    "unwritten"
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 작성 가능한 리뷰
  const fetchUnwrittenMore = async () => {
    if (!unwrittenHasNext.hasNext) return;

    try {
      const res = await loadMore(
        "/api/v1/reviews/unwritten/page",
        unwrittenHasNext.nextId!
      );
      const { data, hasNext, nextCreatedAt, nextId } = res.data.data;

      setUnwrittenLog((prev) => [...prev, ...data]);
      setUnwrittenHasNext({
        hasNext,
        nextCreatedAt,
        nextId,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 작성한 리뷰
  const fetchWrittenMore = async () => {
    if (!writtenHasNext.hasNext) return;

    try {
      const res = await loadMore(
        "/api/v1/reviews/written/page",
        writtenHasNext.nextId!
      );
      const { data, hasNext, nextCreatedAt, nextId } = res.data.data;

      setWrittenLog((prev) => [...prev, ...data]);
      setWrittenHasNext({
        hasNext,
        nextCreatedAt,
        nextId,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 작성 가능한 리뷰
  const { ref: unwrittenRef, isIntersecting: isUnwrittenIntersecting } =
    useIntersectionObserver(() => {
      if (isUnwrittenIntersecting) {
        if (activeTab === "unwritten") fetchUnwrittenMore();
      }
    }, scrollRef);

  // 작성한 리뷰
  const { ref: writtenRef, isIntersecting: isWrittenIntersecting } =
    useIntersectionObserver(() => {
      if (isWrittenIntersecting) {
        if (activeTab === "written") fetchWrittenMore();
      }
    }, scrollRef);

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
        errorToast("활동내역을 불러오는데 실패했습니다.");
        console.log(e);
      }
    };

    getOverview();
  }, []);

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
      <div className={style.contents} ref={scrollRef}>
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
              {unwrittenHasNext.hasNext && (
                <div ref={unwrittenRef} className={style.loaderBox} />
              )}
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
            {writtenHasNext.hasNext && (
              <div ref={writtenRef} className={style.loaderBox} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
