import { useEffect, useMemo, useState } from "react";
import type { Mission } from "../api/mission";
import type { Tab } from "../Pages/MapPage/MapPage";
import { getMissionReviewsPreview, type ReviewsResponse } from "../api/reviews";
import { AxiosError } from "axios";

type Props = {
  selectedMission: Mission | null;
  tab: Tab;
};

export type MissionReview = {
  reviewId: number;
  memberName: string;
  reviewContent: string;
  reviewImageUrl?: string;
  reviewDate: string;
};

type PageResponse = {
  hasNext: boolean;
  nextCreatedAt: string;
  nextId: number;
};

type PreviewResponse = {
  count: number;
  missionReviewResponse: MissionReview[];
  reviewPage: PageResponse;
};

export const useReviews = ({ selectedMission, tab }: Props) => {
  const [reviews, setReviews] = useState<MissionReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>(
    {}
  );

  const [data, setData] = useState<PreviewResponse>({
    count: 0,
    missionReviewResponse: [],
    reviewPage: { hasNext: false, nextCreatedAt: "", nextId: 0 },
  });

  const [error, setError] = useState<ReviewsResponse>({
    success: "false",
    code: "",
    message: "",
  });

  const [nextPage, setNextPage] = useState<PageResponse>({
    hasNext: false,
    nextCreatedAt: "",
    nextId: 0,
  });

  const hasReviews = reviews.length > 0;
  const toggleExpand = (id: number) =>
    setExpanded((reviewId) => ({ ...reviewId, [id]: !reviewId[id] }));

  const sortedReviews = useMemo(() => {
    const arr = [...reviews];
    arr.sort((a, b) => {
      const ta = new Date(a.reviewDate).getTime();
      const tb = new Date(b.reviewDate).getTime();
      return sortOrder === "latest" ? tb - ta : ta - tb;
    });
    return arr;
  }, [reviews, sortOrder]);

  const fetchMissionReviewsPreview = async (missionId: number) => {
    try {
      // setLoading(true);
      const res = await getMissionReviewsPreview(missionId);

      if (res.data.success === "true") {
        const previewData = res.data.data;
        setData(previewData);
        return previewData;
      }
    } catch (e) {
      if (e instanceof AxiosError) {
        const errorData = e.response?.data;
        setError(errorData);
        console.log(e);
        return errorData;
      }
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "review" || !selectedMission) return;
    let alive = true;
    (async () => {
      setReviewsLoading(true);
      setReviewsError("");
      setReviews([]);
      try {
        const res = await fetchMissionReviewsPreview(selectedMission.missionId);
        if (!alive) return;

        setReviews(res.list);
        setNextPage({
          hasNext: res.hasNext,
          nextCreatedAt: res.nextCreatedAt,
          nextId: res.nextId,
        });
      } catch (e) {
        if (!alive) return;
        setReviewsError("리뷰를 불러오지 못했어요.");
        console.log(e);
      } finally {
        if (alive) setReviewsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [tab, selectedMission, sortOrder]);

  return {
    data,
    error,
    nextPage,
    sortedReviews,
    hasReviews,
    reviewsLoading,
    reviewsError,
    sortOrder,
    setSortOrder,
    expanded,
    toggleExpand,
  };
};
