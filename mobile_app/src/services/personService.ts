import axios from 'axios';

import { API_BASE_URL } from '../constants/config';
import { Person, PersonInput } from '../types/person';

// Tüm istekler bu ortak axios örneği üzerinden gider.
// baseURL sayesinde her çağrıda sadece "/api/persons" yazmak yeterli.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 saniyede cevap gelmezse istek iptal edilir
  headers: { 'Content-Type': 'application/json' },
});

// GET /api/persons → tüm kişiler
export async function getPersons(): Promise<Person[]> {
  const response = await api.get<Person[]>('/api/persons');
  return response.data;
}

// GET /api/persons/{id} → tek kişi
export async function getPerson(id: number): Promise<Person> {
  const response = await api.get<Person>(`/api/persons/${id}`);
  return response.data;
}

// POST /api/persons → yeni kişi oluşturur, oluşturulan kişiyi (id dahil) döner
export async function createPerson(person: PersonInput): Promise<Person> {
  const response = await api.post<Person>('/api/persons', person);
  return response.data;
}

// PUT /api/persons/{id} → kişiyi günceller
export async function updatePerson(id: number, person: PersonInput): Promise<Person> {
  const response = await api.put<Person>(`/api/persons/${id}`, { id, ...person });
  return response.data;
}

// DELETE /api/persons/{id} → kişiyi siler (sunucu 204 döner, gövde yok)
export async function deletePerson(id: number): Promise<void> {
  await api.delete(`/api/persons/${id}`);
}

// Axios hatasını kullanıcıya gösterilebilecek Türkçe bir mesaja çevirir.
export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Beklenmeyen bir hata oluştu.';
  }

  // Sunucudan hiç cevap gelmediyse: backend kapalı, adres yanlış veya zaman aşımı
  if (!error.response) {
    return `Sunucuya ulaşılamadı. Backend'in çalıştığından ve adresin doğru olduğundan emin olun.\n(${API_BASE_URL})`;
  }

  const data = error.response.data;

  // ASP.NET doğrulama hataları: { errors: { Email: ["..."], Phone: ["..."] } }
  if (data?.errors) {
    const messages = Object.values(data.errors as Record<string, string[]>).flat();
    return messages.join('\n');
  }

  // Controller'ın döndüğü { message: "..." } biçimi
  if (data?.message) {
    return data.message;
  }

  if (error.response.status === 404) {
    return 'Kayıt bulunamadı.';
  }

  return `Sunucu hatası (${error.response.status}).`;
}
