// src/pages/Wallet/Wallet.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./Wallet.css";
import "../RewardShop/RewardsShop.css";
import axiosInstance from "../../lib/axiosInstance";
import axios, { type AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import RewardHistorySheet from "./RewardHistorySheet";
import coin from "../../assets/coin.png";
import rewardIcon from "../../assets/RewardHistory.png";

/** ===== 타입 ===== */
type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; code?: string; message?: string };
type MyPoint = { point: number };

type RawItem = {
  orderItemId?: number | string;
  myWalletItemId?: number | string;
  orderId?: number | string;
  id?: number | string;
  itemId?: number | string;

  itemName?: string;
  name?: string;

  createdAt?: string;
  price?: number;

  status?: string; // "USED" | "AVAILABLE" 등
  used?: boolean;
  usedAt?: string;
};

type WalletApiRaw = {
  items?: RawItem[];
  giftCards?: RawItem[];
  partnerItems?: RawItem[];
  parentItems?: RawItem[];
  consumedItems?: RawItem[];
  usedItems?: RawItem[];
  giftCardCount?: number;
  partnerItemCount?: number;
  consumedItemCount?: number;
};

type OwnedItem = {
  orderItemId: number;
  itemId: number;
  itemName: string;
  createdAt?: string;
  price?: number;
  status?: string;
  used?: boolean;
  usedAt?: string;
};

type WalletPayload = {
  giftCardCount: number;
  partnerItemCount: number;
  consumedItemCount: number;
  giftCards?: OwnedItem[];
  partnerItems?: OwnedItem[];
  consumedItems?: OwnedItem[];
};

type RewardHistoryRow = {
  pointTransactionId: number;
  pointType: string;
  changeAmount: number;
  balanceAfter: number;
  createdAt?: string;
};

type CatalogItem = { itemId: number; imageUrl?: string; itemName?: string };

/** ===== 유틸 ===== */
const getMsg = (err: unknown, fallback = "네트워크 오류가 발생했습니다.") => {
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<{ message?: string }>;
    return axErr.response?.data?.message ?? fallback;
  }
  return fallback;
};

const toNum = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (!Number.isNaN(n) && Number.isFinite(n)) return n;
  }
  return undefined;
};

// 안정적 해시(문자열 -> 양수 정수). 실제 ID가 없을 때 대체용.
const stableHash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  h = Math.abs(h);
  return h === 0 ? 1 : h;
};

// 안전한 orderItemId 계산: 실수치 있으면 그대로, 없으면 음수 해시 사용
const resolveOrderItemId = (raw: RawItem): number => {
  const candidates = [
    raw.orderItemId,
    raw.myWalletItemId,
    raw.orderId,
    raw.id,
    raw.itemId,
  ];
  for (const v of candidates) {
    const n = toNum(v);
    if (typeof n === "number") return n;
  }
  const key = `${raw.itemName ?? raw.name ?? ""}|${raw.createdAt ?? ""}`;
  return -stableHash(key);
};

const norm = (arr: RawItem[] | undefined): OwnedItem[] =>
  (arr ?? []).map((raw) => {
    const oid = resolveOrderItemId(raw);
    const iid =
      toNum(raw.itemId ?? raw.id) ?? (oid > 0 ? oid : stableHash(String(oid)));
    return {
      orderItemId: oid,
      itemId: iid,
      itemName: String(raw.itemName ?? raw.name ?? ""),
      createdAt: raw.createdAt,
      price: raw.price,
      status: raw.status,
      used: Boolean(raw.used ?? raw.status === "USED"),
      usedAt: raw.usedAt,
    };
  });

const isVoucherName = (n?: string) =>
  /(상품권|지역사랑|모바일\s*상품권|기프트\s*카드|gift\s*card|전자\s*상품권)/i.test(
    n ?? ""
  );

const validityText = (name?: string) =>
  isVoucherName(name) ? "발행일부터 6년" : "발행일부터 1년";

const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  return `${Y}.${M}.${D}`;
};

const uniqueById = <T extends { orderItemId: number }>(arr: T[]): T[] => {
  const m = new Map<number, T>();
  for (const it of arr) if (!m.has(it.orderItemId)) m.set(it.orderItemId, it);
  return [...m.values()];
};

