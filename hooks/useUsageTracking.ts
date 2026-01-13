'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDeviceId } from '@/utils/fingerprint';

// Configuration
const FREE_DAILY_LIMIT = 5;
const STORAGE_KEY = 'webp_usage_data';
const PREMIUM_KEY = 'webp_premium_status';

interface UsageData {
  deviceId: string;
  date: string;
  conversions: number;
  totalConversions: number;
}

interface PremiumStatus {
  isPremium: boolean;
  licenseKey?: string;
  activatedAt?: string;
}

interface UsageTracking {
  // State
  conversionsToday: number;
  totalConversions: number;
  remainingToday: number;
  isPremium: boolean;
  canConvert: boolean;
  isLoaded: boolean;

  // Actions
  recordConversion: (count?: number) => boolean;
  checkCanConvert: (count?: number) => boolean;
  activatePremium: (licenseKey: string) => boolean;
  deactivatePremium: () => void;

  // Constants
  dailyLimit: number;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getStoredUsage(): UsageData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function setStoredUsage(data: UsageData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getStoredPremium(): PremiumStatus {
  if (typeof window === 'undefined') {
    return { isPremium: false };
  }

  try {
    const stored = localStorage.getItem(PREMIUM_KEY);
    if (!stored) return { isPremium: false };
    return JSON.parse(stored);
  } catch {
    return { isPremium: false };
  }
}

function setStoredPremium(status: PremiumStatus): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREMIUM_KEY, JSON.stringify(status));
}

export function useUsageTracking(): UsageTracking {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({ isPremium: false });
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const deviceId = getDeviceId();
    const today = getTodayDate();
    const stored = getStoredUsage();
    const premium = getStoredPremium();

    setPremiumStatus(premium);

    if (stored && stored.deviceId === deviceId && stored.date === today) {
      // Same device, same day - use stored data
      setUsageData(stored);
    } else if (stored && stored.deviceId === deviceId) {
      // Same device, new day - reset daily count
      const newData: UsageData = {
        deviceId,
        date: today,
        conversions: 0,
        totalConversions: stored.totalConversions,
      };
      setUsageData(newData);
      setStoredUsage(newData);
    } else {
      // New device or no data
      const newData: UsageData = {
        deviceId,
        date: today,
        conversions: 0,
        totalConversions: stored?.totalConversions || 0,
      };
      setUsageData(newData);
      setStoredUsage(newData);
    }

    setIsLoaded(true);
  }, []);

  const conversionsToday = usageData?.conversions || 0;
  const totalConversions = usageData?.totalConversions || 0;
  const remainingToday = Math.max(0, FREE_DAILY_LIMIT - conversionsToday);
  const isPremium = premiumStatus.isPremium;
  const canConvert = isPremium || conversionsToday < FREE_DAILY_LIMIT;

  const checkCanConvert = useCallback((count: number = 1): boolean => {
    if (premiumStatus.isPremium) return true;
    return (usageData?.conversions || 0) + count <= FREE_DAILY_LIMIT;
  }, [premiumStatus.isPremium, usageData?.conversions]);

  const recordConversion = useCallback((count: number = 1): boolean => {
    if (!usageData) return false;

    // Premium users can always convert
    if (premiumStatus.isPremium) {
      const newData: UsageData = {
        ...usageData,
        conversions: usageData.conversions + count,
        totalConversions: usageData.totalConversions + count,
      };
      setUsageData(newData);
      setStoredUsage(newData);
      return true;
    }

    // Check if within limit
    if (usageData.conversions + count > FREE_DAILY_LIMIT) {
      return false;
    }

    // Record the conversion
    const newData: UsageData = {
      ...usageData,
      conversions: usageData.conversions + count,
      totalConversions: usageData.totalConversions + count,
    };
    setUsageData(newData);
    setStoredUsage(newData);
    return true;
  }, [usageData, premiumStatus.isPremium]);

  const activatePremium = useCallback((licenseKey: string): boolean => {
    // Basic validation - in production, validate against your backend
    if (!licenseKey || licenseKey.length < 8) {
      return false;
    }

    const newStatus: PremiumStatus = {
      isPremium: true,
      licenseKey,
      activatedAt: new Date().toISOString(),
    };

    setPremiumStatus(newStatus);
    setStoredPremium(newStatus);
    return true;
  }, []);

  const deactivatePremium = useCallback((): void => {
    const newStatus: PremiumStatus = { isPremium: false };
    setPremiumStatus(newStatus);
    setStoredPremium(newStatus);
  }, []);

  return {
    conversionsToday,
    totalConversions,
    remainingToday,
    isPremium,
    canConvert,
    isLoaded,
    recordConversion,
    checkCanConvert,
    activatePremium,
    deactivatePremium,
    dailyLimit: FREE_DAILY_LIMIT,
  };
}
