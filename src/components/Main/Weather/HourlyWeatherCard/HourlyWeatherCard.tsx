import type { HourlyWeather } from "../../../../types/weather";
import style from "./HourlyWeatherCard.module.css";

type Props = {
  hourlyWeather: HourlyWeather;
};

const HourlyWeatherCard = ({ hourlyWeather }: Props) => {
  return (
    <div className={style.container}>
      <p>{hourlyWeather?.time}</p>
      <div className={style.weather}>
        <img
          src={`https://openweathermap.org/img/wn/${hourlyWeather?.icon}@2x.png`}
        />
      </div>
      <p>{Math.round(hourlyWeather?.temp)}°</p>
    </div>
  );
};

export default HourlyWeatherCard;
