import HourlyWeatherCard from "./HourlyWeatherCard/HourlyWeatherCard";
import style from "./Weather.module.css";

const Weather = () => {
  return (
    <div className={style.container}>
      <p>구미시</p>
      <span>25도</span>
      <div className={style.weatherIcon}>구름</div>
      <div className={style.temperature}>
        <p>최고 32도</p>
        <p>최저 19도</p>
      </div>
      <hr />
      <div className={style.hourlyWeather}>
        <HourlyWeatherCard />
        <HourlyWeatherCard />
        <HourlyWeatherCard />
        <HourlyWeatherCard />
        <HourlyWeatherCard />
        <HourlyWeatherCard />
      </div>
    </div>
  );
};

export default Weather;
