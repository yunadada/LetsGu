import style from "./Main.module.css";
import Coin from "../../assets/Coin.svg";
import ProfileImg from "../../assets/ProfileImg.svg";
import Weather from "../../components/Main/Weather/Weather";
import NavItem from "../../components/Main/NavItem/NavItem";
import MyPageThumbnail from "../../assets/MyPageThumbnail.svg";
import MissionStartThumbnail from "../../assets/MissionStartThumbnail.svg";

const Main = () => {
  const mypageItems = ["활동내역", "내 지갑", "리워드 샵"];

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return (
    <div className={style.wrapper}>
      <div className={style.header}>
        <div className={style.coin}>
          <img src={Coin} />
          <p>1000</p>
        </div>
        <div className={style.profileImg}>
          <img src={ProfileImg} />
        </div>
      </div>
      <p className={style.date}>
        {year}년 {month}월 {day}일
      </p>
      <Weather />
      <div className={style.navBar}>
        <NavItem
          thumbnail={MyPageThumbnail}
          title="마이페이지"
          contents={
            <>
              {mypageItems.map((text) => (
                <p className={style.tag} key={text}>
                  {text}
                </p>
              ))}
            </>
          }
        />
        <NavItem
          thumbnail={MissionStartThumbnail}
          title="미션 수행하기"
          contents={
            <>
              <p className={style.description}>AI가 추천해주는</p>
              <p className={style.description}>미션을 즐기고</p>
              <p className={style.description}>리워드를 받아보세요!</p>
            </>
          }
        />
      </div>
    </div>
  );
};

export default Main;
