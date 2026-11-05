const SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwoKOIqTMIMco2oYwbJEg6IIYW_9KmOEcyxY9NOrAcF3YHLeSeh9Mb7oEQN74rQlzinvw/exec";

const KEY = {
  1: "B",
  2: ["obat", "buah"],
  3: { a: "B", b: "B", c: "S" },
  4: "A",
  5: { a: "S", b: "B", c: "B" },
  6: ["a", "b"],
  7: "C",
  8: ["evaporasi", "kondensasi"],
  9: { a: "S", b: "B", c: "B" },
  10: { a: "S", b: "B", c: "B" },
  11: ["a", "c"],
  12: "C",
  13: "D",
  14: { a: "B", b: "B", c: "S" },
  15: ["a", "c"],
  16: "B",
  17: ["a", "b"],
  18: { a: "S", b: "S", c: "B" },
  19: "B",
  20: ["a", "c"],
  21: { a: "B", b: "S", c: "B" },
  22: { a: "B" },
  23: ["a", "b"],
  24: "D",
  25: "D",
  26: { a: "S", b: "B", c: "S" },
  27: ["b", "c"],
  28: "C",
  29: { a: "S", b: "B", c: "S" },
  30: ["a", "b"],
};

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const left = [...a].sort().join("|");
  const right = [...b].sort().join("|");
  return left === right;
}

function mark(el, ok) {
  el.classList.remove("correct", "wrong");
  el.classList.add(ok ? "correct" : "wrong");
}

function grade() {
  let benar = 0;
  const items = document.querySelectorAll(".q");

  items.forEach((el) => {
    const no = Number(el.dataset.q);
    const type = el.dataset.type;
    let ok = false;

    if (type === "single") {
      const picked = el.querySelector("input:checked");
      ok = Boolean(picked) && picked.value === KEY[no];
    }

    if (type === "multi") {
      const picked = [...el.querySelectorAll("input:checked")].map((n) => n.value);
      ok = sameSet(picked, KEY[no]);
    }

    if (type === "tf") {
      const expected = KEY[no];
      ok = Object.keys(expected).every((key) => {
        const picked = el.querySelector(`input[name="q${no}${key}"]:checked`);
        return picked && picked.value === expected[key];
      });
    }

    mark(el, ok);
    if (ok) benar += 1;
  });

  const nilai = Math.round((benar / 30) * 100);
  document.getElementById("scoreValue").textContent = nilai;

  const box = document.getElementById("result");
  const text = document.getElementById("resultText");
  box.hidden = false;
  text.textContent = `Skor: ${benar} dari 30 soal benar (nilai ${nilai}). Mengirim nilai ke spreadsheet...`;
  box.scrollIntoView({ behavior: "smooth", block: "center" });

  const identityInputs = document.querySelectorAll(".identity input");
  const payload = {
    nama: identityInputs[0].value.trim(),
    kelas: identityInputs[1].value.trim(),
    tanggal: identityInputs[2].value.trim(),
    absen: identityInputs[3].value.trim(),
    benar,
    jumlahSoal: 30,
    nilai
  };

  fetch(SHEETS_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
    .then(() => {
      text.textContent = `Skor: ${benar} dari 30 soal benar (nilai ${nilai}). Permintaan pengiriman ke spreadsheet telah dikirim.`;
    })
    .catch(() => {
      text.textContent = `Skor: ${benar} dari 30 soal benar (nilai ${nilai}). Pengiriman ke spreadsheet gagal. Periksa URL dan izin Web App.`;
    });
}

function resetAll() {
  document.querySelectorAll("input[type='radio'], input[type='checkbox']").forEach((el) => {
    el.checked = false;
  });
  document.querySelectorAll(".q").forEach((el) => el.classList.remove("correct", "wrong"));
  document.getElementById("scoreValue").textContent = "—";
  document.getElementById("result").hidden = true;
}

document.getElementById("checkBtn").addEventListener("click", grade);
document.getElementById("resetBtn").addEventListener("click", resetAll);
