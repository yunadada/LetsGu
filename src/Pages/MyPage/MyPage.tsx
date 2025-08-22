import style from "./MyPage.module.css";
import ActivityImg from "../../assets/ActivityImg.svg";
import RewardImg from "../../assets/RewardImg.svg";
import WalletImg from "../../assets/WalletImg.svg";
import Header from "../../components/Header/Header";
import Profile from "../../components/MyPage/Profile/Profile";
import { IoChevronForwardOutline } from "react-icons/io5";
import TabBarItem from "../../components/MyPage/TabBarItem/TabBarItem";
// import ListItem from "../../components/MyPage/ListItem/ListItem";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMypageData } from "../../api/user";
import type { UserProfileData } from "../../types/userInfo";

const MyPage = () => {
  const [userProfileData, setUserProfileData] =
    useState<UserProfileData | null>(null);
  const navigate = useNavigate();

  const navigiateToProfile = () => {
    navigate("/editProfile", { state: { userProfileData } });
  };

  useEffect(() => {
    const getUserProfileData = async () => {
      try {
        const res = await getMypageData();
        if (res.data.success) {
          setUserProfileData(res.data.data);
        }
      } catch (e) {
        console.log(e);
      }
    };

    getUserProfileData();
  }, []);

  return (
    <div className={style.wrapper}>
      <Header title="마이페이지" />
      <div className={style.contents}>
        <div className={style.profile}>
          <Profile imageUrl={userProfileData?.imageUrl} />
        </div>
        <button className={style.nav} onClick={navigiateToProfile}>
          <p>
            <span>{userProfileData?.nickname}</span>님
          </p>
          <IoChevronForwardOutline />
        </button>
        <div className={style.tabBar}>
          <TabBarItem
            img={ActivityImg}
            text="활동 내역"
            navUrl="/activityLog"
          />
          <TabBarItem img={RewardImg} text="리워드 샵" navUrl="/activityLog" />
          <TabBarItem img={WalletImg} text="내 지갑" navUrl="/activityLog" />
        </div>
        {/* <div className={style.menuList}>
          <ListItem text="공지사항" />
          <ListItem text="자주 묻는 질문" />
          <ListItem text="문의사항" />
        </div>
        <div className={style.footer}>
          <p>이용약관</p>
          <div className={style.verticalLine}></div>
          <p>운영정책</p>
        </div> */}
      </div>
    </div>
  );
};

export default MyPage;
