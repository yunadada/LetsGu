import React, { useEffect, useMemo, useState } from "react";
import "./Wallet.css";
import "../RewardShop/RewardsShop.css";
import axiosInstance from "../../lib/axiosInstance";
import axios, { type AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import RewardHistorySheet from "./RewardHistorySheet";
import coin from "../../assets/coin.png";

/** ===== 타입 ===== */
type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; code?: string; message?: string };
type MyPoint = { point: number };

/** 백엔드 원시 아이템 응답 (다양한 키를 포괄) */
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

  status?: string;   // "USED" | "AVAILABLE" 등
  used?: boolean;
  usedAt?: string;
};

/** my-wallet 원시 응답 */
type WalletApiRaw = {
  items?: RawItem[];
  giftCards?: RawItem[];
  partnerItems?: RawItem[];
  parentItems?: RawItem[];     // (오타 대비)
  consumedItems?: RawItem[];
  usedItems?: RawItem[];

  giftCardCount?: number;
  partnerItemCount?: number;
  consumedItemCount?: number;
};

type OwnedItem = {
  orderItemId: number; // 표준화 필수
  itemId: number;
  itemName: string;
  createdAt?: string;
  price?: number;

  // 사용 상태 플래그
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

/** 서버 에러메시지 안전 추출 (no any) */
const getMsg = (err: unknown, fallback = "네트워크 오류가 발생했습니다.") => {
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<{ message?: string }>;
    return axErr.response?.data?.message ?? fallback;
  }
  return fallback;
};

/** ===== 유틸: 표준화 ===== */
const toNum = (v: unknown): number | undefined => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return undefined;
};

const resolveOrderItemId = (raw: RawItem): number => {
  return (
    toNum(raw.orderItemId) ??
    toNum(raw.myWalletItemId) ??
    toNum(raw.orderId) ??
    toNum(raw.id) ??
    toNum(raw.itemId) ??
    NaN
  )!;
};

const norm = (arr: RawItem[] | undefined): OwnedItem[] =>
  (arr ?? []).map((raw) => {
    const oid = resolveOrderItemId(raw);
    const iid = toNum(raw.itemId ?? raw.id ?? oid) ?? oid;

    return {
      orderItemId: oid,
      itemId: iid,
      itemName: String(raw.itemName ?? raw.name ?? ""),
      createdAt: raw.createdAt,
      price: raw.price,
      status: raw.status,
      used: Boolean(raw.used ?? (raw.status === "USED")),
      usedAt: raw.usedAt,
    };
  });

/** 중복 제거 (orderItemId 기준) */
const uniqueById = <T extends { orderItemId: number }>(arr: T[]): T[] => {
  const m = new Map<number, T>();
  for (const it of arr) if (!m.has(it.orderItemId)) m.set(it.orderItemId, it);
  return [...m.values()];
};

