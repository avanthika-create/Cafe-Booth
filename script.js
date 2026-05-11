document.addEventListener("DOMContentLoaded", () => {

  // ELEMENTS

  const cards = document.querySelectorAll(".card");
  const menu = document.querySelector(".menu");
  const stripView = document.querySelector(".strip-view");
  const backBtn = document.getElementById("backBtn");

  const video = document.getElementById("camera");
  const captureBtn = document.getElementById("captureBtn");

  const stripBg = document.getElementById("stripBg");

  const slot1 = document.getElementById("slot1");
  const slot2 = document.getElementById("slot2");
  const slot3 = document.getElementById("slot3");

  const flash = document.getElementById("flash");

  const finishBtn = document.getElementById("finishBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  const shutterSound = document.getElementById("shutterSound");
  const filmBurn = document.getElementById("filmBurn");

  let stream;
  let photoCount = 0;

  // CLICK

  cards.forEach(card => {

    card.addEventListener("click", () => {

      const theme = card.dataset.theme;

      // STOP OTHER CARDS
      cards.forEach(other => {
        if (other !== card) {
          other.style.opacity = "0";
        }
      });

      // MORPH
      card.classList.add("morph");

      // SWITCH UI
      menu.classList.add("hidden");
      stripView.classList.remove("hidden");

      // LOAD STRIP DESIGN
      stripBg.src = `templates/${theme}-strip.png`;

      // START CAMERA
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          video.srcObject = s;
          video.play();
        })
        .catch(err => {
          console.log("Camera Error:", err);
        });

    });

  });

  // CAPTURE BUTTON

  captureBtn.addEventListener("click", () => {

    
    if (!video.videoWidth) return;

    // shutter sound when clicking button

    shutterSound.currentTime = 0; 
    shutterSound.volume = 1;
    shutterSound.play()
      .catch(err => console.log(err));

    // film

    filmBurn.classList.add("active");

    setTimeout(() => { 
      filmBurn.classList.remove("active");
    }, 600);

    // flash
    flash.classList.add("flash-active");
    setTimeout(() => flash.classList.remove("flash-active"), 250);

    // shake
    video.classList.add("shake");
    setTimeout(() => video.classList.remove("shake"), 300);

    // canvas
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    // mirror fix (IMPORTANT FIXED SYNTAX)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");

    photoCount++;

    if (photoCount === 1) slot1.src = image;
    else if (photoCount === 2) slot2.src = image;
    else if (photoCount === 3) {
      slot3.src = image;

      // show finish button after 3rd photo
      finishBtn.classList.remove("hidden");
    }

  });

  // finish strip

  finishBtn.addEventListener("click", () => {

    finishBtn.classList.add("printing"); 

    setTimeout(() => {
       finishBtn.classList.remove("printing");
    }, 700);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 320;
    canvas.height = 480;

    const bg = new Image();
    bg.src = stripBg.src;

    bg.onload = () => {

      // draw background strip
      ctx.drawImage(bg, 0, 0, 320, 480);

      const imgs = [slot1, slot2, slot3];
      const yPositions = [100, 225, 350];

      imgs.forEach((img, i) => {

        if (!img.src) return;

        const photo = new Image();
        photo.src = img.src;

        photo.onload = () => {
          ctx.drawImage(photo, 10, yPositions[i], 300, 125);
        };

      });

      // show download button
      downloadBtn.classList.remove("hidden");

      downloadBtn.onclick = () => {

        const link = document.createElement("a");
        link.download = "cafe-booth-strip.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

      };

    };

  });

  // BACK BUTTON

  backBtn.addEventListener("click", () => {

    // STOP CAMERA
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    stream = null;

    // RESET STATE
    photoCount = 0;

    slot1.src = "";
    slot2.src = "";
    slot3.src = "";

    finishBtn.classList.add("hidden");
    downloadBtn.classList.add("hidden");

    // UI SWITCH BACK
    stripView.classList.add("hidden");
    menu.classList.remove("hidden");

    // RESET CARDS
    cards.forEach(card => {
      card.classList.remove("morph");
      card.style.opacity = "1";
      card.style.transform = "none";
    });

  });

});