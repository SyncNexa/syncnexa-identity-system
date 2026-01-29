/**
 * Utility to parse browser and device information from user agent string
 */

export interface DeviceInfo {
  browser: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  deviceName: string;
}

/**
 * Parse browser name from user agent
 */
export function parseBrowser(userAgent: string): string {
  if (!userAgent) return "Unknown";

  // Check for various browsers
  if (/edg/i.test(userAgent)) return "Edge";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/opera|opr/i.test(userAgent)) return "Opera";
  if (/trident/i.test(userAgent)) return "Internet Explorer";
  if (/samsung/i.test(userAgent)) return "Samsung Browser";
  if (/ucbrowser/i.test(userAgent)) return "UC Browser";
  if (/brave/i.test(userAgent)) return "Brave";
  if (/vivaldi/i.test(userAgent)) return "Vivaldi";

  return "Unknown";
}

/**
 * Parse device type from user agent
 */
export function parseDeviceType(
  userAgent: string,
): "desktop" | "mobile" | "tablet" | "unknown" {
  if (!userAgent) return "unknown";

  // Check for mobile devices
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) {
    // Check for tablet
    if (/tablet|ipad|android/i.test(userAgent)) {
      if (/android/i.test(userAgent) && !/mobile/i.test(userAgent))
        return "tablet";
      if (/ipad/i.test(userAgent)) return "tablet";
    }
    return "mobile";
  }

  if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    return "tablet";
  }

  return "desktop";
}

/**
 * Parse device name from user agent
 */
export function parseDeviceName(userAgent: string): string {
  if (!userAgent) return "Unknown Device";

  // iOS devices
  if (/iphone/i.test(userAgent)) return "iPhone";
  if (/ipad/i.test(userAgent)) return "iPad";
  if (/ipod/i.test(userAgent)) return "iPod";

  // Android devices
  if (/android/i.test(userAgent)) {
    const androidMatch = userAgent.match(/android[;\s]([^;)]*)/i);
    if (androidMatch && androidMatch[1]) {
      return androidMatch[1].trim();
    }
    return "Android Device";
  }

  // Windows devices
  if (/windows/i.test(userAgent)) {
    if (/windows phone/i.test(userAgent)) return "Windows Phone";
    return "Windows PC";
  }

  // macOS devices
  if (/macintosh|mac_powerpc|macppc/i.test(userAgent)) {
    if (/iphone|ipad|ipod/i.test(userAgent)) return "Apple Device";
    return "Mac";
  }

  // Linux
  if (/linux/i.test(userAgent)) {
    if (/ubuntu/i.test(userAgent)) return "Ubuntu";
    if (/debian/i.test(userAgent)) return "Debian";
    return "Linux";
  }

  return "Unknown Device";
}

/**
 * Extract complete device information from user agent
 */
export function parseDeviceInfo(userAgent: string): DeviceInfo {
  return {
    browser: parseBrowser(userAgent),
    deviceType: parseDeviceType(userAgent),
    deviceName: parseDeviceName(userAgent),
  };
}

/**
 * Generate human-readable device description
 */
export function generateDeviceDescription(deviceInfo: DeviceInfo): string {
  return `${deviceInfo.deviceName} • ${deviceInfo.browser}`;
}
