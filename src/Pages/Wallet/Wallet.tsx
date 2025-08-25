// src/pages/Wallet/Wallet.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./Wallet.css";
import "../RewardShop/RewardsShop.css";
import axiosInstance from "../../lib/axiosInstance";
import axios, { type AxiosError } from "axios";
import RewardHistorySheet from "./RewardHistorySheet";
import rewardIcon from "../../assets/RewardHistory.png";
import Header from "../../components/Header/Header";
import Coin from "../../assets/Coin.svg";

/** ===== 타입 (새 스키마 대응) ===== */
type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; code?: string; message?: string };

type MyPoint = { point: number };

/** 서버가 지갑 목록에서 내려줄 수 있는 공통 필드 */
type WalletItemBase = {
  /** 서버가 줄 수도 있고, 안 줄 수도 있음 (없으면 사용 처리 불가) */
  orderItemId?: number;
  itemId: number;
  itemName: string;
  createdAt?: string;
  imageUrl?: string;
  /** 예전 호환 */
  price?: number;
  status?: string;
  used?: boolean;
  usedAt?: string;
};

type WalletApiRaw = {
  giftCardCount: number;
  parentItemCount: number; // ← 서버 필드명 (partner 오타 대응)
  consumedItemCount: number;

  giftCards: WalletItemBase[];
  parentItems: WalletItemBase[]; // ← partnerItems 대신
  consumedItems: WalletItemBase[];
};

type WalletPayload = {
  giftCardCount: number;
  partnerItemCount: number;
  consumedItemCount: number;
  giftCards: WalletItemBase[];
  partnerItems: WalletItemBase[];
  consumedItems: WalletItemBase[];
};

type RewardHistoryRow = {
  pointTransactionId: number;
  pointType: string;
  changeAmount: number;
  balanceAfter: number;
  createdAt?: string;
};

/** ===== 유틸 ===== */
const getMsg = (err: unknown, fb = "네트워크 오류가 발생했습니다.") => {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ message?: string }>;
    return ax.response?.data?.message ?? fb;
  }
  return fb;
};

// const fmtDate = (iso?: string) => {
//   if (!iso) return "-";
//   const d = new Date(iso);
//   const Y = d.getFullYear();
//   const M = String(d.getMonth() + 1).padStart(2, "0");
//   const D = String(d.getDate()).padStart(2, "0");
//   return `${Y}.${M}.${D}`;
// };

const validityText = (name?: string) =>
  /상품권|지역사랑|모바일\s*상품권|기프트\s*카드|gift\s*card|전자\s*상품권/i.test(
    name ?? ""
  )
    ? "발행일부터 6년"
    : "발행일부터 1년";

