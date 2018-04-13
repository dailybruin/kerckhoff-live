const APP_NAME = 'kerckhoff-live';
const PORT: number = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const KERCKHOFF_URL = process.env.KERCKHOFF_URL || 'localhost:8000';
const MAX_TIME_BEFORE_RECHECK = 30000; // 30 sec

export { APP_NAME, PORT, HOST, KERCKHOFF_URL, MAX_TIME_BEFORE_RECHECK };