const Wallet: React.FC = () => {
  const navigate = useNavigate();

  /** ===== 상태 ===== */
  const [point, setPoint] = useState<number>(0);
  const [wallet, setWallet] = useState<WalletPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [tab, setTab] = useState<"gift" | "partner" | "used">("gift");

  // 리워드 내역(선택)
  const [history, setHistory] = useState<RewardHistoryRow[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  /** ===== 데이터 로딩 ===== */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [pRes, wRes] = await Promise.all([
          axiosInstance.get<ApiOk<MyPoint> | ApiErr>("/api/v1/wallet/my-point", {
            headers: { Accept: "application/json" },
          }),
          axiosInstance.get<ApiOk<WalletApiRaw> | ApiErr>("/api/v1/wallet/my-wallet", {
            headers: { Accept: "application/json" },
          }),
        ]);

        if (!alive) return;

        // 포인트
        if ("success" in pRes.data && pRes.data.success) {
          setPoint(pRes.data.data.point ?? 0);
        } else {
          setErrMsg((pRes.data as ApiErr).message || "포인트를 불러올 수 없어요.");
        }

        // 지갑
        if ("success" in wRes.data && wRes.data.success) {
          const raw = wRes.data.data;

          // 1) 먼저 사용된 아이템 모으기
          const consumedItems = norm(
            raw.consumedItems ??
              raw.usedItems ??
              (raw.items ?? []).filter(
                (i) => i.status === "USED" || Boolean(i.used) || Boolean(i.usedAt)
              )
          );

          // 사용된 ID 집합
          const usedIdSet = new Set(consumedItems.map((x) => x.orderItemId));

          // 2) 미사용만 분리
          const allItems = raw.items ?? [];
          const byNameIsVoucher = (n: string | undefined) => /상품권/.test(n ?? "");

          const giftCards = norm(
            raw.giftCards ?? allItems.filter((i) => byNameIsVoucher(i.itemName))
          ).filter(
            (x) =>
              !usedIdSet.has(x.orderItemId) &&
              !x.used &&
              x.status !== "USED" &&
              !x.usedAt
          );

          const partnerItems = norm(
            raw.partnerItems ??
              raw.parentItems ?? // (오타 대비)
              allItems.filter((i) => !byNameIsVoucher(i.itemName))
          ).filter(
            (x) =>
              !usedIdSet.has(x.orderItemId) &&
              !x.used &&
              x.status !== "USED" &&
              !x.usedAt
          );

          setWallet({
            giftCardCount: raw.giftCardCount ?? giftCards.length,
            partnerItemCount: raw.partnerItemCount ?? partnerItems.length,
            consumedItemCount: raw.consumedItemCount ?? consumedItems.length,
            giftCards: uniqueById(giftCards),
            partnerItems: uniqueById(partnerItems),
            consumedItems: uniqueById(consumedItems),
          });
        } else {
          setErrMsg((wRes.data as ApiErr).message || "지갑을 불러올 수 없어요.");
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

  /** 리워드 내역: 열 때 한번 조회 */
  useEffect(() => {
    if (!historyOpen) return;
    let alive = true;
    (async () => {
      try {
        setHistoryLoading(true);
        const { data } = await axiosInstance.get<ApiOk<RewardHistoryRow[]> | ApiErr>(
          "/api/v1/wallet/reward-history",
          { headers: { Accept: "application/json" } }
        );
        if (!alive) return;
        if ("success" in data && data.success) {
          setHistory(data.data);
        } else {
          setErrMsg((data as ApiErr).message || "리워드 내역을 불러올 수 없어요.");
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

  /** ===== 파생 값 ===== */
  const list = useMemo(() => {
    if (!wallet) return [];
    const { giftCards = [], partnerItems = [], consumedItems = [] } = wallet;
    return tab === "gift" ? giftCards : tab === "partner" ? partnerItems : consumedItems;
  }, [wallet, tab]);

  const consumedIdSet = useMemo(
    () => new Set((wallet?.consumedItems ?? []).map((i) => i.orderItemId)),
    [wallet?.consumedItems]
  );

  /** ===== 핸들러 ===== */
  const handleUse = async (it: OwnedItem) => {
    const id = it.orderItemId || it.itemId;

    const alreadyUsed =
      consumedIdSet.has(id) || it.used || it.status === "USED" || Boolean(it.usedAt);

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
        // UI 동기화
        setWallet((prev) => {
          if (!prev) return prev;
          const giftCards = prev.giftCards ?? [];
          const partnerItems = prev.partnerItems ?? [];
          const consumedItems = prev.consumedItems ?? [];

          const nextGift =
            tab === "gift" ? giftCards.filter((x) => x.orderItemId !== id) : giftCards;
          const nextPartner =
            tab === "partner"
              ? partnerItems.filter((x) => x.orderItemId !== id)
              : partnerItems;

          return {
            ...prev,
            giftCards: nextGift,
            partnerItems: nextPartner,
            consumedItems: [{ ...it, orderItemId: id, used: true, status: "USED" }, ...consumedItems],
            giftCardCount: tab === "gift" ? Math.max(0, prev.giftCardCount - 1) : prev.giftCardCount,
            partnerItemCount:
              tab === "partner"
                ? Math.max(0, prev.partnerItemCount - 1)
                : prev.partnerItemCount,
            consumedItemCount: prev.consumedItemCount + 1,
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

  /** ===== 렌더 ===== */
  return (
    <div className="shop-container">
      {/* 헤더 */}
      <header className="shop-header">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/")} aria-label="뒤로가기">
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
          <h1 className="shop-title">내 지갑</h1>
          <div className="topbar-spacer" />
        </div>

        {/* 상단 카드 (포인트/요약) */}
        <div className="wallet-summary">
          <div className="ws-card">
            <div className="ws-title">보유 리워드</div>
            <div className="ws-point">
              <img src={coin} alt="" className="coin-img" aria-hidden />
              {point.toLocaleString()} P
            </div>
          </div>
          {wallet && (
            <div className="ws-stats">
              <div className="ws-stat">상품권 {wallet.giftCardCount}</div>
              <div className="ws-dot" />
              <div className="ws-stat">제휴 {wallet.partnerItemCount}</div>
              <div className="ws-dot" />
              <button className="ws-link" onClick={() => setHistoryOpen(true)}>
                리워드 내역 보기
              </button>
            </div>
          )}
        </div>

        {/* 탭 */}
        <nav className="tabs">
          <button className={`tab-btn ${tab === "gift" ? "active" : ""}`} onClick={() => setTab("gift")}>
            내 상품권
          </button>
          <button className={`tab-btn ${tab === "partner" ? "active" : ""}`} onClick={() => setTab("partner")}>
            내 제휴쿠폰
          </button>
          <button className={`tab-btn ${tab === "used" ? "active" : ""}`} onClick={() => setTab("used")}>
            사용한 아이템
          </button>
        </nav>
      </header>

      {/* 내역 패널 */}
      {historyOpen && (
        <section className="history">
          {historyLoading ? (
            <p className="meta">내역 불러오는 중…</p>
          ) : history.length === 0 ? (
            <p className="meta">표시할 내역이 없어요.</p>
          ) : (
            <ul className="h-list">
              {history.map((row) => (
                <li key={row.pointTransactionId} className="h-item">
                  <div className="h-left">
                    <div className="h-type">{row.pointType}</div>
                    <div className="h-sub">
                      {row.createdAt?.replace("T", " ").slice(0, 16) || ""}
                    </div>
                  </div>
                  <div className={`h-amount ${row.changeAmount >= 0 ? "pos" : "neg"}`}>
                    {row.changeAmount >= 0 ? "+" : ""}
                    {row.changeAmount.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 리스트 */}
      <main className="wallet-body">
        {loading && <p className="meta">불러오는 중…</p>}
        {!loading && !wallet && <p className="error">지갑 정보를 불러오지 못했어요.</p>}

        {!loading && wallet && (list?.length ?? 0) === 0 && <p className="meta">표시할 아이템이 없어요.</p>}

        {!loading && wallet && list.length > 0 && (
          <ul className="w-list">
            {(list ?? []).map((it, idx) => {
              const base = it.orderItemId ?? it.itemId;
              const key = `${String(base)}-${it.createdAt ?? idx}`;

              const isUsed =
                consumedIdSet.has(it.orderItemId) ||
                it.used ||
                it.status === "USED" ||
                Boolean(it.usedAt);

              return (
                <li key={key} className="w-item">
                  <div className="w-thumb" aria-hidden />
                  <div className="w-main">
                    <div className="w-name">{it.itemName}</div>
                    {it.createdAt && (
                      <div className="w-sub">{new Date(it.createdAt).toLocaleDateString()}</div>
                    )}
                  </div>
                  {tab === "used" || isUsed ? (
                    <span className="w-used">사용됨</span>
                  ) : (
                    <button className="btn-primary w-use" disabled={isUsed} onClick={() => handleUse(it)}>
                      사용하기
                    </button>
                  )}
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
