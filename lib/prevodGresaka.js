// Prevod najčešćih (engleskih) Supabase poruka o greškama na bosanski
const PREVODI = [
  [/invalid login credentials/i, "Pogrešan e-mail ili lozinka."],
  [/user already registered/i, "Korisnik s ovim e-mailom je već registrovan."],
  [/email not confirmed/i, "E-mail nije potvrđen. Provjeri inbox i klikni na verifikacijski link."],
  [/password should be at least/i, "Lozinka mora imati najmanje 6 znakova."],
  [/new password should be different/i, "Nova lozinka mora biti drugačija od stare."],
  [/unable to validate email|invalid email|email address .* is invalid/i, "E-mail adresa nije ispravna."],
  [/rate limit|too many requests|for security purposes/i, "Previše pokušaja. Pokušaj ponovo za nekoliko minuta."],
  [/auth session missing|session.*expired|jwt expired/i, "Sesija je istekla. Otvori ponovo link iz e-maila."],
  [/network|failed to fetch/i, "Greška u mrežnoj konekciji. Provjeri internet i pokušaj ponovo."],
];

export function prevediGresku(poruka) {
  if (!poruka) return "Došlo je do greške. Pokušaj ponovo.";
  const pogodak = PREVODI.find(([regex]) => regex.test(poruka));
  return pogodak ? pogodak[1] : "Došlo je do greške. Pokušaj ponovo.";
}