/** ===== 컴포넌트 ===== */
const Wallet: React.FC = () => {
  const navigate = useNavigate();

  const [point, setPoint] = useState<number>(0);
  const [wallet, setWallet] = useState<WalletPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [tab, setTab] = useState<"gift" | "partner" | "used">("gift");
  const [images, setImages] = useState<Record<number, string>>({});

  const [history, setHistory] = useState<RewardHistoryRow[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  /** 포인트 + 지갑 (단일 useEffect) */
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

        // 포인트
        if ("success" in pRes.data && pRes.data.success) {
          setPoint(pRes.data.data.point ?? 0);
          console.log(wRes);
        } else {
          setErrMsg(
            (pRes.data as ApiErr).message || "포인트를 불러올 수 없어요."
          );
        }

        // 지갑
        if ("success" in wRes.data && wRes.data.success) {
          const raw = wRes.data.data;

          // 1) 서버가 준 모든 배열을 합쳐 표준화 후 중복 제거
          const allRaw: RawItem[] = [
            ...(raw.items ?? []),
            ...(raw.giftCards ?? []),
            ...(raw.partnerItems ?? []),
            ...(raw.parentItems ?? []),
            ...(raw.consumedItems ?? []),
            ...(raw.usedItems ?? []),
          ];
          const all = uniqueById(norm(allRaw));

          // 2) "사용됨" ID = usedItems ∪ consumedItems ∪ (플래그 기반)
          const ids_from_usedItems = new Set(
            norm(raw.usedItems ?? []).map((i) => i.orderItemId)
          );
          const ids_from_consumedItems = new Set(
            norm(raw.consumedItems ?? []).map((i) => i.orderItemId)
          );
          const ids_from_flags = new Set(
            all
              .filter((x) => x.used || x.status === "USED" || x.usedAt)
              .map((x) => x.orderItemId)
          );
          const usedId = new Set<number>([
            ...Array.from(ids_from_usedItems),
            ...Array.from(ids_from_consumedItems),
            ...Array.from(ids_from_flags),
          ]);

          // 3) 분류
          const usedItems = all.filter((i) => usedId.has(i.orderItemId));
          const available = all.filter((i) => !usedId.has(i.orderItemId));

          const giftCards = uniqueById(
            available.filter((i) => isVoucherName(i.itemName))
          );
          const partnerItems = uniqueById(
            available.filter((i) => !isVoucherName(i.itemName))
          );

          // 4) 카운트는 실제 목록 길이로
          setWallet({
            giftCardCount: giftCards.length,
            partnerItemCount: partnerItems.length,
            consumedItemCount: usedItems.length,
            giftCards,
            partnerItems,
            consumedItems: uniqueById(usedItems),
          });
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

  /** 이미지 카탈로그 로딩 */
  useEffect(() => {
    const ids = new Set<number>();
    const add = (arr?: OwnedItem[]) =>
      (arr ?? []).forEach((i) => i?.itemId && ids.add(i.itemId));
    add(wallet?.giftCards);
    add(wallet?.partnerItems);
    add(wallet?.consumedItems);
    if (ids.size === 0) return;

    let alive = true;
    (async () => {
      try {
        const { data } = await axiosInstance.get<{
          success: boolean | "true" | "false";
          data: CatalogItem[];
        }>("/api/v1/items", { headers: { Accept: "application/json" } });

        const ok = data?.success === true || data?.success === "true";
        if (!alive || !ok) return;

        const map: Record<number, string> = {};
        for (const it of data.data) {
          if (it?.itemId && it?.imageUrl) map[it.itemId] = it.imageUrl;
        }
        setImages((prev) => ({ ...prev, ...map }));
      } catch {
        /* 이미지 없으면 썸네일 그라데이션 유지 */
      }
    })();

    return () => {
      alive = false;
    };
  }, [wallet?.giftCards, wallet?.partnerItems, wallet?.consumedItems]);

  /** 리워드 내역: 열 때 한번 조회 */
  useEffect(() => {
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
        console.log(data);
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
        if (alive) setHistoryLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [historyOpen]);

  /** 파생 */
  const giftCount = wallet?.giftCards?.length ?? 0;
  const partnerCount = wallet?.partnerItems?.length ?? 0;
  const consumedCount = wallet?.consumedItems?.length ?? 0;

  const list = useMemo(() => {
    if (!wallet) return [];
    return tab === "gift"
      ? wallet.giftCards ?? []
      : tab === "partner"
      ? wallet.partnerItems ?? []
      : wallet.consumedItems ?? [];
  }, [wallet, tab]);

  const consumedIdSet = useMemo(
    () => new Set((wallet?.consumedItems ?? []).map((i) => i.orderItemId)),
    [wallet?.consumedItems]
  );

  /** 핸들러 */
  const handleUse = async (it: OwnedItem) => {
    const id = it.orderItemId || it.itemId;

    const alreadyUsed =
      consumedIdSet.has(id) ||
      it.used ||
      it.status === "USED" ||
      Boolean(it.usedAt);

    if (!id || Number.isNaN(Number(id))) {
      setErrMsg("아이템 ID를 확인할 수 없어요.");
      return;
    }
    if (alreadyUsed) {
      setErrMsg("이미 사용한 아이템이에요.");
      return;
    }

    try {
      const { data } = await axiosInstance.post<ApiOk<null> | ApiErr>(
        `/api/v1/wallet/my-wallet/${id}`,
        undefined,
        { headers: { Accept: "application/json" } }
      );

      if ("success" in data && data.success) {
        // 로컬 상태 동기화: 해당 아이템을 사용 목록으로 이동
        setWallet((prev) => {
          if (!prev) return prev;
          const move = (arr: OwnedItem[] = []) =>
            arr.filter((x) => x.orderItemId !== id);

          const wasVoucher = isVoucherName(it.itemName);

          const nextGift = wasVoucher ? move(prev.giftCards) : prev.giftCards;
          const nextPartner = wasVoucher
            ? prev.partnerItems
            : move(prev.partnerItems);

          const nextConsumed = [
            { ...it, orderItemId: id, used: true, status: "USED" },
            ...(prev.consumedItems ?? []),
          ];

          return {
            ...prev,
            giftCards: nextGift,
            partnerItems: nextPartner,
            consumedItems: uniqueById(nextConsumed),
            // 카운트는 렌더 시 파생 계산하므로 그대로 두어도 됨
          };
        });
      } else {
        setErrMsg((data as ApiErr).message || "사용 실패");
      }
    } catch (e) {
      setErrMsg(getMsg(e, "사용 실패"));
    }
  };

  // 토스트 자동 닫힘
  useEffect(() => {
    if (!errMsg) return;
    const t = setTimeout(() => setErrMsg(null), 2500);
    return () => clearTimeout(t);
  }, [errMsg]);

  /** 렌더 */
  return (
    <div className="shop-container">
      <header className="shop-header">
        <div className="topbar">
          <button
            className="back-btn"
            onClick={() => navigate("/")}
            aria-label="뒤로가기"
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M15 18L9 12l6-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="shop-header-title">내 지갑</div>
          <div className="topbar-spacer" />
        </div>

        <div className="wallet-summary">
          <div className="ws-card">
            <div className="ws-top">
              <div className="ws-label">현재 나의 리워드</div>
              <div className="ws-rule" aria-hidden />
            </div>
            <div className="ws-amount">
              <img src={coin} alt="" className="coin-img" aria-hidden />
              <span className="num">{point.toLocaleString()}</span>
            </div>
            <button className="ws-history" onClick={() => setHistoryOpen(true)}>
              <img src={rewardIcon} alt="" aria-hidden />
              리워드 내역
            </button>
          </div>
        </div>

        {/* 탭: 카운트 알약 추가 */}
        <nav className="tabs">
          <button
            className={`tab-btn ${tab === "gift" ? "active" : ""}`}
            onClick={() => setTab("gift")}
          >
            <span>내 상품권</span>
            <span className="count-pill">{giftCount}</span>
          </button>
          <button
            className={`tab-btn ${tab === "partner" ? "active" : ""}`}
            onClick={() => setTab("partner")}
          >
            <span>내 제휴 쿠폰</span>
            <span className="count-pill">{partnerCount}</span>
          </button>
          <button
            className={`tab-btn ${tab === "used" ? "active" : ""}`}
            onClick={() => setTab("used")}
          >
            <span>사용한 아이템</span>
            <span className="count-pill">{consumedCount}</span>
          </button>
        </nav>
      </header>

      <main className="wallet-body">
        {/* 스켈레톤 */}
        {loading && (
          <div className="skeleton-list">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="s-card">
                  <div className="s-thumb" />
                  <div className="s-lines">
                    <div className="s-line w80" />
                    <div className="s-line w60" />
                  </div>
                </div>
                <div className="w-stub">
                  <div className="s-btn" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !wallet && (
          <p className="meta">지갑 정보를 불러오지 못했어요.</p>
        )}
        {!loading && wallet && (list?.length ?? 0) === 0 && (
          <p className="meta">표시할 아이템이 없어요.</p>
        )}

        {!loading && wallet && list.length > 0 && (
          <ul className="w-list">
            {list.map((it, idx) => {
              const base = it.orderItemId ?? it.itemId;
              const key = `${String(base)}-${it.createdAt ?? idx}`;
              const isUsed = Boolean(
                it.used || it.status === "USED" || it.usedAt
              );
              const voucher =
                /(상품권|지역사랑|모바일\s*상품권|기프트\s*카드|gift\s*card|전자\s*상품권)/i.test(
                  it.itemName
                );
              const img = images[it.itemId];

              return (
                <li
                  key={key}
                  className={`w-item w-ticket-row ${
                    voucher ? "is-voucher" : "is-coupon"
                  } ${isUsed ? "is-used" : ""}`}
                >
                  <div className="w-ticket">
                    <div className="w-thumb">
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          loading="lazy"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      ) : null}
                    </div>
                    <div className="w-main">
                      <div className="w-name">{it.itemName}</div>
                      <div className="w-meta">
                        <div className="w-meta-row">
                          <span className="w-dt">발행일</span>
                          <span className="w-dd">{fmtDate(it.createdAt)}</span>
                        </div>
                        <div className="w-meta-row">
                          <span className="w-dt">사용기간</span>
                          <span className="w-dd">
                            {voucher ? "발행일부터 6년" : "발행일부터 1년"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`w-stub ${isUsed ? "done" : ""}`}>
                    {isUsed ? (
                      <span className="w-stub-text">사용완료</span>
                    ) : (
                      <button
                        className="w-stub-btn"
                        onClick={() => handleUse(it)}
                      >
                        사용하기
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* 리워드 시트/토스트는 기존 그대로 */}
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
