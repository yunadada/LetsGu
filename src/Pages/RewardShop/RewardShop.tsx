// src/Pages/RewardShop/RewardShop.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./RewardsShop.css";
import { api } from "../../api/client";
import axios from "axios";
import ExchangeSheet from "./ExchangeSheet";
import { useNavigate } from "react-router-dom";
import coin from "../../assets/coin.png";

interface Item {
  itemId: number;
  itemName: string;
  price: number;
  count: number;
  imageUrl?: string;
}
interface ApiListRes {
  success: boolean;
  data: Item[];
}
interface ApiActionRes {
  success: boolean;
  code?: string;
  message?: string;
  data?: unknown;
}

const isVoucher = (name: string) => name.includes("상품권");

// 전자/지류형 추론 (이름 기준 휴리스틱)
const getVoucherType = (name: string) => {
  const s = name.toLowerCase();
  return /(전자|모바일|e-?gift|카드|app|앱)/i.test(s) ? "전자상품권" : "지류형";
};
// “구미사랑상품권” 접두사 제거
const cleanVoucherName = (name: string) =>
  name.replace(/구미사랑상품권/gi, "").trim() || name;

type ServerErr = { message?: string };
const getAxiosMessage = (err: unknown, fb = "네트워크 오류가 발생했습니다.") =>
  axios.isAxiosError<ServerErr>(err) ? err.response?.data?.message ?? fb : fb;

const RewardShop: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(5000);
  const [tab, setTab] = useState<"voucher" | "partner">("voucher");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get<ApiListRes>("/api/v1/items", {
          headers: { Accept: "application/json" },
        });
        if (!mounted) return;
        if (data.success) {
          console.log(data.data);
          setItems(data.data);
        } else setError("아이템을 불러오지 못했습니다.");
      } catch (err) {
        setError(getAxiosMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((it) =>
        tab === "voucher" ? isVoucher(it.itemName) : !isVoucher(it.itemName)
      ),
    [items, tab]
  );

  const openExchange = (item: Item) => {
    setSelected(item);
    setSheetOpen(true);
  };
  const closeExchange = () => {
    setSheetOpen(false);
    setTimeout(() => setSelected(null), 240);
  };

  const submitExchange = async (count: number) => {
    if (!selected) return;
    try {
      const { data } = await api.post<ApiActionRes>(
        `/api/v1/items/${selected.itemId}`,
        { count },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data.success) {
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
        setMessage(data.message || "교환 실패");
      }
    } catch (err) {
      setMessage(getAxiosMessage(err, "교환 실패"));
    }
  };

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className="shop-container">
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

      <div className="card-grid">
        {filtered.map((item) => {
          const voucher = isVoucher(item.itemName);
          const vType = voucher ? getVoucherType(item.itemName) : null;

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
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                      (
                        e.currentTarget.parentElement as HTMLElement
                      )?.classList.add("card-media--fallback");
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

                {/* 가격 알약만 유지 */}
                <div className="price-pill">
                  <img src={coin} alt="" className="coin-img" aria-hidden />
                  {item.price.toLocaleString()}
                </div>
              </div>

              {/* 본문 */}
              <div className="card-body">
                <div className="card-name">{item.itemName}</div>
                <div className="card-meta">
                  {voucher
                    ? `${vType} · 구미사랑상품권`
                    : "제휴쿠폰 · 교환 가능"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
              🎁
            </div>
            <div className="success-title">교환 완료!</div>
            <div className="success-msg">
              교환이 바로 되었습니다.
              <br />
              교환한 상품은 내 지갑에서 확인해보세요.
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

      <ExchangeSheet
        open={sheetOpen}
        item={selected}
        points={points}
        onClose={closeExchange}
        onSubmit={submitExchange}
      />

      {message && (
        <div className="toast" onClick={() => setMessage(null)} role="status">
          {message}
        </div>
      )}
    </div>
  );
};

export default RewardShop;
