import style from "./MyPage.module.css";
import ActivityImg from "../../assets/ActivityImg.svg";
import RewardImg from "../../assets/RewardImg.svg";
import WalletImg from "../../assets/WalletImg.svg";
import Header from "../../components/Header/Header";
import Profile from "../../components/MyPage/Profile/Profille";
import { IoChevronForwardOutline } from "react-icons/io5";
import TabBarItem from "../../components/MyPage/TabBarItem/TabBarItem";
import ListItem from "../../components/MyPage/ListItem/ListItem";
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const navigate = useNavigate();

  const navigiateToProfile = () => {
    navigate("/editProfile");
  };

  return (
    <div className={style.wrapper}>
      <Header title="마이페이지" />
      <div className={style.contents}>
        <div className={style.profile}>
          <Profile />
        </div>
        <div className={style.editProfile}>
          <p>
            <span>사용자</span>님
          </p>
          <button className={style.navButton} onClick={navigiateToProfile}>
            <IoChevronForwardOutline />
          </button>
        </div>
        <div className={style.tabBar}>
          <TabBarItem img={ActivityImg} text="활동 내역" />
          <TabBarItem img={RewardImg} text="리워드 샵" />
          <TabBarItem img={WalletImg} text="내 지갑" />
        </div>
        <div className={style.menuList}>
          <ListItem text="공지사항" />
          <ListItem text="자주 묻는 질문" />
          <ListItem text="문의사항" />
        </div>
        <div className={style.footer}>
          <p>이용약관</p>
          <div className={style.verticleLine}></div>
          <p>운영정책</p>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
