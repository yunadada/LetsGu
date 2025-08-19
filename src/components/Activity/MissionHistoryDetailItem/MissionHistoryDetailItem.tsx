import style from "./MissionHistoryDetailItem.module.css";

const MissionHistoryDetailItem = () => {
  return (
    <div className={style.container}>
      <img
        className={style.img}
        src="https://picsum.photos/seed/picsum/200/300"
      />
      <div className={style.contents}>
        <p className={style.location}>구미시 옥계남로5길 8-10 1층</p>
        <h3 className={style.name}>그라스향기제작소</h3>
        <p className={style.description}>
          향수공방 방문했어요. 향 하나씩 시향해 볼 수 있고, 가장 마음에 드는
          걸로 골랐어요. 만들 때 쉽게 만들 수 있도록 도와주시기 때문에
          걱정필요없어요.
        </p>
        <p className={style.date}>2025.04.18</p>
      </div>
    </div>
  );
};

export default MissionHistoryDetailItem;
