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

  const unwrittenLoader = useRef<HTMLDivElement | null>(null);
  const writtenLoader = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<"unwritten" | "written">(
    "unwritten"
  );

  // 작성 가능한 리뷰
  const [isFetchingUnwritten, setIsFetchingUnwritten] = useState(false);
  const fetchUnwrittenMore = async () => {
    if (isFetchingUnwritten || !unwrittenHasNext.hasNext) return;
    setIsFetchingUnwritten(true);

    try {
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
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingUnwritten(false);
    }
  };

  // 작성한 리뷰
  const [isFetchingWritten, setIsFetchingWritten] = useState(false);
  const fetchWrittenMore = async () => {
    if (isFetchingWritten || !writtenHasNext.hasNext) return;
    setIsFetchingWritten(true);

    try {
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
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingWritten(false);
    }
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
        errorToast("활동내역을 불러오는데 실패했습니다.");
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
          if (
            activeTab === "unwritten" &&
            unwrittenHasNext.hasNext &&
            !isFetchingUnwritten
          ) {
            fetchUnwrittenMore();
          } else if (
            activeTab === "written" &&
            writtenHasNext.hasNext &&
            !isFetchingWritten
          ) {
            fetchWrittenMore();
          }
        }
      },
      { threshold: 0 }
    );

    if (activeTab === "unwritten" && unwrittenLoader.current) {
      observer.observe(unwrittenLoader.current);
    }
    if (activeTab === "written" && writtenLoader.current) {
      observer.observe(writtenLoader.current);
    }

    return () => observer.disconnect();
  }, [
    activeTab,
    unwrittenHasNext,
    writtenHasNext,
    isFetchingUnwritten,
    +isFetchingWritten,
  ]);

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
              {unwrittenHasNext.hasNext && (
                <div
                  ref={unwrittenLoader}
                  className={style.loaderBox}
                  aria-hidden="true"
                />
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
            {writtenHasNext.hasNext && <div ref={writtenLoader} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
