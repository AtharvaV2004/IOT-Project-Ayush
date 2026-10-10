-- ============================================================================
-- Project: Cold Chain Monitoring System (ColdChain Monitor)
-- Database Schema & Migrations for Supabase PostgreSQL
-- (Idempotent: Safe to re-run multiple times)
-- ============================================================================

-- 1. Enable UUID Extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLE: devices
-- Stores registered IoT edge devices belonging to authenticated users.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    device_token VARCHAR(256) NOT NULL DEFAULT 'coldchain_secret_device_token_2026',
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on device_id and owner_id
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_owner_id ON public.devices(owner_id);

-- ============================================================================
-- 2.1 TABLE: device_access
-- Allows more than one authenticated operator to monitor and control a device.
-- The devices.owner_id remains the primary owner.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.device_access (
    device_id VARCHAR(64) NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (device_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_device_access_user_id ON public.device_access(user_id);

-- ============================================================================
-- 3. TABLE: sensor_readings
-- Time-series telemetry data uploaded by the ESP32 devices.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(64) NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
    temperature NUMERIC(5, 2) NULL, -- °C (e.g. -20.50 to 50.00)
    humidity NUMERIC(5, 2) NULL,    -- % (e.g. 0.00 to 100.00)
    latitude NUMERIC(10, 6) NULL,   -- GPS Latitude (e.g. 28.613939)
    longitude NUMERIC(10, 6) NULL,  -- GPS Longitude (e.g. 77.209021)
    gps_valid BOOLEAN NOT NULL DEFAULT FALSE,
    fan_status BOOLEAN NOT NULL DEFAULT FALSE, -- Actual reported LED / cooling state
    control_mode VARCHAR(32) NOT NULL DEFAULT 'AUTO', -- 'AUTO', 'FORCE_ON', 'FORCE_OFF'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes on sensor_readings for fast chronological dashboard queries
CREATE INDEX IF NOT EXISTS idx_readings_device_created ON public.sensor_readings(device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON public.sensor_readings(created_at DESC);

-- ============================================================================
-- 4. TABLE: device_commands
-- Stores remote control commands issued by users or automation.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.device_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(64) NOT NULL REFERENCES public.devices(device_id) ON DELETE CASCADE,
    mode VARCHAR(32) NOT NULL CHECK (mode IN ('AUTO', 'FORCE_ON', 'FORCE_OFF')),
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ NULL
);

-- Indexes for rapid polling of latest command
CREATE INDEX IF NOT EXISTS idx_commands_device_created ON public.device_commands(device_id, created_at DESC);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_access ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.user_has_device_access(target_device_id VARCHAR)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.devices
        WHERE public.devices.device_id = target_device_id
          AND public.devices.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1
        FROM public.device_access
        WHERE public.device_access.device_id = target_device_id
          AND public.device_access.user_id = auth.uid()
    );
$$;

-- 5.1 Devices Table Policies
DROP POLICY IF EXISTS "Users can view own devices" ON public.devices;
CREATE POLICY "Users can view own devices" 
ON public.devices 
FOR SELECT 
TO authenticated 
USING (public.user_has_device_access(device_id));

DROP POLICY IF EXISTS "Users can insert own devices" ON public.devices;
CREATE POLICY "Users can insert own devices" 
ON public.devices 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own devices" ON public.devices;
CREATE POLICY "Users can update own devices" 
ON public.devices 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can view their device access" ON public.device_access;
CREATE POLICY "Users can view their device access"
ON public.device_access
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.devices
        WHERE public.devices.device_id = device_access.device_id
        AND public.devices.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Device owners can manage device access" ON public.device_access;
CREATE POLICY "Device owners can manage device access"
ON public.device_access
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.devices
        WHERE public.devices.device_id = device_access.device_id
        AND public.devices.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.devices
        WHERE public.devices.device_id = device_access.device_id
        AND public.devices.owner_id = auth.uid()
    )
);

-- 5.2 Sensor Readings Table Policies
DROP POLICY IF EXISTS "Users can view readings of own devices" ON public.sensor_readings;
CREATE POLICY "Users can view readings of own devices" 
ON public.sensor_readings 
FOR SELECT 
TO authenticated 
USING (
    public.user_has_device_access(sensor_readings.device_id)
);

-- 5.3 Device Commands Table Policies
DROP POLICY IF EXISTS "Users can view commands of own devices" ON public.device_commands;
CREATE POLICY "Users can view commands of own devices" 
ON public.device_commands 
FOR SELECT 
TO authenticated 
USING (
    public.user_has_device_access(device_commands.device_id)
);

DROP POLICY IF EXISTS "Users can insert commands for own devices" ON public.device_commands;
CREATE POLICY "Users can insert commands for own devices" 
ON public.device_commands 
FOR INSERT 
TO authenticated 
WITH CHECK (
    public.user_has_device_access(device_commands.device_id)
);
