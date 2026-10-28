// bcryptjs@2-ը տիպեր չունի. օգտագործում ենք միայն compare-ը (Supabase-ից ներմուծված գաղտնաբառերի համար)
declare module "bcryptjs" {
  export function compare(password: string, hash: string): Promise<boolean>;
  const bcrypt: { compare: typeof compare };
  export default bcrypt;
}
