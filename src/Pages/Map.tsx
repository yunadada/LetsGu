import React, { useEffect, useRef } from "react";
import { gumiPlaces } from "../dummydata/gumiPlaces";
import "../styles/Map.css";
import { getMarkerIcons } from "../assets/icons/markerIcons";
import type { Place } from "../types/place";

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const GOOGLE_MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
  if (!GOOGLE_MAP_API_KEY) {
    throw new Error("VITE_GOOGLE_MAP_API_KEY is not defined");
  }

  const createMarker = (
    map: google.maps.Map,
    place: Place,
    icon: { url: string; scaledSize: google.maps.Size }
  ) => {
    return new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map,
      title: place.name,
      icon: {
        url: icon.url,
        scaledSize: icon.scaledSize,
      },
    });
  };

  useEffect(() => {
    if (mapRef.current && window.google && window.google.maps) {
      const markerIcons = getMarkerIcons(window.google);
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 36.1195, lng: 128.3446 },
        zoom: 13,
        disableDefaultUI: true,
      });

      gumiPlaces.forEach((place) => {
        const icon = markerIcons[place.category];
        createMarker(map, place, icon);
      });
    }
  }, []);

  return (
    <div className="mapPage">
      <div className="mapContainer">
        <div className="googleMap" ref={mapRef} />
      </div>
    </div>
  );
};

export default Map;
