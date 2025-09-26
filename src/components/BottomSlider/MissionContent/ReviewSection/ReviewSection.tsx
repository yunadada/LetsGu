import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EmptyReview from "./EmptyReview/EmptyReview";
import ReviewItem from "./ReviewItem/ReviewItem";
import style from "./ReviewSection.module.css";
import { getMissionReviewsPreview, loadMore } from "../../../../api/reviews";
import type { MissionReview, PageResponse } from "../../../../types/review";
import { useIntersectionObserver } from "../../../../hooks/useIntersectionObserver";
import {
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";

type Props = {
  missionId: number;
};

const ReviewSection = ({ missionId }: Props) => {
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewData, setReviewData] = useState<MissionReview[]>([]);
  const [nextPage, setNextPage] = useState<PageResponse>({
    hasNext: true,
    nextId: null,
    nextCreatedAt: null,
  });
  const [sortOrder, setSortOrder] = useState<"DESC" | "ASC">("DESC");

  const getPreReview = useCallback(async () => {
    try {
      const res = await getMissionReviewsPreview(missionId);
      const { count, missionReviewResponse, reviewPage } = res.data.data;

      console.log("미션 리뷰 데이터:", missionReviewResponse);
      setReviewCount(count);
      setReviewData(missionReviewResponse);
      setNextPage(reviewPage);
      // console.log(reviewPage);
    } catch (e) {
      console.error(e);
    }
  }, [missionId]);

  useEffect(() => {
    getPreReview();
  }, [getPreReview]);

  const isLoadingMoreRef = useRef(false);
  const getMoreReviewData = useCallback(async () => {
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;

    try {
      // console.log("=================================");
      const res = await loadMore(
        `/api/v1/missions/${missionId}/reviews/scroll`,
        undefined,
        nextPageRef.current.nextId!
      );

      // console.log("데이터 불러오기");
      if (res.data.success === "true") {
        const { data, hasNext, nextCreatedAt, nextId } = res.data.data;
        // console.log(data, hasNext, nextCreatedAt, nextId);

        setReviewData((prev) => [...prev, ...data]);
        setNextPage({ hasNext, nextCreatedAt, nextId });
      }
    } catch (e) {
      console.log(e);
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [missionId]);

  const nextPageRef = useRef(nextPage);
  useEffect(() => {
    nextPageRef.current = nextPage;
  }, [nextPage]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { ref, isIntersecting } = useIntersectionObserver(() => {
    // console.log("넥스트", nextPage);
    if (isIntersecting) {
      if (nextPageRef.current.hasNext && nextPageRef.current.nextId) {
        // console.log("데이터 more!!");
        getMoreReviewData();
      }
    }
  }, scrollRef);

  const sortedReviewData = useMemo(() => {
    return [...reviewData].sort((a, b) => {
      const dateA = new Date(a.reviewDate).getTime();
      const dateB = new Date(b.reviewDate).getTime();

      return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
    });
  }, [reviewData, sortOrder]);

  return (
    <div className={style.container}>
      <div className={style.reviewHeader}>
        <p>
          리뷰 수 <strong>{reviewCount}</strong>
        </p>
        <div
          className={style.sort}
          onClick={() =>
            setSortOrder((prev) => (prev === "DESC" ? "ASC" : "DESC"))
          }
        >
          <span
            className={`${style.upArrow} ${
              sortOrder === "DESC" ? style.active : ""
            }`}
          >
            <HiOutlineArrowNarrowUp />
          </span>
          <span
            className={`${style.downArrow} ${
              sortOrder === "ASC" ? style.active : ""
            }`}
          >
            <HiOutlineArrowNarrowDown />
          </span>
          <p>{sortOrder === "DESC" ? "최신순" : "오래된순"}</p>
        </div>
      </div>
      <div className={style.contentsScroll} ref={scrollRef}>
        {sortedReviewData.length === 0 ? (
          <EmptyReview />
        ) : (
          sortedReviewData.map((review, idx) => (
            <ReviewItem key={idx} review={review} />
          ))
        )}
        {nextPage.hasNext && <div ref={ref} className={style.loaderBox} />}
      </div>
    </div>
  );
};

export default ReviewSection;
