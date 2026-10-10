/**
 * ============================================================================
 * Project: Cold Chain Monitoring System (ColdChain Monitor)
 * File: main.c++
 * Target Hardware: ESP32 Dev Module
 * Author: Antigravity AI
 * 
 * Hardware Pin Mapping:
 *  - DHT22 DATA   : GPIO 4
 *  - OLED SDA     : GPIO 21
 *  - OLED SCL     : GPIO 22
 *  - GPS RX       : GPIO 16 (ESP32 RX2 <- GPS TX)
 *  - GPS TX       : GPIO 17 (ESP32 TX2 -> GPS RX)
 *  - LED / Fan    : GPIO 25
 *
 * Dependencies (Install via Arduino Library Manager):
 *  1. ArduinoJson (by Benoit Blanchon) - v6.x or v7.x
 *  2. DHT sensor library (by Adafruit)
 *  3. Adafruit Unified Sensor
 *  4. TinyGPSPlus (by Mikal Hart)
 *  5. Adafruit SSD1306 & Adafruit GFX Library
 * ============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <TinyGPSPlus.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ============================================================================
// CONFIGURATION & CREDENTIALS (Update with your own settings)
// ============================================================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Base URL of your deployed Vercel API (No trailing slash)
const char* API_BASE_URL  = "https://your-app.vercel.app";

// Authentication & Device Identity
const char* DEVICE_ID     = "CC001";
const char* DEVICE_TOKEN  = "YOUR_SECRET_DEVICE_TOKEN"; // Must match backend token

// If using HTTPS without Root CA verification for development, set to true.
// For strict production security, provide Root CA certificate.
const bool INSECURE_SSL_FOR_DEV = true;

// ============================================================================
// PIN DEFINITIONS
// ============================================================================
#define DHTPIN        4     // GPIO 4
#define DHTTYPE       DHT22 // DHT 22 (AM2302)

#define OLED_SDA      21    // GPIO 21
#define OLED_SCL      22    // GPIO 22
#define SCREEN_WIDTH  128   // OLED display width in pixels
#define SCREEN_HEIGHT 64    // OLED display height in pixels
#define OLED_RESET    -1    // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_I2C_ADDR 0x3C // 0x3C or 0x3D

#define GPS_RX_PIN    16    // ESP32 RX2 (Connects to GPS Module TX)
#define GPS_TX_PIN    17    // ESP32 TX2 (Connects to GPS Module RX)
#define GPS_BAUD      9600  // Standard GPS baud rate

#define LED_PIN       25    // Status LED / Fan Driver Output

// ============================================================================
// TIMING CONSTANTS (Non-blocking intervals in milliseconds)
// ============================================================================
const unsigned long DHT_READ_INTERVAL     = 2500; // Read DHT every 2.5 seconds
const unsigned long SENSOR_UPLOAD_INTERVAL= 5000; // Upload telemetry every 5.0 seconds
const unsigned long COMMAND_POLL_INTERVAL = 2000; // Poll commands every 2.0 seconds
const unsigned long OLED_REFRESH_INTERVAL = 1000; // Refresh display every 1.0 second
const unsigned long WIFI_RETRY_INTERVAL   = 10000;// Retry Wi-Fi reconnect every 10 seconds

// Cold Chain Temperature Threshold
const float TEMP_THRESHOLD_HIGH = 8.0; // Cold chain warning threshold (>8.0°C)

// ============================================================================
// GLOBAL OBJECTS & STATE
// ============================================================================
DHT dht(DHTPIN, DHTTYPE);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // UART 2
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Sensor and Telemetry State
float currentTemperature = NAN;
float currentHumidity    = NAN;
bool  sensorValid        = false;

double currentLatitude   = 0.0;
double currentLongitude  = 0.0;
bool   gpsFixValid       = false;

// Control & Actuator State
enum ControlMode { MODE_AUTO, MODE_FORCE_ON, MODE_FORCE_OFF };
ControlMode currentMode = MODE_AUTO;
String currentModeStr   = "AUTO";
bool actualLedState     = false;

// Timers
unsigned long lastDhtReadTime    = 0;
unsigned long lastUploadTime     = 0;
unsigned long lastPollTime       = 0;
unsigned long lastOledTime       = 0;
unsigned long lastWifiCheckTime  = 0;

// Status Messages for Display & Debug
String lastUploadStatus = "Ready";
String lastPollStatus   = "Idle";

// ============================================================================
// FORWARD DECLARATIONS
// ============================================================================
void connectWiFi();
void checkWiFiConnection();
void readDHTSensor();
void processGPS();
void applyControlLogic();
void updateOLED();
void uploadSensorData();
void pollControlCommand();
void setModeFromString(const String& mode);

// ============================================================================
// SETUP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n============================================"));
  Serial.println(F(" ColdChain Monitor - ESP32 Firmware Starting"));
  Serial.println(F("============================================"));

  // 1. Initialize Pin Modes
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  actualLedState = false;

  // 2. Initialize I2C for OLED Display
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_I2C_ADDR)) {
    Serial.println(F("[ERROR] SSD1306 allocation failed!"));
  } else {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 15);
    display.println(F("ColdChain Monitor"));
    display.setCursor(10, 30);
    display.println(F("Device: CC001"));
    display.setCursor(10, 45);
    display.println(F("Booting up..."));
    display.display();
    delay(1500);
  }

  // 3. Initialize DHT22 Sensor
  dht.begin();
  Serial.println(F("[OK] DHT22 initialized on GPIO 4."));

  // 4. Initialize GPS Serial
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println(F("[OK] GPS Serial initialized on RX:16, TX:17."));

  // 5. Connect to Wi-Fi
  connectWiFi();

  // Initial read & OLED update
  readDHTSensor();
  applyControlLogic();
  updateOLED();
}

// ============================================================================
// MAIN LOOP (Non-blocking)
// ============================================================================
void loop() {
  unsigned long currentMillis = millis();

  // 1. Continuously process incoming GPS bytes
  processGPS();

  // 2. Periodic Wi-Fi connection health check
  if (currentMillis - lastWifiCheckTime >= WIFI_RETRY_INTERVAL) {
    lastWifiCheckTime = currentMillis;
    checkWiFiConnection();
  }

  // 3. Periodic DHT22 Reading (every 2.5s)
  if (currentMillis - lastDhtReadTime >= DHT_READ_INTERVAL) {
    lastDhtReadTime = currentMillis;
    readDHTSensor();
    applyControlLogic();
  }

  // 4. Periodic Command Polling (every 2s)
  if (WiFi.status() == WL_CONNECTED && (currentMillis - lastPollTime >= COMMAND_POLL_INTERVAL)) {
    lastPollTime = currentMillis;
    pollControlCommand();
    applyControlLogic();
  }

  // 5. Periodic Sensor Data Upload (every 5s)
  if (WiFi.status() == WL_CONNECTED && (currentMillis - lastUploadTime >= SENSOR_UPLOAD_INTERVAL)) {
    lastUploadTime = currentMillis;
    uploadSensorData();
  }

  // 6. Periodic OLED Refresh (every 1s)
  if (currentMillis - lastOledTime >= OLED_REFRESH_INTERVAL) {
    lastOledTime = currentMillis;
    updateOLED();
  }
}

// ============================================================================
// WI-FI MANAGEMENT
// ============================================================================
void connectWiFi() {
  Serial.printf("[WIFI] Connecting to SSID: %s\n", WIFI_SSID);
  display.clearDisplay();
  display.setCursor(0, 10);
  display.println(F("Connecting to Wi-Fi:"));
  display.setCursor(0, 25);
  display.println(WIFI_SSID);
  display.display();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 8000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\n[WIFI] Connected successfully!"));
    Serial.print(F("[WIFI] IP Address: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("\n[WIFI] Connection failed. Will retry in background."));
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WIFI] Lost connection. Attempting reconnect..."));
    WiFi.disconnect();
    WiFi.reconnect();
  }
}

// ============================================================================
// SENSOR READING & LOGIC
// ============================================================================
void readDHTSensor() {
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    sensorValid = false;
    Serial.println(F("[WARN] DHT22 reading failed (NaN). Check wiring."));
  } else {
    sensorValid = true;
    currentTemperature = temp;
    currentHumidity    = hum;
    Serial.printf("[DHT22] Temp: %.2f °C | Humidity: %.2f %%\n", currentTemperature, currentHumidity);
  }
}

void processGPS() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isValid() && gps.location.age() < 5000) {
    gpsFixValid      = true;
    currentLatitude  = gps.location.lat();
    currentLongitude = gps.location.lng();
  } else {
    gpsFixValid = false;
  }
}

void applyControlLogic() {
  switch (currentMode) {
    case MODE_AUTO:
      if (!sensorValid) {
        // Safe state on sensor failure in AUTO mode: turn OFF
        digitalWrite(LED_PIN, LOW);
        actualLedState = false;
      } else if (currentTemperature > TEMP_THRESHOLD_HIGH) {
        // Cold-chain violation (>8°C) -> Turn ON cooling/LED
        digitalWrite(LED_PIN, HIGH);
        actualLedState = true;
      } else {
        // Safe temperature (<=8°C) -> Turn OFF cooling/LED
        digitalWrite(LED_PIN, LOW);
        actualLedState = false;
      }
      break;

    case MODE_FORCE_ON:
      digitalWrite(LED_PIN, HIGH);
      actualLedState = true;
      break;

    case MODE_FORCE_OFF:
      digitalWrite(LED_PIN, LOW);
      actualLedState = false;
      break;
  }
}

void setModeFromString(const String& mode) {
  String upperMode = mode;
  upperMode.toUpperCase();
  upperMode.trim();

  if (upperMode == "FORCE_ON") {
    currentMode = MODE_FORCE_ON;
    currentModeStr = "FORCE_ON";
  } else if (upperMode == "FORCE_OFF") {
    currentMode = MODE_FORCE_OFF;
    currentModeStr = "FORCE_OFF";
  } else {
    currentMode = MODE_AUTO;
    currentModeStr = "AUTO";
  }
}

// ============================================================================
// CLOUD API: TELEMETRY UPLOAD (POST /api/sensor-data)
// ============================================================================
void uploadSensorData() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  if (INSECURE_SSL_FOR_DEV) {
    client.setInsecure(); // Bypass certificate verification for testing
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/sensor-data";

  if (!http.begin(client, url)) {
    lastUploadStatus = "HTTP Init Fail";
    Serial.println(F("[UPLOAD] Failed to initialize HTTP client"));
    return;
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);
  http.setTimeout(4000);

  // Construct JSON Payload
  StaticJsonDocument<384> doc;
  doc["device_id"]   = DEVICE_ID;
  
  if (sensorValid) {
    doc["temperature"] = serialized(String(currentTemperature, 2));
    doc["humidity"]    = serialized(String(currentHumidity, 2));
  } else {
    doc["temperature"] = nullptr;
    doc["humidity"]    = nullptr;
  }

  if (gpsFixValid) {
    doc["latitude"]    = serialized(String(currentLatitude, 6));
    doc["longitude"]   = serialized(String(currentLongitude, 6));
  } else {
    doc["latitude"]    = nullptr;
    doc["longitude"]   = nullptr;
  }

  doc["gps_valid"]    = gpsFixValid;
  doc["fan_status"]   = actualLedState;
  doc["control_mode"] = currentModeStr;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.printf("[UPLOAD] POST %s -> %s\n", url.c_str(), jsonPayload.c_str());

  int httpCode = http.POST(jsonPayload);
  if (httpCode > 0) {
    Serial.printf("[UPLOAD] Success! HTTP Code: %d\n", httpCode);
    lastUploadStatus = "OK (" + String(httpCode) + ")";
  } else {
    Serial.printf("[UPLOAD] Error: %s (code: %d)\n", http.errorToString(httpCode).c_str(), httpCode);
    lastUploadStatus = "Err " + String(httpCode);
  }

  http.end();
}

// ============================================================================
// CLOUD API: COMMAND POLLING (GET /api/fan-control?deviceId=CC001)
// ============================================================================
void pollControlCommand() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  if (INSECURE_SSL_FOR_DEV) {
    client.setInsecure();
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/fan-control?deviceId=" + String(DEVICE_ID);

  if (!http.begin(client, url)) {
    lastPollStatus = "Init Fail";
    return;
  }

  http.addHeader("X-Device-Token", DEVICE_TOKEN);
  http.setTimeout(3000);

  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK || httpCode == 200) {
    String response = http.getString();
    Serial.printf("[POLL] GET Response: %s\n", response.c_str());

    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, response);
    if (!err) {
      if (doc.containsKey("mode")) {
        String serverMode = doc["mode"].as<String>();
        setModeFromString(serverMode);
        lastPollStatus = "OK (" + currentModeStr + ")";
      }
    } else {
      Serial.printf("[POLL] JSON parse error: %s\n", err.c_str());
      lastPollStatus = "JSON Err";
    }
  } else {
    Serial.printf("[POLL] HTTP Error: %d\n", httpCode);
    lastPollStatus = "Err " + String(httpCode);
  }

  http.end();
}

// ============================================================================
// OLED DISPLAY REFRESH
// ============================================================================
void updateOLED() {
  display.clearDisplay();

  // Header / Top Bar
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("ID:"));
  display.print(DEVICE_ID);
  
  display.setCursor(75, 0);
  if (WiFi.status() == WL_CONNECTED) {
    display.print(F("WiFi:OK"));
  } else {
    display.print(F("WiFi:--"));
  }
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  // Line 2: Temperature & Humidity
  display.setCursor(0, 13);
  if (sensorValid) {
    display.printf("T:%.1fC  H:%.1f%%", currentTemperature, currentHumidity);
  } else {
    display.print(F("DHT22: SENSOR ERR"));
  }

  // Line 3: GPS Coordinates or Fix Status
  display.setCursor(0, 26);
  if (gpsFixValid) {
    display.printf("GPS: %.2f, %.2f", currentLatitude, currentLongitude);
  } else {
    display.print(F("GPS: No Fix (Searching)"));
  }

  // Line 4: Control Mode & LED/Fan Status
  display.setCursor(0, 39);
  display.print(F("Mode: "));
  display.print(currentModeStr);
  display.print(actualLedState ? F(" [ON]") : F(" [OFF]"));

  // Line 5: Telemetry Upload & Poll Status
  display.drawLine(0, 50, 128, 50, SSD1306_WHITE);
  display.setCursor(0, 54);
  display.printf("Up:%s Pl:%s", lastUploadStatus.c_str(), lastPollStatus.c_str());

  display.display();
}
