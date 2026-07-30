export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return 'http://127.0.0.1:8000';
  return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
};
