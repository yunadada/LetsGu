import { useCallback, useEffect, useRef, useState } from "react";
import EmptyReview from "./EmptyReview/EmptyReview";
import ReviewItem from "./ReviewItem/ReviewItem";
import style from "./ReviewSection.module.css";
import { getMissionReviewsPreview, loadMore } from "../../../../api/reviews";
import type { MissionReview, PageResponse } from "../../../../types/review";
import { useIntersectionObserver } from "../../../../hooks/useIntersectionObserver";

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

  const [isFetching, setIsFetching] = useState(false);

  const getPreReview = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const res = await getMissionReviewsPreview(missionId);
      const { count, missionReviewResponse, reviewPage } = res.data.data;

      setReviewCount(count);
      setReviewData(missionReviewResponse);
      setNextPage(reviewPage);
      console.log(reviewPage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  }, [missionId]);

  useEffect(() => {
    getPreReview();
  }, [getPreReview]);

  const getMoreReviewData = useCallback(async () => {
    try {
      console.log("=================================");
      const res = await loadMore(
        `/api/v1/missions/${missionId}/reviews/scroll`,
        undefined,
        nextPageRef.current.nextId!
      );

      console.log("데이터 불러오기");
      if (res.data.success === "true") {
        const { data, hasNext, nextCreatedAt, nextId } = res.data.data;
        console.log(data, hasNext, nextCreatedAt, nextId);

        setReviewData((prev) => [...prev, ...data]);
        setNextPage({ hasNext, nextCreatedAt, nextId });
      }
    } catch (e) {
      console.log(e);
    }
  }, [missionId]);

  const nextPageRef = useRef(nextPage);
  useEffect(() => {
    nextPageRef.current = nextPage;
  }, [nextPage]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { ref, isIntersecting } = useIntersectionObserver(() => {
    console.log("넥스트", nextPage);
    if (isIntersecting) {
      if (nextPageRef.current.hasNext && nextPageRef.current.nextId) {
        console.log("데이터 more!!");
        getMoreReviewData();
      }
    }
  }, scrollRef);

  return (
    <div className={style.container}>
      <div className={style.reviewHeader}>
        <p>
          리뷰 수 <strong>{reviewCount}</strong>
        </p>
        <div>
          <p>최신순</p>
        </div>
      </div>
      <div className={style.contentsScroll} ref={scrollRef}>
        {reviewData.length === 0 ? (
          <EmptyReview />
        ) : (
          reviewData.map((review, idx) => (
            <ReviewItem key={idx} review={review} />
          ))
        )}
        {nextPage.hasNext && <div ref={ref} className={style.loaderBox} />}
      </div>
    </div>
  );
};

export default ReviewSection;
