// src/Pages/RewardShop/RewardShop.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./RewardsShop.css";
import axiosInstance from "../../lib/axiosInstance";
import axios from "axios";
import ExchangeSheet from "./ExchangeSheet";
import { useNavigate } from "react-router-dom";
import coin from "../../assets/coin.png";
import giftbox from "../../assets/giftbox.png";

/** ===== 타입 ===== */
interface Item {
  itemId: number;
  itemName: string;
  price: number;
  count: number;
  imageUrl?: string;
}
interface ApiListRes {
  success: boolean | "true" | "false";
  data: Item[];
}
interface ApiPointRes {
  success: boolean | "true" | "false";
  data: { point: number };
}
interface ApiActionRes {
  success: boolean | "true" | "false";
  code?: string;
  message?: string;
  msg?: string;
  data?: unknown;
}
type ServerErr = { message?: string; code?: string; msg?: string };

/** ===== 헬퍼 ===== */
const isVoucher = (name: string) => name.includes("상품권");

// “구미사랑상품권” 접두사 제거
const cleanVoucherName = (name: string) =>
  name.replace(/구미사랑상품권/gi, "").trim() || name;

const truthy = (v: boolean | "true" | "false" | undefined): boolean =>
  v === true || v === "true";

const getAxiosMessage = (
  err: unknown,
  fb: string = "네트워크 오류가 발생했습니다."
): string =>
  axios.isAxiosError<ServerErr>(err) ? err.response?.data?.message ?? fb : fb;

// 응답 객체(성공/에러 공통)에서 서버 메시지 뽑기
const pickServerMsg = (v: unknown): string | null => {
  if (typeof v !== "object" || v === null) return null;
  const r = v as Record<string, unknown>;
  if (typeof r["msg"] === "string" && (r["msg"] as string).trim())
    return r["msg"] as string;
  if (typeof r["message"] === "string" && (r["message"] as string).trim())
    return r["message"] as string;
  if (r["code"] === "U002") return "아이템 교환에 필요한 포인트가 부족합니다.";
  return null;
};

