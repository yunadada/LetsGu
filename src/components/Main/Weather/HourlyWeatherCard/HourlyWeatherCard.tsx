import style from "./HourlyWeatherCard.module.css";

const HourlyWeatherCard = () => {
  return (
    <div className={style.container}>
      <p>오후 1시</p>
      <div className={style.weather}></div>
      <p>22도</p>
    </div>
  );
};

export default HourlyWeatherCard;