/** ===== 컴포넌트 ===== */
const Wallet: React.FC = () => {
  const [point, setPoint] = useState<number>(0);
  const [wallet, setWallet] = useState<WalletPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [tab, setTab] = useState<"gift" | "partner" | "used">("gift");

  const [history, setHistory] = useState<RewardHistoryRow[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  /** 포인트 + 지갑 (새 스키마 정규화) */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [pRes, wRes] = await Promise.all([
          axiosInstance.get<ApiOk<MyPoint> | ApiErr>(
            "/api/v1/wallet/my-point",
            {
              headers: { Accept: "application/json" },
            }
          ),
          axiosInstance.get<ApiOk<WalletApiRaw> | ApiErr>(
            "/api/v1/wallet/my-wallet",
            {
              headers: { Accept: "application/json" },
            }
          ),
        ]);
        if (!alive) return;

        console.log("[Wallet] ▶ my-point 응답:", pRes.data);
        console.log("[Wallet] ▶ my-wallet 응답:", wRes.data);
        if ("success" in pRes.data && pRes.data.success) {
          setPoint(pRes.data.data.point ?? 0);
        } else {
          setErrMsg(
            (pRes.data as ApiErr).message || "포인트를 불러올 수 없어요."
          );
        }

        // 지갑
        if ("success" in wRes.data && wRes.data.success) {
          const raw = wRes.data.data;
          // 서버 필드명(parentItems/parentItemCount)을 partner로 매핑
          const mapped: WalletPayload = {
            giftCardCount: raw.giftCardCount ?? raw.giftCards?.length ?? 0,
            partnerItemCount:
              raw.parentItemCount ?? raw.parentItems?.length ?? 0,
            consumedItemCount:
              raw.consumedItemCount ?? raw.consumedItems?.length ?? 0,
            giftCards: raw.giftCards ?? [],
            partnerItems: raw.parentItems ?? [],
            consumedItems: raw.consumedItems ?? [],
          };
          setWallet(mapped);
        } else {
          setErrMsg(
            (wRes.data as ApiErr).message || "지갑을 불러올 수 없어요."
          );
        }
      } catch (e) {
        if (!alive) return;
        setErrMsg(getMsg(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /** 리워드 내역 */
  useEffect(() => {
    if (!historyOpen) return;

    let alive = true;
    console.groupCollapsed("[Wallet] ▶ reward-history fetch");
    console.time("[Wallet] ⏱ fetch");

    (async () => {
      try {
        setHistoryLoading(true);
        console.log("요청 시작:", "/api/v1/wallet/reward-history");

        const { data } = await axiosInstance.get<
          ApiOk<RewardHistoryRow[]> | ApiErr
        >("/api/v1/wallet/reward-history", {
          headers: { Accept: "application/json" },
        });
        if (!alive) return;

        if ("success" in data && data.success) {
          console.log("✅ 응답 성공:", data);
          console.log("행 개수:", data.data?.length ?? 0);
          setHistory(data.data);
        } else {
          console.warn("❌ API 에러 payload:", data);
          setErrMsg(
            (data as ApiErr).message || "리워드 내역을 불러올 수 없어요."
          );
        }
      } catch (e) {
        if (!alive) return;
        console.error("❌ 요청 실패:", e);
        setErrMsg(getMsg(e));
      } finally {
        if (alive) {
          setHistoryLoading(false);
          console.timeEnd("[Wallet] ⏱ fetch");
          console.groupEnd();
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [historyOpen]);

  // state가 실제로 반영된 뒤 값을 보고 싶을 때
  useEffect(() => {
    console.log("[Wallet] ▶ history state 업데이트:", history.length, history);
  }, [history]);

  /** 파생 */
  const giftCount = wallet?.giftCards.length ?? 0;
  const partnerCount = wallet?.partnerItems.length ?? 0;
  const consumedCount = wallet?.consumedItems.length ?? 0;

  const list = useMemo(() => {
    if (!wallet) return [];
    return tab === "gift"
      ? wallet.giftCards
      : tab === "partner"
      ? wallet.partnerItems
      : wallet.consumedItems;
  }, [wallet, tab]);

  /** 사용하기: GET 응답에 orderItemId가 없는 경우 버튼 비노출/비활성 */
  // 사용하기: orderItemId가 있으면 그걸, 없으면 itemId 사용
  const handleUse = async (it: WalletItemBase) => {
    // ✅ 우선순위: orderItemId > itemId
    const id =
      it.orderItemId && it.orderItemId > 0 ? it.orderItemId : it.itemId;

    if (!id || id <= 0) {
      setErrMsg("이 아이템은 사용 가능한 ID가 없어 처리할 수 없어요.");
      return;
    }

    try {
      console.log("[Wallet] ▶ use 호출 ID:", id, {
        from: it.orderItemId ? "orderItemId" : "itemId",
        itemId: it.itemId,
        itemName: it.itemName,
      });

      const { data } = await axiosInstance.post<ApiOk<null> | ApiErr>(
        `/api/v1/wallet/my-wallet/${id}`,
        undefined,
        { headers: { Accept: "application/json" } }
      );

      if ("success" in data && data.success) {
        // 성공 시: 단순 재조회(카운트/파티션 서버 신뢰)
        const wRes = await axiosInstance.get<ApiOk<WalletApiRaw> | ApiErr>(
          "/api/v1/wallet/my-wallet",
          { headers: { Accept: "application/json" } }
        );
        if ("success" in wRes.data && wRes.data.success) {
          const raw = wRes.data.data;
          setWallet({
            giftCardCount: raw.giftCardCount ?? raw.giftCards?.length ?? 0,
            partnerItemCount:
              raw.parentItemCount ?? raw.parentItems?.length ?? 0,
            consumedItemCount:
              raw.consumedItemCount ?? raw.consumedItems?.length ?? 0,
            giftCards: raw.giftCards ?? [],
            partnerItems: raw.parentItems ?? [],
            consumedItems: raw.consumedItems ?? [],
          });
        }
      } else {
        setErrMsg((data as ApiErr).message || "사용 실패");
      }
    } catch (e) {
      console.error("[Wallet] ✖ use 에러:", e);
      setErrMsg(getMsg(e, "사용 실패"));
    }
  };

  // 시트 open 상태에 따라 body 스크롤 잠금
  useEffect(() => {
    if (historyOpen) {
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
    } else {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
    };
  }, [historyOpen]);

  // 토스트 자동 닫힘
  useEffect(() => {
    if (!errMsg) return;
    const t = setTimeout(() => setErrMsg(null), 2500);
    return () => clearTimeout(t);
  }, [errMsg]);

  /** 렌더 */
  return (
    <div className="shop-container">
      {/* 헤더 */}
      <header className="shop-header">
        <Header title="내 지갑" />

        {/* 상단 카드 */}
        <div className="wallet-summary">
          <div className="ws-card">
            <div className="ws-top">
              <div className="ws-label">현재 나의 리워드</div>
              <div className="ws-rule" aria-hidden />
            </div>

            <div className="ws-amount">
              <img src={Coin} alt="코인" className="coin-img" aria-hidden />
              <span className="num">{point.toLocaleString()}</span>
            </div>

            <button className="ws-history" onClick={() => setHistoryOpen(true)}>
              <img src={rewardIcon} alt="" aria-hidden />
              리워드 내역
            </button>
          </div>
        </div>

        {/* 탭 */}
        <nav className="tabs">
          <button
            className={`tab-btn ${tab === "gift" ? "active" : ""}`}
            onClick={() => setTab("gift")}
          >
            내 상품권<span className="count-pill">{giftCount}</span>
          </button>
          <button
            className={`tab-btn ${tab === "partner" ? "active" : ""}`}
            onClick={() => setTab("partner")}
          >
            내 제휴 쿠폰<span className="count-pill">{partnerCount}</span>
          </button>
          <button
            className={`tab-btn ${tab === "used" ? "active" : ""}`}
            onClick={() => setTab("used")}
          >
            사용한 아이템<span className="count-pill">{consumedCount}</span>
          </button>
        </nav>
      </header>

      {/* 리스트 */}
      <main className="wallet-body">
        {loading && <p className="meta">불러오는 중…</p>}
        {!loading && !wallet && (
          <p className="error">지갑 정보를 불러오지 못했어요.</p>
        )}
        {!loading && wallet && list.length === 0 && (
          <p className="meta">표시할 아이템이 없어요.</p>
        )}

        {!loading && wallet && list.length > 0 && (
          <ul className="w-list">
            {list.map((it, idx) => {
              const isUsed =
                tab === "used" ||
                it.used ||
                it.status === "USED" ||
                Boolean(it.usedAt);
              return (
                <li
                  key={`${it.itemId}-${it.createdAt ?? idx}`}
                  className={`w-item w-ticket-row ${isUsed ? "is-used" : ""}`}
                >
                  {/* 티켓 본체 */}
                  <div className="w-ticket">
                    <div className="w-thumb">
                      {it.imageUrl ? (
                        <img
                          src={it.imageUrl}
                          alt=""
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="w-main">
                      <div className="w-name">{it.itemName}</div>
                      <div className="w-meta">
                        <div className="w-meta-row">
                          {/* <span className="w-dt">발행일</span>
                          <span className="w-dd">{fmtDate(it.createdAt)}</span> */}
                        </div>
                        <div className="w-meta-row">
                          <span className="w-dt">사용기간</span>
                          <span className="w-dd">
                            {validityText(it.itemName)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 스텁 */}
                  <div className={`w-stub ${isUsed ? "done" : ""}`}>
                    {isUsed ? (
                      <span className="w-stub-text">사용완료</span>
                    ) : (it.orderItemId && it.orderItemId > 0) ||
                      (it.itemId && it.itemId > 0) ? (
                      <button
                        className="w-stub-btn"
                        onClick={() => handleUse(it)}
                      >
                        사용하기
                      </button>
                    ) : (
                      <span className="w-stub-text" title="ID 없음">
                        사용 불가
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* 하단 리워드 내역 시트 */}
      <RewardHistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        rows={history}
        loading={historyLoading}
        err={errMsg}
      />

      {errMsg && (
        <div className="toast" role="status" onClick={() => setErrMsg(null)}>
          {errMsg}
        </div>
      )}
    </div>
  );
};

export default Wallet;