/** ===== 컴포넌트 ===== */
const RewardShop: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔸 서버에서 포인트 받아옴
  const [points, setPoints] = useState<number>(0);

  const [tab, setTab] = useState<"voucher" | "partner">("voucher");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const navigate = useNavigate();

  /** 목록 + 포인트 동시 조회 */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [{ data: itemsData }, { data: pointData }] = await Promise.all([
          axiosInstance.get<ApiListRes>("/api/v1/items", {
            headers: { Accept: "application/json" },
          }),
          axiosInstance.get<ApiPointRes>("/api/v1/wallet/my-point", {
            headers: { Accept: "application/json" },
          }),
        ]);

        if (!mounted) return;

        // 아이템
        if (truthy(itemsData?.success)) setItems(itemsData.data ?? []);
        else setError("아이템을 불러오지 못했습니다.");

        // 포인트
        if (truthy(pointData?.success)) {
          setPoints(pointData.data?.point ?? 0);
        } else {
          // 포인트만 실패해도 전체 막진 않고 토스트만
          setMessage("포인트를 불러오지 못했습니다.");
        }
      } catch (err) {
        if (!mounted) return;
        setError(getAxiosMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** 탭 필터 */
  const filtered = useMemo(
    () =>
      items.filter((it) =>
        tab === "voucher" ? isVoucher(it.itemName) : !isVoucher(it.itemName)
      ),
    [items, tab]
  );

  /** 교환 시트 열기/닫기 */
  const openExchange = (item: Item) => {
    setSelected(item);
    setSheetOpen(true);
  };
  const closeExchange = () => {
    setSheetOpen(false);
    setTimeout(() => setSelected(null), 240);
  };

  /** 교환 요청 */
  const submitExchange = async (count: number) => {
    if (!selected) return;
    try {
      const { data } = await axiosInstance.post<ApiActionRes>(
        `/api/v1/items/${selected.itemId}`,
        { count }
      );

      if (truthy(data?.success)) {
        setPoints((p) => p - selected.price * count);
        setItems((prev) =>
          prev.map((it) =>
            it.itemId === selected.itemId
              ? { ...it, count: it.count - count }
              : it
          )
        );
        closeExchange();
        setSuccessOpen(true);
      } else {
        setMessage(pickServerMsg(data) ?? "교환 실패");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiActionRes | ServerErr>(err)) {
        const d = err.response?.data;
        const msg =
          pickServerMsg(d) ??
          (err.response?.status === 404
            ? "해당 상품을 찾을 수 없거나 교환할 수 없습니다."
            : "교환 실패");
        setMessage(msg);
      } else {
        setMessage("교환 실패");
      }
    }
  };

  /** 토스트 자동 닫힘 */
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className="shop-container">
      {/* 헤더 */}
      <header className="shop-header">
        <div className="topbar">
          <button
            className="back-btn"
            onClick={() => window.history.back()}
            aria-label="뒤로가기"
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
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
          <h1 className="shop-title">리워드 샵</h1>
          <div className="topbar-spacer" aria-hidden />
        </div>

        <nav className="tabs" role="tablist" aria-label="상품 유형">
          <button
            className={`tab-btn ${tab === "voucher" ? "active" : ""}`}
            role="tab"
            aria-selected={tab === "voucher"}
            onClick={() => setTab("voucher")}
          >
            구미사랑상품권
          </button>
          <button
            className={`tab-btn ${tab === "partner" ? "active" : ""}`}
            role="tab"
            aria-selected={tab === "partner"}
            onClick={() => setTab("partner")}
          >
            제휴 쿠폰
          </button>
        </nav>
      </header>

      {loading && <p className="meta">불러오는 중…</p>}
      {error && <p className="error">{error}</p>}

      {/* 카드 그리드 */}
      <div className="card-grid">
        {filtered.map((item) => {
          const voucher = isVoucher(item.itemName);

          return (
            <div
              key={item.itemId}
              className={`card ${voucher ? "card-blue" : "card-plain"}`}
              onClick={() => openExchange(item)}
              role="button"
              tabIndex={0}
            >
              {/* 썸네일 */}
              <div className="card-media">
                {item.imageUrl ? (
                  <img
                    className="card-img"
                    src={item.imageUrl}
                    alt={item.itemName}
                    loading="lazy"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const img = e.currentTarget;
                      img.style.display = "none";
                      img.parentElement?.classList.add("card-media--fallback");
                    }}
                  />
                ) : voucher ? (
                  <div className="voucher-face">
                    <div className="voucher-title">구미사랑</div>
                    <div className="voucher-sub">
                      {cleanVoucherName(item.itemName)}
                    </div>
                  </div>
                ) : (
                  <div className="thumb">
                    <div className="note" />
                  </div>
                )}

                {/* 가격 알약 */}
                <div className="price-pill">
                  <img src={coin} alt="" className="coin-img" aria-hidden />
                  {item.price.toLocaleString()}
                </div>
              </div>

              {/* 본문 */}
              <div className="card-body">
                <div className="card-name">{item.itemName}</div>
                {/* 카드 메타/재고는 시트에서만 노출 */}
              </div>
            </div>
          );
        })}
      </div>

      {/* 성공 모달 */}
      {successOpen && (
        <div
          className="modal-root"
          onClick={() => setSuccessOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="success-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="success-close"
              aria-label="닫기"
              onClick={() => setSuccessOpen(false)}
            >
              ×
            </button>

            <div className="success-illus" aria-hidden>
              <img src={giftbox} alt="" />
            </div>

            <div className="success-title">교환 완료!</div>

            <div className="success-msg">
              <p>교환이 완료 되었어요.</p>
              <p>
                교환된 상품권은 <strong>내 지갑</strong>에서 확인해보세요.
              </p>
            </div>

            <div className="success-actions">
              <button
                className="btn-ghost lg"
                onClick={() => {
                  setSuccessOpen(false);
                  navigate("/");
                }}
              >
                홈 화면으로
              </button>
              <button
                className="btn-ghost lg"
                onClick={() => {
                  setSuccessOpen(false);
                  navigate("/wallet");
                }}
              >
                내 지갑으로
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 시트 */}
      <ExchangeSheet
        open={sheetOpen}
        item={selected}
        points={points}
        onClose={closeExchange}
        onSubmit={submitExchange}
      />

      {/* 토스트 */}
      {message && (
        <div className="toast" onClick={() => setMessage(null)} role="status">
          {message}
        </div>
      )}
    </div>
  );
};

export default RewardShop;
