import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function generateKeywords(goal) {
  const res = await api.post('/generate-keywords', { goal });
  return res.data;
}

export async function fetchLeads() {
  const res = await api.get('/leads');
  return res.data;
}

export async function checkConnection() {
  const res = await api.get('/check-status');
  return res.data;
}

export async function initializeSession() {
  const res = await api.post('/initialize-session');
  return res.data;
}

export async function connectCredentials({ username, password }) {
  const res = await api.post('/connect-credentials', { username, password });
  return res.data;
}

export async function submitChallenge({ code }) {
  const res = await api.post('/submit-challenge', { code });
  return res.data;
}

export async function connectCookie({ li_at }) {
  const res = await api.post('/connect-cookie', { li_at });
  return res.data;
}

export async function logoutAccount() {
  const res = await api.post('/logout-account');
  return res.data;
}

export async function syncScrape({ targetUrl, maxPosts, mode = 'posts' }) {
  const endpoint = mode === 'jobs' ? '/sync-jobs' : '/sync';
  const paramKey = mode === 'jobs' ? 'max_jobs' : 'max_posts';

  const res = await api.post(
    `${endpoint}?target_url=${encodeURIComponent(targetUrl)}&${paramKey}=${maxPosts}`
  );
  return res.data;
}

export async function batchSync(tasks) {
  const res = await api.post('/batch-sync', tasks);
  return res.data;
}

export async function deleteLead({ jobTitle, companyName = null }) {
  const params = new URLSearchParams();
  params.set('job_title', jobTitle);
  if (companyName !== null) params.set('company_name', companyName);

  const res = await api.delete(`/delete-lead?${params.toString()}`);
  return res.data;
}

// ──────── User Preferences ────────
export async function getUserPreferences() {
  const res = await api.get('/user-preferences');
  return res.data;
}

export async function updateUserPreferences({ category, keyword }) {
  const params = new URLSearchParams({ category, keyword });
  const res = await api.post(`/user-preferences?${params.toString()}`);
  return res.data;
}

// ──────── Custom Keywords ────────
export async function getCustomKeywords() {
  const res = await api.get('/custom-keywords');
  return res.data;
}

export async function addCustomKeyword(keyword) {
  const params = new URLSearchParams({ keyword });
  const res = await api.post(`/custom-keywords?${params.toString()}`);
  return res.data;
}

export async function removeCustomKeyword(keyword) {
  const params = new URLSearchParams({ keyword });
  const res = await api.delete(`/custom-keywords?${params.toString()}`);
  return res.data;
}

// ──────── Background Scrape Status ────────
export async function checkScrapingStatus() {
  const res = await api.get('/is-scraping');
  return res.data;
}