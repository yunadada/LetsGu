export type WeatherInfo = {
  temp: number;
  icon: string;
  todayMax: number;
  todayMin: number;
};

export type HourlyWeather = {
  time: string;
  temp: number;
  icon: string;
};
