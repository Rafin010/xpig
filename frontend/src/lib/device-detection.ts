export interface DeviceMetadata {
  deviceName: string;
  os: string;
  browser: string;
  screenRes: string;
  timezone: string;
  platform: string;
}

export function detectClientEnvironment(): DeviceMetadata {
  if (typeof window === 'undefined') {
    return {
      deviceName: 'Client Workstation',
      os: 'Standard OS',
      browser: 'Web Browser',
      screenRes: '1920 x 1080',
      timezone: 'UTC',
      platform: 'Desktop',
    };
  }

  const ua = navigator.userAgent || '';
  
  // OS & Hardware Platform
  let os = 'Standard OS';
  let deviceName = 'Standard Workstation';

  if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows 10/11';
    deviceName = 'Windows PC (x64 Desktop)';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows Desktop';
    deviceName = 'Windows Workstation';
  } else if (/iPhone/i.test(ua)) {
    os = 'Apple iOS';
    deviceName = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    os = 'Apple iPadOS';
    deviceName = 'Apple iPad Tablet';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    deviceName = 'Apple Mac Desktop / MacBook';
  } else if (/Android/i.test(ua)) {
    os = 'Google Android';
    deviceName = 'Android Mobile Device';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux Kernel';
    deviceName = 'Linux Workstation';
  }

  // Browser
  let browser = 'Web Browser';
  if (/Edg\/([0-9.]+)/i.test(ua)) {
    browser = `Microsoft Edge ${ua.match(/Edg\/([0-9.]+)/i)?.[1] || ''}`.trim();
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browser = `Google Chrome ${ua.match(/Chrome\/([0-9.]+)/i)?.[1] || ''}`.trim();
  } else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = `Apple Safari ${ua.match(/Version\/([0-9.]+)/i)?.[1] || ''}`.trim();
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browser = `Mozilla Firefox ${ua.match(/Firefox\/([0-9.]+)/i)?.[1] || ''}`.trim();
  }

  const screenRes = `${window.screen?.width || 1920} x ${window.screen?.height || 1080}`;
  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {}

  return {
    deviceName,
    os,
    browser,
    screenRes,
    timezone,
    platform: navigator.platform || os,
  };
}

export function recordLegalSignature(providedEnv?: DeviceMetadata) {
  if (typeof window === 'undefined') return null;

  const env = providedEnv || detectClientEnvironment();
  const now = new Date();
  const utcStr = now.toUTCString();
  const localStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  localStorage.setItem('pig_legal_accepted', 'true');
  localStorage.setItem('pig_legal_signed_at', utcStr);
  localStorage.setItem('pig_legal_local_time', localStr);
  localStorage.setItem('pig_legal_calendar_date', dateStr);
  localStorage.setItem('pig_legal_device_name', env.deviceName);
  localStorage.setItem('pig_legal_device_browser', env.browser);
  localStorage.setItem('pig_legal_device_os', env.os);
  localStorage.setItem('pig_legal_device_screen', env.screenRes);
  localStorage.setItem('pig_legal_device_tz', env.timezone);

  return {
    utcStr,
    localStr,
    dateStr,
    deviceName: env.deviceName,
  };
}
