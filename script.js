// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyApXdbRYqUGOpkjhcakVtuPyn8yIa9gMtY",
  authDomain: "undangan-ir1.firebaseapp.com",
  projectId: "undangan-ir1",
};

// INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  const el = {
    guestName: document.getElementById("guestName"),
    nama: document.getElementById("nama"),
    ucapan: document.getElementById("ucapan"),
    status: document.getElementById("status"),
    list: document.getElementById("listUcapan"),
    total: document.getElementById("totalHadir"),
    cover: document.getElementById("cover"),
    main: document.getElementById("main"),
    music: document.getElementById("music")
  };

  // ================= NAMA TAMU =================
  const params = new URLSearchParams(window.location.search);
  const namaTamu = params.get("to")
    ? decodeURIComponent(params.get("to"))
    : "Tamu Undangan";

  if (el.guestName) el.guestName.innerText = namaTamu;
  if (el.nama) el.nama.value = namaTamu;

  // ================= COUNTDOWN =================
  initCountdown();

  // ================= REALTIME =================
  initRealtime();

  // ================= FORM =================
  window.kirimUcapan = async () => {

    const nama = el.nama.value.trim();
    const ucapan = el.ucapan.value.trim();
    const status = el.status.value;

    if (!nama || !ucapan) {
      alert("Isi nama dan ucapan dulu ya!");
      return;
    }

    try {
      // SIMPAN KE FIREBASE
      await addDoc(collection(db, "ucapan"), {
        nama,
        ucapan,
        status,
        waktu: Date.now()
      });

      // RESET FORM
      el.ucapan.value = "";
      el.status.value = "Hadir";

      alert("Ucapan berhasil dikirim ❤️");

    } catch (err) {
      console.error(err);
      alert("Gagal mengirim");
    }
  };

});

// ================= COUNTDOWN =================
const targetDate = new Date("May 30, 2026 09:00:00").getTime();

function initCountdown() {
  const d = document.getElementById("cd-days");
  const h = document.getElementById("cd-hours");
  const m = document.getElementById("cd-mins");
  const s = document.getElementById("cd-secs");

  if (!d || !h || !m || !s) return;

  setInterval(() => {
    const now = Date.now();
    let gap = targetDate - now;

    if (gap < 0) gap = 0;

    const days = Math.floor(gap / (1000 * 60 * 60 * 24));
    const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((gap / (1000 * 60)) % 60);
    const secs = Math.floor((gap / 1000) % 60);

    d.textContent = days;
    h.textContent = String(hours).padStart(2, "0");
    m.textContent = String(mins).padStart(2, "0");
    s.textContent = String(secs).padStart(2, "0");

  }, 1000);
}

// ================= REALTIME UCAPAN =================
function initRealtime() {
  const list = document.getElementById("listUcapan");
  const total = document.getElementById("totalHadir");

  if (!list) return;

  const q = query(collection(db, "ucapan"), orderBy("waktu", "desc"));

  onSnapshot(q, (snapshot) => {

    list.innerHTML = "";
    let hadir = 0;

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.status === "Hadir") hadir++;

      const item = document.createElement("p");
      item.innerHTML = `<b>${data.nama}</b> (${data.status})<br>${data.ucapan}`;

      list.appendChild(item);
    });

    if (total) {
      total.innerText = `Total Hadir: ${hadir} orang`;
    }

  });
}

// ================= COPY REKENING =================
window.copyRek = async function (teks) {
  try {
    await navigator.clipboard.writeText(teks);
    alert("Nomor rekening berhasil disalin!");
  } catch {
    alert("Gagal copy, salin manual ya!");
  }
};


// ================= SCROLL ANIMATION =================
// ================= ANIMATION FIX (HP FRIENDLY) =================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-show");
      observer.unobserve(entry.target); // penting!
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".fade-hidden").forEach(el => {
  observer.observe(el);
});

// observe semua element SEKALI di awal
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".fade-hidden").forEach(el => {
    observer.observe(el);
  });

  document.querySelectorAll("section").forEach(sec => {
    sec.classList.add("cinematic");
  });
});

// FORCE SHOW untuk HP (biar gak nunggu sentuhan)

// HERO AUTO SHOW (saat pertama buka)
window.addEventListener("load", () => {
  document.querySelectorAll(".fade-soft").forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("show");
    }, i * 200);
  });
});



