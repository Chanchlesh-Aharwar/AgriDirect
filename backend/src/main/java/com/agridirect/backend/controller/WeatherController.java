package com.agridirect.backend.controller;

import com.agridirect.backend.entity.WeatherCache;
import com.agridirect.backend.repository.WeatherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "http://localhost:5173")
public class WeatherController {

    @Autowired
    private WeatherRepository weatherRepository;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String baseUrl;

    @GetMapping("/city/{city}")
    public ResponseEntity<?> getWeatherByCity(@PathVariable String city) {
        try {
            WeatherCache cached = weatherRepository.findByCity(city).orElse(null);

            if (cached != null && cached.getLastUpdated().isAfter(LocalDateTime.now().minusMinutes(30))) {
                return ResponseEntity.ok(cached);
            }

            RestTemplate restTemplate = new RestTemplate();
            String url = baseUrl + "/weather?q=" + city + "&appid=" + apiKey + "&units=metric";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            WeatherCache weather = new WeatherCache();
            weather.setCity(city);

            if (response != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> main = (Map<String, Object>) response.get("main");
                @SuppressWarnings("unchecked")
                Map<String, Object> wind = (Map<String, Object>) response.get("wind");
                @SuppressWarnings("unchecked")
                Map<String, Object> sys = (Map<String, Object>) response.get("sys");
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> weatherList = (java.util.List<Map<String, Object>>) response.get("weather");

                if (sys != null) weather.setCountry((String) sys.get("country"));
                if (main != null) {
                    weather.setTemperature(((Number) main.get("temp")).doubleValue());
                    weather.setFeelsLike(((Number) main.get("feels_like")).doubleValue());
                    weather.setHumidity(((Number) main.get("humidity")).doubleValue());
                }
                if (wind != null) weather.setWindSpeed(((Number) wind.get("speed")).doubleValue());
                if (weatherList != null && !weatherList.isEmpty()) {
                    Map<String, Object> weatherData = weatherList.get(0);
                    weather.setDescription((String) weatherData.get("description"));
                    weather.setIcon((String) weatherData.get("icon"));
                }
            }

            weather.setLastUpdated(LocalDateTime.now());

            weather = weatherRepository.save(weather);

            return ResponseEntity.ok(weather);

        } catch (Exception e) {
            WeatherCache fallback = new WeatherCache();
            fallback.setCity(city);
            fallback.setTemperature(25.0);
            fallback.setDescription("Weather data unavailable");
            fallback.setHumidity(60.0);
            fallback.setWindSpeed(5.0);
            fallback.setLastUpdated(LocalDateTime.now());
            return ResponseEntity.ok(fallback);
        }
    }

    @GetMapping("/coordinates")
    public ResponseEntity<?> getWeatherByCoordinates(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = baseUrl + "/weather?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=metric";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            Map<String, Object> result = new HashMap<>();
            if (response != null) {
                result.put("city", response.get("name"));
                @SuppressWarnings("unchecked")
                Map<String, Object> main = (Map<String, Object>) response.get("main");
                if (main != null) {
                    result.put("temperature", main.get("temp"));
                    result.put("feelsLike", main.get("feels_like"));
                    result.put("humidity", main.get("humidity"));
                }
                @SuppressWarnings("unchecked")
                Map<String, Object> wind = (Map<String, Object>) response.get("wind");
                if (wind != null) result.put("windSpeed", wind.get("speed"));
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "temperature", 25.0,
                "description", "Weather data unavailable",
                "humidity", 60.0
            ));
        }
    }

    @GetMapping("/forecast/{city}")
    public ResponseEntity<?> getForecast(@PathVariable String city) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = baseUrl + "/forecast?q=" + city + "&appid=" + apiKey + "&units=metric&cnt=5";

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.ok(Map.of("message", "Forecast unavailable"));

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("message", "Forecast unavailable"));
        }
    }
}
