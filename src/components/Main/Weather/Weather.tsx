import type { HourlyWeather, WeatherInfo } from "../../../types/weather";
import HourlyWeatherCard from "./HourlyWeatherCard/HourlyWeatherCard";
import style from "./Weather.module.css";

type Props = {
  weatherInfo: WeatherInfo | null;
  hourlyWeather: HourlyWeather[];
};

const Weather = ({ weatherInfo, hourlyWeather }: Props) => {
  if (!weatherInfo || !hourlyWeather) {
    return <div>날씨 정보를 불러오고 있습니다.</div>;
  }

  return (
    <div className={style.container}>
      <p>구미시</p>
      <span>{Math.round(weatherInfo?.temp)}°</span>
      <div className={style.weatherIcon}>
        <img
          src={`https://openweathermap.org/img/wn/${weatherInfo?.icon}@2x.png`}
          alt="날씨"
        />
      </div>
      <div className={style.temperature}>
        <p>최고 {Math.round(weatherInfo?.todayMax)}°</p>
        <p>최저 {Math.round(weatherInfo?.todayMin)}°</p>
      </div>
      <hr />
      <div className={style.hourlyWeather}>
        {hourlyWeather?.map((item, idx) => (
          <HourlyWeatherCard key={idx} hourlyWeather={item} />
        ))}
      </div>
    </div>
  );
};

export default Weather;
