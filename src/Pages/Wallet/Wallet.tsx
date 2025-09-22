import React, { useEffect, useMemo, useState } from "react";
import "./Wallet.css";
import "../RewardShop/RewardsShop.css";
import axiosInstance from "../../lib/axiosInstance";
import axios, { type AxiosError } from "axios";
import RewardHistorySheet from "./RewardHistorySheet";
import rewardIcon from "../../assets/RewardHistory.png";
import Header from "../../components/Header/Header";
import Coin from "../../assets/Coin.svg";
import barcode from "../../assets/barcode.png";

/** ===== 타입 (새 스키마 대응) ===== */
type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; code?: string; message?: string };

type MyPoint = { point: number };

type WalletItemBase = {
  orderItemId?: number;
  itemId: number;
  itemName: string;
  createdAt?: string;
  imageUrl?: string;
  price?: number;
  status?: string;
  used?: boolean;
  usedAt?: string;
  couponNumber?: string;
  barcodeUrl?: string;
  isUsed?: boolean; // ⭐️ 변경: 모달에 사용 여부를 전달하기 위한 타입 추가
};

type WalletApiRaw = {
  giftCardCount: number;
  parentItemCount: number;
  consumedItemCount: number;

  giftCards: WalletItemBase[];
  parentItems: WalletItemBase[];
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



const validityText = (name?: string) =>
  /상품권|지역사랑|모바일\s*상품권|기프트\s*카드|gift\s*card|전자\s*상품권/i.test(
    name ?? ""
  )
    ? "발행일부터 6년"
    : "발행일부터 1년";

// ==================================================================
// ✅ 쿠폰 상세 정보 모달 컴포넌트
// ==================================================================
interface CouponModalProps {
  item: WalletItemBase | null;
  onClose: () => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ item, onClose }) => {
  if (!item) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        {/* ⭐️ 변경: isUsed 값에 따라 '사용완료' 도장을 조건부로 렌더링 */}
        <div className="coupon-image-placeholder">
          {item.isUsed && (
            <div className="used-stamp">
              <div className="stamp-text">사용완료</div>
            </div>
          )}
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="coupon-image"
            />
          ) : (
            <span>쿠폰 사진</span>
          )}
        </div>

        <div className="coupon-details">
          <div className="detail-row"></div>
          <div className="detail-row">
            <span className="detail-label">사용기한</span>
            <span className="detail-value">{validityText(item.itemName)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">쿠폰번호</span>
            <span className="detail-value">
              {item.couponNumber || "정보 없음"}
            </span>
          </div>
        </div>

        <div className="barcode-placeholder">
          {item.barcodeUrl ? (
            <img src={item.barcodeUrl} alt="바코드" className="barcode-image" />
          ) : (
            <span>바코드</span>
          )}
        </div>
      </div>
    </div>
  );
};

/** ===== 메인 컴포넌트 ===== */
const Wallet: React.FC = () => {
  const [point, setPoint] = useState<number>(0);
  const [wallet, setWallet] = useState<WalletPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<WalletItemBase | null>(
    null
  );
  const [tab, setTab] = useState<"gift" | "partner" | "used">("gift");
  const [history, setHistory] = useState<RewardHistoryRow[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  /** 포인트 + 지갑 (새 스키마 정규화) */
  useEffect(() => {
    // ... (기존과 동일)
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
        if ("success" in pRes.data && pRes.data.success) {
          setPoint(pRes.data.data.point ?? 0);
        } else {
          setErrMsg(
            (pRes.data as ApiErr).message || "포인트를 불러올 수 없어요."
          );
        }

        if ("success" in wRes.data && wRes.data.success) {
          const raw = wRes.data.data;
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
    // ... (기존과 동일)
    if (!historyOpen) return;
    let alive = true;
    (async () => {
      try {
        setHistoryLoading(true);
        const { data } = await axiosInstance.get<
          ApiOk<RewardHistoryRow[]> | ApiErr
        >("/api/v1/wallet/reward-history", {
          headers: { Accept: "application/json" },
        });
        if (!alive) return;

        if ("success" in data && data.success) {
          setHistory(data.data);
        } else {
          setErrMsg(
            (data as ApiErr).message || "리워드 내역을 불러올 수 없어요."
          );
        }
      } catch (e) {
        if (!alive) return;
        setErrMsg(getMsg(e));
      } finally {
        if (alive) {
          setHistoryLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [historyOpen]);

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

  // ⭐️ 변경: 모달을 여는 함수에 isUsed 파라미터 추가
  const handleShowCouponModal = async (it: WalletItemBase, isUsed: boolean) => {
    const couponWithDetails: WalletItemBase = {
      ...it,
      couponNumber: "1234-5678-9012-3456",
      barcodeUrl: barcode,
      isUsed: isUsed, // isUsed 상태를 객체에 포함
    };

    setSelectedCoupon(couponWithDetails);
  };

  // ... (나머지 useEffect 들은 기존과 동일)
  useEffect(() => {
    const isModalOpen = historyOpen || !!selectedCoupon;
    if (isModalOpen) {
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
  }, [historyOpen, selectedCoupon]);

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
        {/* ... (기존과 동일) ... */}
        <Header title="내 지갑" />
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
                  // ⭐️ 변경: 사용된 아이템의 경우 li 전체를 클릭하여 모달을 열 수 있도록 함
                  onClick={
                    isUsed ? () => handleShowCouponModal(it, true) : undefined
                  }
                >
                  <div className="w-ticket">
                    {/* ... (티켓 내용은 기존과 동일) ... */}
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
                          <span className="w-dt">사용기간</span>
                          <span className="w-dd">
                            {validityText(it.itemName)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`w-stub ${isUsed ? "done" : ""}`}>
                    {isUsed ? (
                      <span className="w-stub-text">사용완료</span>
                    ) : (it.orderItemId && it.orderItemId > 0) ||
                      (it.itemId && it.itemId > 0) ? (
                      <button
                        className="w-stub-btn"
                        // ⭐️ 변경: 사용하지 않은 아이템은 isUsed를 false로 전달
                        onClick={(e) => {
                          e.stopPropagation(); // li의 onClick 이벤트가 실행되는 것을 방지
                          handleShowCouponModal(it, false);
                        }}
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

      {/* 모달 렌더링 */}
      <CouponModal
        item={selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
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