// ================= OPEN INVITE (CINEMATIC CLOUD + AUTO SCROLL) =================
window.openInvite = function () {
  const cover = document.getElementById("cover");
  const main = document.getElementById("main");
  const music = document.getElementById("music");
  const cloud = document.getElementById("cloudTransition");
  const endTarget = document.querySelector(".thank-section");

  // ================= CLOUD MUNCUL =================
  if (cloud) {
    cloud.style.display = "block";

    setTimeout(() => {
      cloud.classList.add("active");
    }, 100);
  }

  // ================= DELAY MASUK KE MAIN =================
  setTimeout(() => {

    // tampilkan UI
    if (cover) cover.classList.add("hidden");
    if (main) main.classList.remove("hidden");

    window.scrollTo(0, 0);

    // ================= AUDIO =================
    if (music) {
      music.play().catch(() => {
        console.log("Autoplay blocked");
      });
    }

    // ================= AUTO SCROLL =================
    let isScrolling = true;
    let userInteracted = false;

    let speed = window.innerWidth < 768 ? 1.5 : 2.5;
    let currentY = 0;

    const scrollInterval = setInterval(() => {
      if (!isScrolling) {
        clearInterval(scrollInterval);
        return;
      }

      currentY += speed;
      window.scrollTo(0, currentY);

      // stop di akhir
      if (endTarget) {
        const targetPos = endTarget.offsetTop + endTarget.offsetHeight;
        const currentPos = window.scrollY + window.innerHeight;

        if (currentPos >= targetPos - 50) {
          isScrolling = false;
          clearInterval(scrollInterval);
        }
      }

    }, 16);

    // ================= STOP SCROLL =================
    function stopScroll() {
      if (userInteracted) {
        isScrolling = false;
        clearInterval(scrollInterval);
      }
    }

    setTimeout(() => {
      userInteracted = true;

      window.addEventListener("touchstart", stopScroll, { passive: true });
      window.addEventListener("wheel", stopScroll, { passive: true });
      window.addEventListener("mousedown", stopScroll);
    }, 800);

  }, 600); // delay supaya cloud kebuka dulu

  // ================= HAPUS CLOUD =================
  setTimeout(() => {
    if (cloud) cloud.style.display = "none";
  }, 1800);
};

// ================= CINEMATIC BLUR (FIXED) =================
let ticking = false;

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateBlur);
    ticking = true;
  }
});

function updateBlur() {
  const sections = document.querySelectorAll("main > section");
  const screenCenter = window.innerHeight / 2;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;

    const distance = Math.abs(screenCenter - sectionCenter);

    // kalau section aktif → jangan blur
    if (distance < 150) {
    sec.style.filter = "blur(0px)";
    sec.style.opacity = "1";
    return;
  }

  // blur lebih halus (HP friendly)
  const blur = Math.min(distance / 600, 2);
  const opacity = Math.max(1 - distance / 1200, 0.7);

  sec.style.filter = `blur(${blur}px)`;
  sec.style.opacity = opacity;
  });

  ticking = false;
}

document.body.style.opacity = "0";

window.addEventListener("load", () => {
  document.body.style.transition = "opacity 0.8s ease";
  document.body.style.opacity = "1";
});



// ================= FLOWER SCROLL ANIMATION =================
const flowerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show-flowers");
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll("section").forEach(sec => {
  flowerObserver.observe(sec);
});


// ================= PETAL PHYSICS REAL =================
function createPetal() {
  const petal = document.createElement("div");
  petal.classList.add("petal");

  let x = Math.random() * window.innerWidth;
  let y = -50;

  let speedY = Math.random() * 1.5 + 1;
  let wind = Math.random() * 2 - 1;
  let rotation = Math.random() * 360;

  const size = Math.random() * 15 + 10;
  petal.style.width = size + "px";
  petal.style.height = size + "px";

  document.body.appendChild(petal);

  function animate() {
    y += speedY;
    x += wind;

    // angin berubah-ubah (ini kunci physics)
    wind += (Math.random() - 0.5) * 0.05;

    rotation += 1;

    petal.style.transform =
      `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

    if (y < window.innerHeight + 50) {
      requestAnimationFrame(animate);
    } else {
      petal.remove();
    }
  }

  animate();
}

setInterval(createPetal, 500);



document.querySelectorAll("section").forEach(sec => {
  const flower = sec.querySelector(".flower-top-right");

  if (!flower) return;

  window.addEventListener("scroll", () => {
    const rect = sec.getBoundingClientRect();
    const offset = rect.top * 0.3;

    flower.style.transform =
      `translateY(${offset}px) rotate(${offset * 0.05}deg)`;
  });
});


// ================= AUTO PLAY WIND + BIRD =================
document.addEventListener("click", startAmbienceOnce);

function startAmbienceOnce() {
  const wind = document.getElementById("wind");
  const bird = document.getElementById("bird");

  if (!wind && !bird) return;

  if (wind) {
    wind.volume = 0.2;
    wind.play().catch(() => {});
  }

  if (bird) {
    bird.volume = 0.08; // lebih kecil biar gak jadi pasar
    bird.play().catch(() => {});
  }

  document.removeEventListener("click", startAmbienceOnce);
}
function fadeIn(audio, target = 0.2) {
  let vol = 0;
  audio.volume = 0;
  audio.play();

  const interval = setInterval(() => {
    vol += 0.02;
    if (vol >= target) {
      audio.volume = target;
      clearInterval(interval);
    } else {
      audio.volume = vol;
    }
  }, 100);
}

document.addEventListener("click", () => {
  const wind = document.getElementById("wind");
  const bird = document.getElementById("bird");

  if (wind) fadeIn(wind, 0.2);
  if (bird) fadeIn(bird, 0.08);
}, { once: true });