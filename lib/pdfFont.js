// Registruje Roboto (podržava č, ć, đ, š, ž) u jsPDF dokumentu.
// Standardni jsPDF fontovi (helvetica, courier) nemaju sva bosanska slova.
const FONTOVI = [
  { fajl: "Roboto-Regular.ttf", stil: "normal" },
  { fajl: "Roboto-Bold.ttf", stil: "bold" },
];

let cache = null;

const uBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

export async function registrujFont(doc) {
  if (!cache) {
    cache = Promise.all(
      FONTOVI.map(async ({ fajl, stil }) => {
        const res = await fetch(`/fonts/${fajl}`);
        if (!res.ok) throw new Error(`Font ${fajl} nije učitan`);
        return { fajl, stil, data: uBase64(await res.arrayBuffer()) };
      })
    ).catch((e) => {
      cache = null;
      throw e;
    });
  }
  const fontovi = await cache;
  fontovi.forEach(({ fajl, stil, data }) => {
    doc.addFileToVFS(fajl, data);
    doc.addFont(fajl, "Roboto", stil);
  });
  doc.setFont("Roboto", "normal");
}
