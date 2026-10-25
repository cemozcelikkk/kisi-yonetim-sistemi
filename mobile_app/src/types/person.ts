// API'den gelen kişi nesnesinin TypeScript karşılığı.
// Alan adları backend'deki JSON ile birebir aynıdır (camelCase).
export interface Person {
  id: number;
  fullName: string;
  department: string;
  photoUrl: string | null;
  birthPlace: string;
  birthDate: string; // "YYYY-MM-DD" biçiminde
  email: string;
  phone: string;
}

// POST ve PUT isteklerinde gönderilen gövde: id'yi sunucu belirler.
export type PersonInput = Omit<Person, 'id'>;
