document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const header = document.getElementById("header");
  const progressBar = document.getElementById("progressBar");
  const backTop = document.getElementById("backTop");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = "0";
      preloader.style.pointerEvents = "none";
      setTimeout(() => preloader.remove(), 650);
    }, 700);
  }

  // Mobile navigation
  if(menuToggle && navLinks){
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open);
    menuToggle.querySelectorAll("span")[0].style.transform = open ? "translateY(7px) rotate(45deg)" : "";
    menuToggle.querySelectorAll("span")[1].style.opacity = open ? "0" : "1";
    menuToggle.querySelectorAll("span")[2].style.transform = open ? "translateY(-7px) rotate(-45deg)" : "";
  });
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelectorAll("span")[0].style.transform = "";
    menuToggle.querySelectorAll("span")[1].style.opacity = "1";
    menuToggle.querySelectorAll("span")[2].style.transform = "";
  }));
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

  // Loan category filter — scope to the product grid (not decorative hero cards).
  const filters = document.querySelectorAll(".product-filters .filter");
  const productGrid = document.getElementById("loanGrid");
  const productCards = productGrid ? Array.from(productGrid.querySelectorAll(".product-card")) : [];
  const productCounts = {};
  ["all", "individual", "business", "property", "specialized"].forEach(category => {
    productCounts[category] = category === "all" ? productCards.length : productCards.filter(card => card.dataset.category === category).length;
    document.querySelectorAll(`[data-filter-count="${category}"]`).forEach(el => el.textContent = productCounts[category]);
  });
  const applyProductFilter = category => {
    if (!productGrid) return;
    filters.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    productCards.forEach((card, index) => {
      const visible = category === "all" || card.dataset.category === category;
      card.hidden = !visible;
      card.classList.toggle("filter-enter", visible);
      if (visible) card.style.animationDelay = `${Math.min(index % 4, 3) * 35}ms`;
    });
  };
  filters.forEach(button => button.addEventListener("click", () => applyProductFilter(button.dataset.filter)));
  if (filters.length) applyProductFilter(document.querySelector(".product-filters .filter.active")?.dataset.filter || "all");

  // Accessible viewport-triggered process timeline.
  const processSection = document.querySelector("#process");
  if (processSection) {
    const activateProcess = () => processSection.classList.add("process-animated");
    if ("IntersectionObserver" in window) {
      const processObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          activateProcess();
          processObserver.disconnect();
        }
      }, { threshold: 0.25 });
      processObserver.observe(processSection);
    } else activateProcess();
  }

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

  // Homepage hero carousel (rotation is enabled only when multiple slides exist).
  const heroCarousel = document.getElementById("heroSlides");
  if (heroCarousel) {
    const heroSlides = Array.from(heroCarousel.querySelectorAll("[data-hero-slide]"));
    const heroDots = Array.from(document.querySelectorAll("[data-hero-go]"));
    const navratriHero = heroCarousel.querySelector(".navratri-hero");
    const cityCards = Array.from(heroCarousel.querySelectorAll(".city-preview-card"));
    let cityRotationTimer = null;
    let activeCityIndex = 0;
    const showCity = index => {
      if (!cityCards.length) return;
      // Strict source-order cycle: each of the 18 city cards appears once, then the cycle restarts at city 1.
      activeCityIndex = ((index % cityCards.length) + cityCards.length) % cityCards.length;
      cityCards.forEach((card, cardIndex) => {
        const active = cardIndex === activeCityIndex;
        card.classList.toggle("is-city-active", active);
        card.setAttribute("aria-hidden", String(!active));
        card.style.zIndex = active ? "2" : "0";
        const image = card.querySelector("img");
        if (image) {
          image.loading = "eager";
          image.decoding = "async";
          image.onerror = () => {
            image.style.display = "none";
            const stage = image.parentElement;
            if (stage) {
              stage.style.background = "linear-gradient(135deg,#eef3f9,#dce6f3)";
              stage.dataset.imageFallback = `${image.alt || "City"} image unavailable`;
            }
          };
        }
      });
    };
    const startCityRotation = () => {
      window.clearInterval(cityRotationTimer);
      showCity(0);
      cityRotationTimer = window.setInterval(() => showCity(activeCityIndex + 1), 3000);
    };
    const stopCityRotation = () => {
      window.clearInterval(cityRotationTimer);
      cityRotationTimer = null;
    };
    let startNavratriAnimation = () => {};
    let stopNavratriAnimation = () => {};
    let activeSlideIndex = heroSlides.findIndex(slide => slide.classList.contains("is-active"));
    let navratriTimers = [];
    let navratriFrame = null;
    let heroRotationTimer = null;

    if (activeSlideIndex < 0) activeSlideIndex = 0;

    if (navratriHero && navratriHero.querySelector(".loan-card") && navratriHero.querySelector("[data-navratri-amount]")) {
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
      if (heroSlides.length < 2) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Requested rhythm: Hero 1 = 10 seconds, Hero 2 city network = 54 seconds, Hero 3 Diwali = 6 seconds.
      const dwellTimes = [10000, 54000, 10000];
      const dwellTime = dwellTimes[activeSlideIndex] ?? 10000;
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
      if (activeSlideIndex === 1 && cityCards.length) startCityRotation();
      else stopCityRotation();
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
  if (particleWrap) {
    for(let i=0;i<42;i++){
      const p = document.createElement("span");
      p.className = "particle";
      p.style.left = Math.random()*100 + "%";
      p.style.top = (45 + Math.random()*55) + "%";
      p.style.animationDuration = (7 + Math.random()*10) + "s";
      p.style.animationDelay = (-Math.random()*10) + "s";
      particleWrap.appendChild(p);
    }
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Homepage-only loan inquiry popup: opens compact; expand only when name field is clicked.
  const inquiryModal = document.getElementById("inquiryModal");
  const inquiryForm = document.getElementById("inquiryForm");
  const dateOfBirthInput = document.getElementById("inqDateOfBirth");
  if (dateOfBirthInput) dateOfBirthInput.max = new Date().toISOString().slice(0, 10);
  // Show only the applicant's selected income-source section and relevant conditional fields.
  const incomeSourceSelect = document.getElementById("inqIncomeSource");
  const businessFields = document.getElementById("businessFields");
  const salariedFields = document.getElementById("salariedFields");
  const setSectionVisibility = (section, visible) => {
    if (!section) return;
    section.hidden = !visible;
    section.querySelectorAll("[data-required-when-visible]").forEach(field => {
      field.required = visible && !field.closest("[hidden]");
      if (!field.required) field.removeAttribute("aria-invalid");
    });
  };
  const toggleConditional = (wrap, visible) => {
    if (!wrap) return;
    wrap.hidden = !visible;
    wrap.querySelectorAll("[data-required-when-visible]").forEach(field => {
      field.required = visible && !field.closest("[hidden]");
      if (!field.required) field.removeAttribute("aria-invalid");
    });
  };

  // Business-category-specific statutory licence fields.
  const businessNatureSelect = document.getElementById("inqBusinessNature");
  const drugLicenceSelect = document.getElementById("inqDrugLicence");
  const fssaiSelect = document.getElementById("inqFssai");
  const updateBusinessLicences = () => {
    const nature = businessNatureSelect?.value || "";
    const drug = /medical|pharmacy|drug|pharmaceutical/i.test(nature);
    const food = /food/i.test(nature);
    // Medical / Pharmacy categories require both Drug Licence and FSSAI prompts;
    // Food Business requires only FSSAI. Each number appears only when its answer is Yes.
    const showFssai = food || drug;
    toggleConditional(document.getElementById("inqDrugLicenceWrap"), drug);
    toggleConditional(document.getElementById("inqDrugLicenceNumberWrap"), drug && drugLicenceSelect?.value === "Yes");
    toggleConditional(document.getElementById("inqFssaiWrap"), showFssai);
    toggleConditional(document.getElementById("inqFssaiNumberWrap"), showFssai && fssaiSelect?.value === "Yes");
    if (!drug) { if (drugLicenceSelect) drugLicenceSelect.value = ""; const n=document.getElementById("inqDrugLicenceNumber"); if(n)n.value=""; }
    if (!showFssai) { if (fssaiSelect) fssaiSelect.value = ""; const n=document.getElementById("inqFssaiNumber"); if(n)n.value=""; }
  };
  businessNatureSelect?.addEventListener("change", updateBusinessLicences);
  drugLicenceSelect?.addEventListener("change", updateBusinessLicences);
  fssaiSelect?.addEventListener("change", updateBusinessLicences);
  updateBusinessLicences();
  // Add-on credit-history questions appear only when an existing loan is reported.
  ["inqBusinessExistingLoan", "inqSalaryExistingLoan"].forEach(id => {
    const sel = document.getElementById(id);
    const prefix = id === "inqBusinessExistingLoan" ? "inqBusinessExistingEmi" : "inqSalaryExistingEmi";
    const update = () => {
      const show = sel?.value === "Yes";
      toggleConditional(document.getElementById(prefix + "BouncedWrap"), show);
      const recentWrap = document.getElementById(prefix + "RecentApply")?.closest(".form-field");
      toggleConditional(recentWrap, show);
      if (!show) { const a=document.getElementById(prefix+"Bounced"); const b=document.getElementById(prefix+"RecentApply"); if(a)a.value=""; if(b)b.value=""; }
    };
    sel?.addEventListener("change", update); update();
  });
  const refreshIncomeSections = () => {
    const source = incomeSourceSelect?.value;
    setSectionVisibility(businessFields, source === "Business Owner / Self Employed");
    setSectionVisibility(salariedFields, source === "Salaried Person");
  };
  incomeSourceSelect?.addEventListener("change", refreshIncomeSections);
  const loanTypeSelect = document.getElementById("inqLoanType");
  const loanTypeOtherWrap = document.getElementById("inqLoanTypeOtherWrap");
  loanTypeSelect?.addEventListener("change", event => {
    toggleConditional(loanTypeOtherWrap, event.target.value === "Other");
  });

  document.getElementById("inqGstRegistered")?.addEventListener("change", event => {
    const yes = event.target.value === "Yes";
    toggleConditional(document.getElementById("gstNumberWrap"), yes);
  });
  const udyamSelect = document.getElementById("inqUdyamRegistered");
  const updateUdyamNumber = () => {
    const yes = udyamSelect?.value === "Yes";
    toggleConditional(document.getElementById("udyamNumberWrap"), yes);
  };
  udyamSelect?.addEventListener("change", updateUdyamNumber);
  updateUdyamNumber();
  const tradeLicenceSelect = document.getElementById("inqTradeLicence");
  const updateTradeLicenceNumber = () => {
    const yes = tradeLicenceSelect?.value === "Yes";
    toggleConditional(document.getElementById("tradeLicenceNumberWrap"), yes);
  };
  tradeLicenceSelect?.addEventListener("change", updateTradeLicenceNumber);
  updateTradeLicenceNumber();
  document.getElementById("inqBusinessExistingLoan")?.addEventListener("change", event => {
    document.querySelectorAll(".existing-business-loan").forEach(wrap => toggleConditional(wrap, event.target.value === "Yes"));
  });
  document.getElementById("inqSalaryExistingLoan")?.addEventListener("change", event => {
    document.querySelectorAll(".existing-salary-loan").forEach(wrap => toggleConditional(wrap, event.target.value === "Yes"));
  });
  document.getElementById("inqSalaryCreditMode")?.addEventListener("change", event => {
    const bankNameNeeded = ["Bank Transfer", "UPI"].includes(event.target.value);
    toggleConditional(document.getElementById("salaryCreditedBankWrap"), bankNameNeeded);
  });
  refreshIncomeSections();
  const inquiryClose = document.getElementById("inquiryClose");
  const inquiryOverlay = document.querySelector("[data-close-inquiry]");
  const whatsappNumber = "919028346900";
  const openWhatsApp = (message, status) => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    const popup = window.open(url, "_blank");
    if (popup) {
      popup.opener = null;
      status.textContent = "WhatsApp opened with your message ready. Review it and choose whether to send.";
      return true;
    }
    status.replaceChildren(
      document.createTextNode("Your browser blocked the WhatsApp window. "),
      Object.assign(document.createElement("a"), {
        href: url,
        target: "_blank",
        rel: "noopener noreferrer",
        textContent: "Open your prepared message"
      })
    );
    return false;
  };

  if(inquiryModal && inquiryForm && inquiryClose && inquiryOverlay){
  let previousFocus = null;
  const focusableSelector = "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
  const openInquiry = () => {
    previousFocus = document.activeElement;
    inquiryModal.classList.add("show");
    inquiryModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    // Keep the compact name prompt visible; do not force-focus or expand the form.
  };

  const closeInquiry = () => {
    inquiryModal.classList.remove("show");
    inquiryModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  };
  // Allow the isolated Diwali hero iframe to open the existing inquiry form.
  window.addEventListener("message", event => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === "fortune-diwali-apply") {
      resetInquiryForNewApplication();
      openInquiry();
    }
  });

  // Keep the existing homepage popup as the single loan application form.
  // A direct hash link opens it immediately; normal homepage visits retain the original auto-open.
  const isHomePage = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/");
  if (isHomePage) {
    if (window.location.hash === "#open-loan-form") {
      setTimeout(openInquiry, 120);
    } else {
      setTimeout(openInquiry, 900);
    }
  }
  const resetInquiryForNewApplication = () => {
    if (inquiryForm.classList.contains("is-submitted")) {
      inquiryForm.classList.remove("is-submitted");
      inquiryForm.reset();
      const status = document.getElementById("inquiryStatus");
      if (status) {
        status.classList.remove("inquiry-confirmation");
        status.replaceChildren();
      }
      refreshIncomeSections();
      toggleConditional(loanTypeOtherWrap, false);
      toggleConditional(document.getElementById("gstNumberWrap"), false);
      toggleConditional(document.getElementById("udyamNumberWrap"), false);
      toggleConditional(document.getElementById("tradeLicenceNumberWrap"), false);
      document.querySelectorAll(".existing-business-loan, .existing-salary-loan").forEach(wrap => toggleConditional(wrap, false));
    }
  };
  document.querySelectorAll('[data-open-inquiry], a[href="#open-loan-form"]').forEach(trigger => {
    trigger.addEventListener("click", event => {
      event.preventDefault();
      resetInquiryForNewApplication();
      openInquiry();
    });
  });
  const inquiryBox = inquiryModal.querySelector(".inquiry-box");
  const nameInput = document.getElementById("inqName");
  const expandInquiry = () => { inquiryBox?.classList.remove("is-compact"); };
  nameInput?.addEventListener("focus", expandInquiry);
  nameInput?.addEventListener("click", expandInquiry);

  inquiryClose.addEventListener("click", closeInquiry);
  inquiryOverlay.addEventListener("click", closeInquiry);
  document.addEventListener("keydown", (e) => {
    if (!inquiryModal.classList.contains("show")) return;
    if (e.key === "Escape") {
      closeInquiry();
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = Array.from(inquiryModal.querySelectorAll(focusableSelector))
      .filter(element => element.getClientRects().length);
    if (!focusable.length) {
      e.preventDefault();
      inquiryModal.querySelector(".inquiry-box")?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  inquiryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const status = document.getElementById("inquiryStatus");
    status.textContent = "";
    const activeFields = Array.from(inquiryForm.querySelectorAll("input, select, textarea")).filter(field => !field.closest("[hidden]"));
    activeFields.forEach(field => field.setCustomValidity(""));
    let valid = true;
    activeFields.forEach(field => {
      field.removeAttribute("aria-invalid");
      if (!field.checkValidity()) {
        field.setAttribute("aria-invalid", "true");
        valid = false;
      }
    });
    const contact = document.getElementById("inqContact");
    const pin = document.getElementById("inqPin");
    const aadhaar = document.getElementById("inqAadhaar");
    const pan = document.getElementById("inqPan");
    const businessPin = document.getElementById("inqBusinessPin");
    const setError = (field, message) => {
      field.setCustomValidity(message);
      if (message) { field.setAttribute("aria-invalid", "true"); valid = false; }
    };
    [contact, pin, aadhaar, pan, businessPin].filter(Boolean).forEach(field => field.setCustomValidity(""));
    if (!/^\d{10}$/.test(contact.value.trim())) setError(contact, "Enter a valid 10-digit contact number.");
    ["inqRef1Contact", "inqRef2Contact"].forEach(id => {
      const referencePhone = document.getElementById(id);
      if (referencePhone && !/^\d{10}$/.test(referencePhone.value.trim())) setError(referencePhone, "Enter a valid 10-digit reference contact number.");
    });
    // Reference numbers must be valid and must not duplicate the applicant number or each other.
    const primaryNumber = contact?.value.trim();
    const ref1Number = document.getElementById("inqRef1Contact")?.value.trim();
    const ref2Number = document.getElementById("inqRef2Contact")?.value.trim();
    if (ref1Number && primaryNumber && ref1Number === primaryNumber) setError(document.getElementById("inqRef1Contact"), "Reference contact number must be different from the applicant contact number.");
    if (ref2Number && primaryNumber && ref2Number === primaryNumber) setError(document.getElementById("inqRef2Contact"), "Reference contact number must be different from the applicant contact number.");
    if (ref1Number && ref2Number && ref1Number === ref2Number) setError(document.getElementById("inqRef2Contact"), "Reference 1 and Reference 2 must have different contact numbers.");
    ["inqRef1Relation", "inqRef2Relation"].forEach(id => {
      const relation = document.getElementById(id);
      if (relation && /\b(family|family member|relative|mother|father|brother|sister|wife|husband|son|daughter|uncle|aunt|cousin|parent|sibling)\b/i.test(relation.value.trim())) setError(relation, "Please provide a non-family reference (for example, friend or colleague).");
    });
    if (!/^\d{6}$/.test(pin.value.trim())) setError(pin, "Enter a valid 6-digit PIN code.");
    if (!/^\d{12}$/.test(aadhaar.value.trim())) setError(aadhaar, "Enter a valid 12-digit Aadhaar number.");
    if (!/^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(pan.value.trim())) setError(pan, "Enter a valid PAN, for example ABCDE1234F.");
    if (businessPin && !businessPin.closest("[hidden]") && businessPin.value.trim() && !/^\d{6}$/.test(businessPin.value.trim())) setError(businessPin, "Enter a valid 6-digit business PIN code.");
    const officePin = document.getElementById("inqOfficePin");
    if (officePin && officePin.value.trim() && !/^\d{6}$/.test(officePin.value.trim())) setError(officePin, "Enter a valid 6-digit office PIN code.");
    if (!valid) {
      const firstInvalid = inquiryForm.querySelector('[aria-invalid="true"]:not([hidden])');
      firstInvalid?.reportValidity();
      firstInvalid?.focus();
      return;
    }
    const value = id => document.getElementById(id)?.value?.trim() || "Not provided";
    const formatAmount = id => {
      const raw = document.getElementById(id)?.value;
      return raw !== undefined && raw !== "" ? "₹" + Number(raw).toLocaleString("en-IN") : "Not provided";
    };
    const stateEmployeeMap = {
      // AMOL KINIKAR
      "Madhya Pradesh": "AMOL KINIKAR", "Rajasthan": "AMOL KINIKAR", "Gujarat": "AMOL KINIKAR", "Bihar": "AMOL KINIKAR", "Andhra Pradesh": "AMOL KINIKAR",
      // KAUSHAL MARATHE
      "Maharashtra": "KAUSHAL MARATHE", "Uttar Pradesh": "KAUSHAL MARATHE", "Tamil Nadu": "KAUSHAL MARATHE", "West Bengal": "KAUSHAL MARATHE", "Karnataka": "KAUSHAL MARATHE",
      // DILIP KHANDAGALE
      "Telangana": "DILIP KHANDAGALE", "Odisha": "DILIP KHANDAGALE", "Punjab": "DILIP KHANDAGALE", "Haryana": "DILIP KHANDAGALE", "Kerala": "DILIP KHANDAGALE",
      // MUBARAK HUSSAIN
      "Jharkhand": "MUBARAK HUSSAIN", "Assam": "MUBARAK HUSSAIN", "Delhi": "MUBARAK HUSSAIN", "Chhattisgarh": "MUBARAK HUSSAIN", "Uttarakhand": "MUBARAK HUSSAIN",
      // SAKSHI BHOKARE
      "Himachal Pradesh": "SAKSHI BHOKARE", "Goa": "SAKSHI BHOKARE", "Chandigarh": "SAKSHI BHOKARE", "Arunachal Pradesh": "SAKSHI BHOKARE", "Dadra and Nagar Haveli and Daman and Diu": "SAKSHI BHOKARE"
    };
    const assignedEmployee = stateEmployeeMap[value("inqState")] || "AMOL KINIKAR";
    const lines = [
      "*FORTUNE LOAN SERVICES - NEW INQUIRY*", "",
      `*NAME:* *${value("inqName")}*`,
      `Date of Birth: ${value("inqDateOfBirth")}`,
      `Contact Number: ${value("inqContact")}`,
      `Email: ${value("inqEmail")}`,
      `City: ${value("inqCity")}`,
      `Residence PIN Code: ${value("inqPin")}`,
      `State / UT: ${value("inqState")}`,
      `Reference 1 Name: ${value("inqRef1Name")}`,
      `Reference 1 Contact Number: ${value("inqRef1Contact")}`,
      `Reference 1 Relationship: ${value("inqRef1Relation")}`,
      `Reference 2 Name: ${value("inqRef2Name")}`,
      `Reference 2 Contact Number: ${value("inqRef2Contact")}`,
      `Reference 2 Relationship: ${value("inqRef2Relation")}`,
      `Assigned Loan Expert: ${assignedEmployee}`,
      // Never place full Aadhaar/PAN identifiers in a WhatsApp URL. The applicant can share these securely later if required.
      `Aadhaar Number: ${value("inqAadhaar")}`,
      `PAN Number: ${value("inqPan").toUpperCase()}`,
      `CIBIL Score: ${value("inqCibil")}`,
      `Required Loan Amount: ${formatAmount("inqAmount")}`,
      `Type of Loan: ${value("inqLoanType") === "Other" ? value("inqLoanTypeOther") : value("inqLoanType")}`,
      `Purpose of Loan: ${value("inqPurpose")}`,
      `Income Source: ${value("inqIncomeSource")}`,
      `Interested in Referral Program: ${value("inqReferralInterest")}`
    ];
    if (value("inqIncomeSource") === "Business Owner / Self Employed") {
      lines.push("", "*BUSINESS / SELF-EMPLOYED DETAILS*",
        `Business / Company Name: ${value("inqBusinessName")}`,
        `Nature of Business: ${value("inqBusinessNature")}`,
        `Business Constitution: ${value("inqBusinessConstitution")}`,
        `Business Address: ${value("inqBusinessAddress")}`,
        `Business City: ${value("inqBusinessCity")}`,
        `Business PIN Code: ${value("inqBusinessPin")}`,
        `Business Vintage: ${value("inqBusinessVintage")}`,
        `GST Registration: ${value("inqGstRegistered")}`,
        `GST Number: ${value("inqGstRegistered") === "Yes" ? value("inqGstNumber") : "Not applicable"}`,
        `Udyam / MSME Registration: ${value("inqUdyamRegistered")}`,
        `Udyam Number: ${value("inqUdyamRegistered") === "Yes" ? value("inqUdyamNumber") : "Not applicable"}`,
        `Trade Licence: ${value("inqTradeLicence")}`,
        ...(value("inqTradeLicence") === "Yes" ? [`Trade Licence Number: ${value("inqTradeLicenceNumber")}`] : []),
        `Average Monthly Business Income / Profit: ${formatAmount("inqBusinessIncome")}`,
        `Existing Loan: ${value("inqBusinessExistingLoan")}`,
        `Bank A/c Type: ${Array.from(inquiryForm.querySelectorAll('input[name="businessBankAccountType"]:checked')).map(input => input.value).join(", ") || "Not selected"}`);
      if (value("inqBusinessExistingLoan") === "Yes") lines.push(`Existing Loan Amount: ${formatAmount("inqBusinessExistingLoanAmount")}`, `Existing Monthly EMI: ${formatAmount("inqBusinessExistingEmi")}`, `Any EMI bounced in last 3 months: ${value("inqBusinessExistingEmiBounced")}`, `Recently applied for any loan: ${value("inqBusinessExistingEmiRecentApply")}`);
      if (/medical|pharmacy|drug|pharmaceutical/i.test(value("inqBusinessNature"))) { lines.push(`Drug / Pharmacy Licence Available: ${value("inqDrugLicence")}`); if(value("inqDrugLicence")==="Yes") lines.push(`Drug / Pharmacy Licence Number: ${value("inqDrugLicenceNumber")}`); }
      if (/food|medical|pharmacy|drug|pharmaceutical/i.test(value("inqBusinessNature"))) { lines.push(`FSSAI Licence Available: ${value("inqFssai")}`); if(value("inqFssai")==="Yes") lines.push(`FSSAI Licence Number: ${value("inqFssaiNumber")}`); }
    } else if (value("inqIncomeSource") === "Salaried Person") {
      lines.push("", "*SALARIED PERSON DETAILS*",
        `Employment Type: ${value("inqEmploymentType")}`,
        `Company / Employer Name: ${value("inqEmployerName")}`,
        `Job Designation: ${value("inqJobDesignation")}`,
        `Work Experience: ${value("inqWorkExperience")}`,
        `Office City: ${value("inqOfficeCity")}`,
        ...(value("inqOfficePin") !== "Not provided" ? [`Office PIN Code: ${value("inqOfficePin")}`] : []),
        ...(value("inqOfficialEmail") !== "Not provided" ? [`Official Email ID: ${value("inqOfficialEmail")}`] : []),
        `Monthly In-Hand Salary: ${formatAmount("inqMonthlySalary")}`,
        `Salary Credit Mode: ${value("inqSalaryCreditMode")}`,
        ...(["Bank Transfer", "UPI"].includes(value("inqSalaryCreditMode")) ? [`Salary Account Bank Name: ${value("inqSalaryCreditedBankName")}`] : []),
        `Salary Account Statement Available: ${value("inqSalaryStatement")}`,
        `Salary / Payment Slip Available: ${value("inqSalaryPaymentSlipAvailable")}`,
        `Existing Loan: ${value("inqSalaryExistingLoan")}`);
      if (value("inqSalaryExistingLoan") === "Yes") lines.push(`Existing Loan Amount: ${formatAmount("inqSalaryExistingLoanAmount")}`, `Existing Monthly EMI: ${formatAmount("inqSalaryExistingEmi")}`, `Any EMI bounced in last 3 months: ${value("inqSalaryExistingEmiBounced")}`, `Recently applied for any loan: ${value("inqSalaryExistingEmiRecentApply")}`);
    }
    const message = lines.join("\n");
    status.classList.add("inquiry-confirmation");

    // Send the same submitted inquiry to FormSubmit as well as preparing WhatsApp.
    // Only fields in the currently visible form path are emailed, so hidden conditional
    // fields from the other employment path are not accidentally included.
    const emailPayload = {
      _subject: `New Fortune Loan Services Inquiry - ${value("inqName")}`,
      _template: "table"
    };
    activeFields.forEach(field => {
      if (!field.name || field.disabled || field.closest("[hidden]")) return;
      emailPayload[field.name] = field.value.trim();
    });
    emailPayload.assignedEmployee = assignedEmployee;
    emailPayload.inquiryMessage = message;
    const emailDelivery = fetch("https://formsubmit.co/ajax/loanservicesfortune@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(emailPayload)
    }).then(async response => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === "false" || result.success === false) {
        throw new Error(result.message || "FormSubmit could not accept the inquiry.");
      }
      return result;
    });

    const whatsappOpened = openWhatsApp(message, status);
    if (whatsappOpened) {
      // Keep the existing thank-you view; update the email line when FormSubmit responds.
      inquiryForm.classList.add("is-submitted");
      status.innerHTML = '<div class="inquiry-thankyou-icon" aria-hidden="true">✓</div><h2 class="inquiry-thankyou-title">🎉 Thank You for Your Submission!</h2><h3 class="inquiry-thankyou-lead">✅ Your Inquiry Has Been Submitted Successfully!</h3><p>Our team will review your details and contact you soon to discuss suitable loan options tailored to your needs.</p><p>🤝 Thank you for choosing Fortune Loan Services – Your Trusted Loan Partner!</p><p id="inquiryEmailStatus" role="status" aria-live="polite">Sending a copy of your inquiry to email…</p><button type="button" class="inquiry-submit inquiry-apply-again" id="inquiryApplyAgain"><span>Apply Now — Start a New Application</span><strong>↗</strong></button>';
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "assertive");
      emailDelivery.then(() => {
        const emailStatus = document.getElementById("inquiryEmailStatus");
        if (emailStatus) emailStatus.textContent = "FormSubmit accepted the email request. Delivery to the inbox is not guaranteed; please check Spam/All Mail if it does not arrive.";
      }).catch(error => {
        console.error("FormSubmit email delivery failed:", error);
        const emailStatus = document.getElementById("inquiryEmailStatus");
        emailStatus?.remove();
      });
      document.getElementById("inquiryApplyAgain")?.addEventListener("click", () => {
        resetInquiryForNewApplication();
        inquiryBox?.classList.remove("is-compact");
        document.getElementById("inqName")?.focus();
      });
    } else {
      emailDelivery.then(() => {
        status.textContent = "FormSubmit accepted the email request. Delivery to the inbox is not guaranteed; please check Spam/All Mail if it does not arrive.";
      }).catch(error => {
        console.error("FormSubmit email delivery failed:", error);
        status.textContent = "Your browser blocked WhatsApp and the email could not be confirmed. Please check FormSubmit setup and retry.";
      });
    }
  });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const mobile = document.getElementById("cfMobile");
    const status = document.getElementById("contactFormStatus");
    contactForm.addEventListener("submit", event => {
      event.preventDefault();
      const digits = mobile.value.replace(/\D/g, "");
      mobile.setCustomValidity(/^[6-9]\d{9}$/.test(digits) ? "" : "Enter a valid 10-digit Indian mobile number.");
      if (!contactForm.reportValidity()) return;
      const message = `*FORTUNE LOAN SERVICES - CONTACT ENQUIRY*\n\nName: ${document.getElementById("cfFirst").value.trim()} ${document.getElementById("cfLast").value.trim()}\nEmail: ${document.getElementById("cfEmail").value.trim()}\nMobile: ${digits}\nLoan Type: ${document.getElementById("cfLoanType")?.value || "Not specified"}\nRequired Amount: ${document.getElementById("cfAmount")?.value || "Not specified"}\nCIBIL Score: ${document.getElementById("cfCibil")?.value || "Not provided (optional)"}\nMonthly Income Range: ${document.getElementById("cfIncomeRange")?.value || "Not provided (optional)"}\nEmployment / Business Type: ${document.getElementById("cfSubject").value.trim() || "Not specified"}\nMessage: ${document.getElementById("cfMessage").value.trim()}`;
      openWhatsApp(message, status);
    });
    mobile.addEventListener("input", () => mobile.setCustomValidity(""));
  }

  const partnerForm = document.getElementById("partnerForm");
  if (partnerForm) {
    const mobile = document.getElementById("pfMobile");
    const pincode = document.getElementById("pfPin");
    const status = document.getElementById("partnerFormStatus");
    partnerForm.addEventListener("submit", event => {
      event.preventDefault();
      const digits = mobile.value.replace(/\D/g, "");
      mobile.setCustomValidity(/^[6-9]\d{9}$/.test(digits) ? "" : "Enter a valid 10-digit Indian mobile number.");
      pincode.setCustomValidity(/^\d{6}$/.test(pincode.value.trim()) ? "" : "Enter a valid 6-digit pincode.");
      if (!partnerForm.reportValidity()) return;
      const fields = [...partnerForm.querySelectorAll("input, select, textarea")].filter(el => el.name && el.type !== "submit" && el.type !== "button");
      const entries = fields.map(el => {
        const label = partnerForm.querySelector(`label[for="${el.id}"]`);
        return { name: el.name, label: (label?.innerText || el.name).replace(/\s*\*\s*$/, "").trim(), value: el.value.trim() };
      }).filter(item => item.value);
      const message = "*FORTUNE LOAN SERVICES - PARTNER REGISTRATION*\n\n" + entries.map(item => `*${item.label}:* ${item.value}`).join("\n");
      const emailPayload = { _subject: "New Fortune Loan Services - Partner Registration", _template: "table" };
      entries.forEach(item => { emailPayload[item.label] = item.value; });
      const emailDelivery = fetch("https://formsubmit.co/ajax/loanservicesfortune@gmail.com", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(emailPayload)
      }).then(async response => { const result = await response.json().catch(() => ({})); if (!response.ok || result.success === false || result.success === "false") throw new Error(result.message || "Email submission failed"); return result; });
      const opened = openWhatsApp(message, status);
      emailDelivery.then(() => { status.textContent = opened ? "WhatsApp is ready to send. FormSubmit accepted the email request; please check Spam/All Mail if the email does not arrive." : "FormSubmit accepted the email request. WhatsApp was blocked by your browser; use the prepared WhatsApp link if shown."; }).catch(error => { console.error("Partner registration email failed:", error); status.textContent = opened ? "WhatsApp is ready to send, but email could not be confirmed. Check FormSubmit setup and retry." : "Email could not be confirmed and WhatsApp was blocked. Please retry."; });
    });
    mobile.addEventListener("input", () => mobile.setCustomValidity(""));
    pincode.addEventListener("input", () => pincode.setCustomValidity(""));
  }

  const calculatorButton = document.getElementById("calcBtn");
  const calculatorResults = {
    emi: document.getElementById("emiValue"),
    principal: document.getElementById("principalValue"),
    interest: document.getElementById("interestValue"),
    repayment: document.getElementById("repaymentValue")
  };
  const calculatorError = document.getElementById("calculatorError");
  if (calculatorButton && Object.values(calculatorResults).every(Boolean) && calculatorError) {
    const amountInput = document.getElementById("loanAmount");
    const rateInput = document.getElementById("interestRate");
    const yearsInput = document.getElementById("loanYears");
    const amountRange = document.getElementById("loanAmountRange");
    const rateRange = document.getElementById("interestRateRange");
    const yearsRange = document.getElementById("loanYearsRange");
    const currency = value => "₹" + Math.round(value).toLocaleString("en-IN");
    const syncRange = (range, input) => {
      if (!range || !input) return;
      range.value = input.value;
      const min = Number(range.min), max = Number(range.max), value = Number(range.value);
      range.style.setProperty("--range-progress", `${max === min ? 0 : (value-min)/(max-min)*100}%`);
    };
    const calculateEmi = () => {
      calculatorError.textContent = "";
      const principal = Number(amountInput.value);
      const annualRate = Number(rateInput.value);
      const years = Number(yearsInput.value);
      if (!Number.isFinite(principal) || principal < 1000 || principal > 100000000 ||
          !Number.isFinite(annualRate) || annualRate < 0 || annualRate > 36 ||
          !Number.isFinite(years) || years < 1 || years > 40) {
        calculatorError.textContent = "Enter a loan amount between ₹1,000 and ₹10,00,00,000, a rate from 0% to 36%, and tenure from 1 to 40 years.";
        return;
      }
      syncRange(amountRange, amountInput); syncRange(rateRange, rateInput); syncRange(yearsRange, yearsInput);
      const monthlyRate = annualRate / 1200;
      const months = Math.round(years * 12);
      const factor = Math.pow(1 + monthlyRate, months);
      const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * factor / (factor - 1);
      if (!Number.isFinite(emi)) { calculatorError.textContent = "Unable to calculate. Please check the values."; return; }
      const repayment = emi * months;
      calculatorResults.emi.textContent = currency(emi);
      calculatorResults.principal.textContent = currency(principal);
      calculatorResults.interest.textContent = currency(Math.max(0, repayment - principal));
      calculatorResults.repayment.textContent = currency(repayment);
    };
    [[amountRange,amountInput],[rateRange,rateInput],[yearsRange,yearsInput]].forEach(([range,input]) => {
      if (range && input) range.addEventListener("input", () => { input.value = range.value; calculateEmi(); });
    });
    [amountInput,rateInput,yearsInput].forEach(input => input.addEventListener("input", calculateEmi));
    calculateEmi();
  }

});

