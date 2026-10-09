# ColdChain Monitor — IoT Cold Storage Monitoring System

> An enterprise-grade, end-to-end Cold Chain Monitoring and Remote Actuator Control System powered by an **ESP32 Dev Module**, **Next.js (App Router)**, **Supabase (Auth & PostgreSQL)**, and deployed on **Vercel**.

---

## 🌟 System Overview & Architecture

```
+-------------------------------------------------------------------------+
|                              ESP32 HARDWARE                             |
|  - DHT22 (GPIO 4)             - SSD1306 OLED (GPIO 21/22)               |
|  - TinyGPSPlus (GPIO 16/17)   - Cooling Actuator / LED (GPIO 25)        |
+-------------------------------------------------------------------------+
                                   ▲
                     Wi-Fi (HTTPS / JSON REST API)
                     POST /api/sensor-data (Every 5s)
                     GET  /api/fan-control (Every 2s)
                                   ▼
+-------------------------------------------------------------------------+
|                           VERCEL (NEXT.JS 14)                           |
|  - Ingestion & Auth Guard     - App Router Pages (/dashboard)           |
|  - Bi-directional Controls    - Real-time Recharts Telemetry Charts     |
+-------------------------------------------------------------------------+
                                   ▲
                      PostgreSQL Connection & RLS
                                   ▼
+-------------------------------------------------------------------------+
|                           SUPABASE CLOUD                                |
|  - Auth (Email & Password)    - sensor_readings (Time-series table)     |
|  - devices (Registered Units) - device_commands (Actuator Mode History) |
+-------------------------------------------------------------------------+
```

---

## 📋 Hardware Requirements & Pinout Mapping

| Peripheral | ESP32 Pin | Details |
| :--- | :--- | :--- |
| **DHT22 DATA** | `GPIO 4` | Temperature & Humidity Sensor (with 4.7kΩ pull-up resistor) |
| **OLED SDA** | `GPIO 21` | SSD1306 128x64 Display Data Line (I2C) |
| **OLED SCL** | `GPIO 22` | SSD1306 128x64 Display Clock Line (I2C) |
| **GPS TX** | `GPIO 16` | ESP32 RX2 (Serial2 Hardware UART) |
| **GPS RX** | `GPIO 17` | ESP32 TX2 (Serial2 Hardware UART) |
| **Status LED / Fan** | `GPIO 25` | Output Cooling Relay / Indicator LED |

---

## 🚀 Step-by-Step Setup & Deployment Guide

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Under **Project Settings -> API**, copy:
   - `Project URL` (e.g. `https://xyzcompany.supabase.co`)
   - `anon public key`
   - `service_role secret key` (keep private!)

---

