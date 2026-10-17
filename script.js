document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const header = document.getElementById("header");
  const progressBar = document.getElementById("progressBar");
  const backTop = document.getElementById("backTop");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  setTimeout(() => {
    preloader.style.opacity = "0";
    preloader.style.pointerEvents = "none";
    setTimeout(() => preloader.remove(), 650);
  }, 700);

  // Mobile navigation
  if(menuToggle && navLinks){
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open);
    menuToggle.querySelectorAll("span")[0].style.transform = open ? "translateY(7px) rotate(45deg)" : "";
    menuToggle.querySelectorAll("span")[1].style.opacity = open ? "0" : "1";
    menuToggle.querySelectorAll("span")[2].style.transform = open ? "translateY(-7px) rotate(-45deg)" : "";
  });
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));
  }

  // Scroll UI
  function onScroll(){
    const y = window.scrollY;
    if(header) header.classList.toggle("scrolled", y > 25);
    if(backTop) backTop.classList.toggle("show", y > 500);
    const doc = document.documentElement;
    const progress = (y / (doc.scrollHeight - doc.clientHeight)) * 100;
    if(progressBar) progressBar.style.width = progress + "%";
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
  if(backTop) backTop.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));

  // Reveal animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // Animated counters
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.target || 0);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 55));
      const timer = setInterval(() => {
        current += step;
        if(current >= target){ current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString();
      }, 22);
      counterObserver.unobserve(el);
    });
  }, {threshold:.8});
  document.querySelectorAll(".counter").forEach(el => counterObserver.observe(el));

  // Loan category filter
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".loan-card");
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const show = filter === "all" || card.dataset.category === filter;
        card.style.display = show ? "" : "none";
      });
    });
  });

  const moreProductsToggle = document.getElementById("moreProductsToggle");
  const moreProducts = document.getElementById("moreProducts");
  if(moreProductsToggle && moreProducts){
    moreProductsToggle.addEventListener("click", () => {
      const expanded = moreProductsToggle.getAttribute("aria-expanded") !== "true";
      moreProductsToggle.setAttribute("aria-expanded", String(expanded));
      moreProducts.hidden = !expanded;
      moreProductsToggle.textContent = expanded ? "Show Less" : "Know More";
    });
  }

  // High-quality online partner-logo loader.
  // Primary logos use scalable SVG references where available; failed references
  // fall back to a 256px Google-hosted favicon and finally the initials tile.
  document.querySelectorAll(".partner-logo-card").forEach(card => {
    const img = card.querySelector(".logo-image-wrap img");
    const fallback = card.querySelector(".logo-fallback");
    const domain = card.dataset.domain;
    if (!img || !domain) return;
    let triedFallback = false;
    img.addEventListener("error", () => {
      if (!triedFallback) {
        triedFallback = true;
        img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
        return;
      }
      img.style.display = "none";
      if (fallback) fallback.style.display = "grid";
    });
  });

  // Animated partner directory: exactly two horizontal rows per active category.
  // Existing partner cards are split across two tracks, then duplicated for seamless looping.
  document.querySelectorAll(".partner-panel .partner-logo-grid").forEach(grid => {
    const cards = Array.from(grid.querySelectorAll(":scope > .partner-logo-card"));
    if (!cards.length) return;
    const marquee = document.createElement("div");
    marquee.className = "partner-marquee";
    [0, 1].forEach(rowIndex => {
      const row = document.createElement("div");
      row.className = "partner-marquee-row" + (rowIndex === 1 ? " partner-marquee-reverse" : "");
      row.style.setProperty("--partner-duration", `${Math.max(24, 30 + cards.length * 1.15 + rowIndex * 5)}s`);
      const track = document.createElement("div");
      track.className = "partner-marquee-track";
      const rowCards = cards.filter((_, index) => index % 2 === rowIndex);
      rowCards.forEach(card => track.appendChild(card));
      rowCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a,button").forEach(el => el.setAttribute("tabindex", "-1"));
        track.appendChild(clone);
      });
      row.appendChild(track);
      marquee.appendChild(row);
    });
    grid.replaceWith(marquee);
  });

  // Partner tabs
  const tabs = document.querySelectorAll(".partner-tab");
  const panels = document.querySelectorAll(".partner-panel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.partner).classList.add("active");
    });
  });

  // Seamless right-to-left lender-logo streams in the hero (inspired by the reference layout).
  // Logo icons use domain favicons; text labels remain readable if a favicon cannot load.
  const bankStreams = document.getElementById("heroBankStreams");
  if (bankStreams) {
    const lenders = [
      { name: "Tata Capital", domain: "tatacapital.com", short: "TATA" },
      { name: "Shriram Finance", domain: "shriramfinance.in", short: "SF" },
      { name: "HDFC Bank", domain: "hdfcbank.com", short: "HDFC" },
      { name: "ICICI Bank", domain: "icicibank.com", short: "ICICI" },
      { name: "Bajaj Finance", domain: "bajajfinserv.in", short: "BAJAJ" },
      { name: "State Bank of India", domain: "sbi.co.in", short: "SBI" },
      { name: "Axis Bank", domain: "axisbank.com", short: "AXIS" },
      { name: "L&T Finance", domain: "ltfinance.com", short: "L&T" },
      { name: "Aditya Birla Finance", domain: "adityabirlacapital.com", short: "AB" },
      { name: "Kotak Mahindra Bank", domain: "kotak.com", short: "KOTAK" },
      { name: "IDFC FIRST Bank", domain: "idfcfirstbank.com", short: "IDFC" },
      { name: "Mahindra Finance", domain: "mahindrafinance.com", short: "MF" },
      { name: "Poonawalla Fincorp", domain: "poonawallafincorp.com", short: "PF" },
      { name: "IndusInd Bank", domain: "indusind.com", short: "INDUS" },
      { name: "Muthoot Finance", domain: "muthootfinance.com", short: "MUTHOOT" },
      { name: "Yes Bank", domain: "yesbank.in", short: "YES" }
    ];
    const makeTrack = (items, laneIndex) => {
      const lane = document.createElement("div");
      lane.className = "bank-stream-lane" + (laneIndex % 2 === 1 ? " bank-stream-reverse" : "");
      lane.style.setProperty("--stream-duration", `${38 + laneIndex * 3}s`);
      const track = document.createElement("div");
      track.className = "bank-stream-track";
      const repeated = [...items, ...items];
      repeated.forEach((lender, i) => {
        const card = document.createElement("div");
        card.className = "bank-stream-card";
        card.setAttribute("aria-hidden", "true");
        const logo = document.createElement("span");
        logo.className = "bank-stream-logo";
        const img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(lender.domain)}&sz=64`;
        img.onerror = () => { img.remove(); logo.textContent = lender.short; };
        logo.appendChild(img);
        const name = document.createElement("span");
        name.className = "bank-stream-name";
        name.textContent = lender.name;
        card.append(logo, name);
        track.appendChild(card);
      });
      lane.appendChild(track);
      bankStreams.appendChild(lane);
    };
    makeTrack(lenders.slice(0, 10), 0);
    makeTrack(lenders.slice(4, 14), 1);
    makeTrack(lenders.slice(2, 12), 2);
    makeTrack(lenders.slice(6, 16), 3);
    makeTrack(lenders.slice(0, 10), 4);
  }

  // Rotate between the main homepage hero and the seasonal offer slide.
  const heroCarousel = document.getElementById("heroSlides");
  if (heroCarousel) {
    const heroSlides = Array.from(heroCarousel.querySelectorAll("[data-hero-slide]"));
    const heroDots = Array.from(document.querySelectorAll("[data-hero-go]"));
    const navratriHero = heroCarousel.querySelector(".navratri-hero");
    let startNavratriAnimation = () => {};
    let stopNavratriAnimation = () => {};
    let activeSlideIndex = heroSlides.findIndex(slide => slide.classList.contains("is-active"));
    let navratriTimers = [];
    let navratriFrame = null;
    let heroRotationTimer = null;

    if (activeSlideIndex < 0) activeSlideIndex = 0;

    if (navratriHero) {
      const cards = Array.from(navratriHero.querySelectorAll(".loan-card"));
      const amount = navratriHero.querySelector("[data-navratri-amount]");
      const count = navratriHero.querySelector("[data-navratri-count]");
      const due = navratriHero.querySelector("[data-navratri-due]");
      const center = navratriHero.querySelector(".center-card");
      const centerLabel = navratriHero.querySelector(".center-label");
      const savingNote = navratriHero.querySelector("[data-navratri-saving]");
      const bars = Array.from(navratriHero.querySelectorAll(".bars span"));
      const existingTotal = 65600;
      const singleEmi = 15000;

      const formatINR = value => "₹" + Math.round(value).toLocaleString("en-IN");
      const scheduleNavratri = (callback, delay) => {
        const timer = window.setTimeout(callback, delay);
        navratriTimers.push(timer);
      };
      const clearNavratriAnimation = () => {
        navratriTimers.forEach(window.clearTimeout);
        navratriTimers = [];
        if (navratriFrame !== null) {
          window.cancelAnimationFrame(navratriFrame);
          navratriFrame = null;
        }
      };
      const setExistingState = () => {
        center.classList.remove("single-emi", "amount-settled");
        centerLabel.textContent = "Your EMIs today";
        count.textContent = "5 EMIs";
        due.textContent = "5 due dates";
        savingNote.textContent = "Illustrative comparison only. Actual EMIs vary by lender.";
        bars.forEach(bar => {
          bar.style.opacity = "1";
          bar.style.flex = "1";
        });
      };
      const setSingleState = () => {
        center.classList.add("single-emi", "amount-settled");
        centerLabel.textContent = "One simple EMI";
        count.textContent = "1 EMI";
        due.textContent = "1 due date";
        savingNote.textContent = "Illustration only; EMI and savings vary by lender.";
        bars.forEach((bar, index) => {
          bar.style.opacity = index === 0 ? "1" : ".22";
          bar.style.flex = index === 0 ? "1.6" : "1";
        });
      };
      const resetNavratriAnimation = () => {
        clearNavratriAnimation();
        cards.forEach(card => {
          card.classList.remove("to-background", "from-background", "hidden", "depth-front", "depth-back");
          card.style.transitionDelay = "";
        });
        amount.classList.remove("amount-roll-in", "amount-roll-out", "amount-fade-in", "amount-fade-out");
        amount.textContent = formatINR(existingTotal);
        setExistingState();
      };
      stopNavratriAnimation = resetNavratriAnimation;
      const smoothCount = (from, to, duration, callback) => {
        if (navratriFrame !== null) window.cancelAnimationFrame(navratriFrame);
        amount.classList.remove("amount-roll-in", "amount-roll-out");
        void amount.offsetWidth;
        amount.classList.add("amount-roll-out");
        scheduleNavratri(() => {
          amount.textContent = formatINR(from);
          amount.classList.remove("amount-roll-out");
          amount.classList.add("amount-roll-in");
          const start = performance.now();
          const frame = now => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = progress < .5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            amount.textContent = formatINR(from + (to - from) * eased);
            if (progress < 1) {
              navratriFrame = window.requestAnimationFrame(frame);
            } else {
              amount.textContent = formatINR(to);
              amount.classList.remove("amount-roll-in");
              navratriFrame = null;
              callback?.();
            }
          };
          navratriFrame = window.requestAnimationFrame(frame);
        }, 160);
      };
      const moveCardsBehind = () => {
        cards.forEach((card, index) => {
          card.classList.remove("from-background", "hidden", "depth-front", "depth-back");
          card.style.transitionDelay = `${index * 18}ms`;
          card.classList.add("to-background");
        });
      };
      const bringCardsForward = () => {
        cards.forEach((card, index) => {
          card.classList.remove("to-background", "hidden", "depth-back");
          card.style.transitionDelay = `${index * 12}ms`;
          card.classList.add("from-background");
        });
        scheduleNavratri(() => {
          cards.forEach(card => {
            card.classList.remove("from-background");
            card.style.transitionDelay = "";
          });
        }, 950);
      };
      startNavratriAnimation = () => {
        resetNavratriAnimation();
        scheduleNavratri(moveCardsBehind, 250);
        scheduleNavratri(() => {
          setSingleState();
          smoothCount(existingTotal, singleEmi, 850);
        }, 1350);
        scheduleNavratri(() => {
          smoothCount(singleEmi, existingTotal, 750, setExistingState);
          bringCardsForward();
        }, 3550);
      };

      amount.textContent = formatINR(existingTotal);
    }

    const scheduleHeroRotation = () => {
      window.clearTimeout(heroRotationTimer);
      const dwellTime = activeSlideIndex === 1 ? 10000 : 5000;
      heroRotationTimer = window.setTimeout(() => {
        showSlide(activeSlideIndex + 1);
      }, dwellTime);
    };

    const showSlide = index => {
      if (!heroSlides.length) return;
      if (activeSlideIndex === 1 && index % heroSlides.length !== 1) {
        stopNavratriAnimation();
      }
      activeSlideIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeSlideIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        slide.inert = !isActive;
      });
      heroDots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeSlideIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-pressed", String(isActive));
      });
      if (activeSlideIndex === 1 && navratriHero) {
        startNavratriAnimation();
      }
      scheduleHeroRotation();
    };

    heroDots.forEach(dot => {
      dot.addEventListener("click", () => {
        showSlide(Number(dot.dataset.heroGo));
      });
    });
    scheduleHeroRotation();
  }

  // Particle field
  const particleWrap = document.getElementById("particles");
  for(let i=0;i<42;i++){
    const p = document.createElement("span");
    p.className = "particle";
    p.style.left = Math.random()*100 + "%";
    p.style.top = (45 + Math.random()*55) + "%";
    p.style.animationDuration = (7 + Math.random()*10) + "s";
    p.style.animationDelay = (-Math.random()*10) + "s";
    particleWrap.appendChild(p);
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  // Loan inquiry popup: open on every page load/refresh.
  const inquiryModal = document.getElementById("inquiryModal");
  const inquiryForm = document.getElementById("inquiryForm");
  const inquiryClose = document.getElementById("inquiryClose");
  const inquiryOverlay = document.querySelector("[data-close-inquiry]");

  if(inquiryModal && inquiryForm && inquiryClose && inquiryOverlay){
  const openInquiry = () => {
    inquiryModal.classList.add("show");
    inquiryModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => document.getElementById("inqName")?.focus(), 250);
  };

  const closeInquiry = () => {
    inquiryModal.classList.remove("show");
    inquiryModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  // A tiny delay makes the popup feel intentional after the page starts loading.
  setTimeout(openInquiry, 900);

  inquiryClose.addEventListener("click", closeInquiry);
  inquiryOverlay.addEventListener("click", closeInquiry);
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && inquiryModal.classList.contains("show")) closeInquiry();
  });

  inquiryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fields = {
      name: document.getElementById("inqName"),
      contact: document.getElementById("inqContact"),
      city: document.getElementById("inqCity"),
      amount: document.getElementById("inqAmount"),
      incomeSource: document.getElementById("inqIncomeSource")
    };
    const errors = {
      name: document.getElementById("nameError"),
      contact: document.getElementById("contactError"),
      city: document.getElementById("cityError"),
      amount: document.getElementById("amountError"),
      incomeSource: document.getElementById("incomeSourceError")
    };

    Object.values(errors).forEach(el => el.textContent = "");
    Object.values(fields).forEach(el => el.style.borderColor = "");

    let valid = true;
    if(!fields.name.value.trim()){ errors.name.textContent = "Please enter your name."; valid = false; }
    const contact = fields.contact.value.replace(/\D/g, "");
    if(!/^[6-9]\d{9}$/.test(contact)){
      errors.contact.textContent = "Please enter a valid 10-digit contact number."; valid = false;
    }
    if(!fields.city.value.trim()){ errors.city.textContent = "Please enter your city."; valid = false; }
    if(!fields.amount.value || Number(fields.amount.value) <= 0){
      errors.amount.textContent = "Please enter a valid required amount."; valid = false;
    }
    if(!fields.incomeSource.value){
      errors.incomeSource.textContent = "Please select your income source."; valid = false;
    }
    if(!valid) return;

    const amount = Number(fields.amount.value).toLocaleString("en-IN");
    const message =
`*FORTUNE LOAN SERVICES - NEW INQUIRY*

Name: ${fields.name.value.trim()}
Contact: ${contact}
City: ${fields.city.value.trim()}
Required Amount: ₹${amount}
Income Source: ${fields.incomeSource.value}

Website Inquiry
Please contact this lead regarding suitable loan options.`;

    // WhatsApp destination: Fortune Loan Services contact number.
    const whatsappNumber = "919028346900";
    const waUrl = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);

    window.open(waUrl, "_blank", "noopener,noreferrer");
    closeInquiry();
  });
  }

});