// Monthly income is selected from optional dropdowns on both enquiry forms.
[ ["inqIncomeMin","inqIncomeMax","incomeMinLabel","incomeMaxLabel"], ["cfIncomeMin","cfIncomeMax","cfIncomeMinLabel","cfIncomeMaxLabel"] ].forEach(([minId,maxId,minLabel,maxLabel])=>{const min=document.getElementById(minId),max=document.getElementById(maxId),ml=document.getElementById(minLabel),xl=document.getElementById(maxLabel);if(!min||!max||!ml||!xl)return;const fmt=n=>Number(n).toLocaleString("en-IN");const update=(changed)=>{if(Number(min.value)>Number(max.value)){if(changed===min)max.value=min.value;else min.value=max.value;}ml.textContent=fmt(min.value);xl.textContent=fmt(max.value);};min.addEventListener("input",()=>update(min));max.addEventListener("input",()=>update(max));update();});


  // Expert contact popup: the phone CTA opens the device dialer.
  const expertModal = document.getElementById("expertModal");
  if (expertModal) {
    const openExpert = () => { expertModal.classList.add("show"); expertModal.setAttribute("aria-hidden", "false"); document.body.classList.add("expert-modal-open"); };
    const closeExpert = () => { expertModal.classList.remove("show"); expertModal.setAttribute("aria-hidden", "true"); document.body.classList.remove("expert-modal-open"); };
    document.querySelectorAll("[data-open-expert]").forEach(button => button.addEventListener("click", openExpert));
    expertModal.querySelectorAll("[data-close-expert]").forEach(button => button.addEventListener("click", closeExpert));
    document.addEventListener("keydown", event => { if (event.key === "Escape" && expertModal.classList.contains("show")) closeExpert(); });
  }