### Step 2: Run Database Schema Migrations
1. Open your Supabase Dashboard and navigate to the **SQL Editor**.
2. Copy and paste the entire content of [`supabase/schema.sql`](file:///d:/Ayush%20major/supabase/schema.sql) into the editor.
3. Click **Run** to execute the script. This creates:
   - `devices` table with Row Level Security (RLS)
   - `sensor_readings` table with chronological indexes
   - `device_commands` table for remote actuation
   - Complete security policies restricting device access to authenticated owners.

---

### Step 3: Create an Operator User Account
1. In Supabase, go to **Authentication -> Users** and click **Add User** (or register via the `/signup` page once the app is running).
2. Note the created User ID (`UUID`).

---

### Step 4: Register Initial Device `CC001`
In the Supabase SQL Editor, run the following query to register `CC001` and assign it to your operator account:

```sql
INSERT INTO public.devices (device_id, name, device_token, owner_id)
VALUES (
    'CC001',
    'Cold Storage Unit 01 (ESP32)',
    'coldchain_secret_device_token_2026',
    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
)
ON CONFLICT (device_id) DO UPDATE 
SET name = EXCLUDED.name,
    device_token = EXCLUDED.device_token;

-- Insert initial default command
INSERT INTO public.device_commands (device_id, mode)
VALUES ('CC001', 'AUTO');
```

---

### Step 5: Configure Environment Variables
Create a `.env.local` file in the project root based on [`.env.example`](file:///d:/Ayush%20major/.env.example):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DEFAULT_DEVICE_TOKEN=coldchain_secret_device_token_2026
```

---

### Step 6: Install Web Application Dependencies
```bash
npm install
```

---

### Step 7: Run the Application Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- Log in at `/login` with your registered credentials.
- The dashboard at `/dashboard` is now live and waiting for ESP32 broadcasts!

---

### Step 8: Configure & Flash the ESP32 Firmware
1. Open the Arduino IDE.
2. Install the required libraries via **Sketch -> Include Library -> Manage Libraries**:
   - `ArduinoJson` (v6 or v7)
   - `DHT sensor library` (Adafruit) + `Adafruit Unified Sensor`
   - `TinyGPSPlus`
   - `Adafruit SSD1306` & `Adafruit GFX Library`
3. Open [`main.c++`](file:///d:/Ayush%20major/main.c++).
4. Update the configuration constants at the top of the file:
   ```cpp
   const char* WIFI_SSID     = "Your_WiFi_Network";
   const char* WIFI_PASSWORD = "Your_WiFi_Password";
   const char* API_BASE_URL  = "https://your-app.vercel.app"; // Or your local PC IP e.g. "http://192.168.1.100:3000"
   const char* DEVICE_ID     = "CC001";
   const char* DEVICE_TOKEN  = "coldchain_secret_device_token_2026";
   ```
5. Select **ESP32 Dev Module** as the board and click **Upload**.

---

### Step 9: Deploy to Vercel
1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DEFAULT_DEVICE_TOKEN`
4. Click **Deploy**.
5. Once deployed, update `API_BASE_URL` in [`main.c++`](file:///d:/Ayush%20major/main.c++) with your live Vercel domain.

---

## 🕹️ Operating Modes & Actuator Control Behavior

1. **`AUTO` Mode**:
   - The ESP32 continuously monitors the DHT22 temperature.
   - If Temperature $> 8.0^\circ\text{C}$ (Threshold violation): Turn LED / Cooling **ON** (`HIGH`).
   - If Temperature $\le 8.0^\circ\text{C}$: Turn LED / Cooling **OFF** (`LOW`).
   - If DHT22 reports an error (`NaN`): Fails safe to **OFF** (`LOW`).
2. **`FORCE_ON` Mode**:
   - Overrides sensor logic and forces the LED / cooling relay **ON**.
3. **`FORCE_OFF` Mode**:
   - Overrides sensor logic and forces the LED / cooling relay **OFF**.

---

## 📡 REST API Specifications

### 1. Ingest Sensor Data (ESP32 $\to$ Server)
- **`POST /api/sensor-data`**
- **Header**: `X-Device-Token: <device_token>`
- **Payload**:
  ```json
  {
    "device_id": "CC001",
    "temperature": 6.8,
    "humidity": 62.4,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "gps_valid": true,
    "fan_status": false,
    "control_mode": "AUTO"
  }
  ```

### 2. Poll Control Command (ESP32 $\to$ Server)
- **`GET /api/fan-control?deviceId=CC001`**
- **Header**: `X-Device-Token: <device_token>`
- **Response**:
  ```json
  {
    "mode": "AUTO",
    "command_id": "uuid-here",
    "device_id": "CC001"
  }
  ```

### 3. Update Desired Mode (Dashboard User $\to$ Server)
- **`POST /api/fan-control`**
- **Payload**:
  ```json
  {
    "deviceId": "CC001",
    "mode": "FORCE_ON"
  }
  ```

---

## 🛠️ Troubleshooting & FAQ

- **ESP32 prints `HTTP Error: -1` or Connection Timeout**:
  - Verify your Wi-Fi SSID and password.
  - If testing locally, ensure your computer and ESP32 are on the same 2.4GHz Wi-Fi network and firewall allows incoming connections on port 3000.
- **OLED Displays "DHT22: SENSOR ERR"**:
  - Check the wiring on GPIO 4 and ensure a 4.7kΩ to 10kΩ pull-up resistor is between VCC (3.3V) and DATA.
- **GPS displays "No Fix"**:
  - GPS modules require direct line-of-sight to the sky. Move the antenna near a window during testing.
- **Dashboard shows "Device Offline"**:
  - Devices are marked offline if no data has been received in the last 30 seconds. Verify the ESP32 is powered and connected to Wi-Fi.
