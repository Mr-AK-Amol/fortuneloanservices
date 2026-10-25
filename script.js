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
  document.getElementById("inqUdyamRegistered")?.addEventListener("change", event => {
    const yes = event.target.value === "Yes";
    toggleConditional(document.getElementById("udyamNumberWrap"), yes);
  });
  document.getElementById("inqBusinessExistingLoan")?.addEventListener("change", event => {
    document.querySelectorAll(".existing-business-loan").forEach(wrap => toggleConditional(wrap, event.target.value === "Yes"));
  });
  document.getElementById("inqSalaryExistingLoan")?.addEventListener("change", event => {
    document.querySelectorAll(".existing-salary-loan").forEach(wrap => toggleConditional(wrap, event.target.value === "Yes"));
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
      document.querySelectorAll(".existing-business-loan, .existing-salary-loan").forEach(wrap => toggleConditional(wrap, false));
    }
  };
  document.querySelectorAll("[data-open-inquiry]").forEach(trigger => {
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
    if (!/^\d{6}$/.test(pin.value.trim())) setError(pin, "Enter a valid 6-digit PIN code.");
    if (!/^\d{12}$/.test(aadhaar.value.trim())) setError(aadhaar, "Enter a valid 12-digit Aadhaar number.");
    if (!/^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(pan.value.trim())) setError(pan, "Enter a valid PAN, for example ABCDE1234F.");
    if (businessPin && !businessPin.closest("[hidden]") && businessPin.value.trim() && !/^\d{6}$/.test(businessPin.value.trim())) setError(businessPin, "Enter a valid 6-digit business PIN code.");
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
    const lines = [
      "*FORTUNE LOAN SERVICES - NEW INQUIRY*", "",
      `Name: ${value("inqName")}`,
      `Contact Number: ${value("inqContact")}`,
      `Email: ${value("inqEmail")}`,
      `City: ${value("inqCity")}`,
      `PIN Code: ${value("inqPin")}`,
      `State / UT: ${value("inqState")}`,
      // Never place full Aadhaar/PAN identifiers in a WhatsApp URL. The applicant can share these securely later if required.
      `Aadhaar Number: ${value("inqAadhaar")}`,
      `PAN Number: ${value("inqPan").toUpperCase()}`,
      `CIBIL Score: ${value("inqCibil")}`,
      `Required Loan Amount: ${formatAmount("inqAmount")}`,
      `Type of Loan: ${value("inqLoanType") === "Other" ? value("inqLoanTypeOther") : value("inqLoanType")}`,
      `Purpose of Loan: ${value("inqPurpose")}`,
      `Income Source: ${value("inqIncomeSource")}`
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
        `Average Monthly Business Income / Profit: ${formatAmount("inqBusinessIncome")}`,
        `Existing Loan: ${value("inqBusinessExistingLoan")}`);
      if (value("inqBusinessExistingLoan") === "Yes") lines.push(`Existing Loan Amount: ${formatAmount("inqBusinessExistingLoanAmount")}`, `Existing Monthly EMI: ${formatAmount("inqBusinessExistingEmi")}`);
    } else if (value("inqIncomeSource") === "Salaried Person") {
      lines.push("", "*SALARIED PERSON DETAILS*",
        `Employment Type: ${value("inqEmploymentType")}`,
        `Company / Employer Name: ${value("inqEmployerName")}`,
        `Job Designation: ${value("inqJobDesignation")}`,
        `Work Experience: ${value("inqWorkExperience")}`,
        `Office City: ${value("inqOfficeCity")}`,
        `Monthly In-Hand Salary: ${formatAmount("inqMonthlySalary")}`,
        `Salary Credit Mode: ${value("inqSalaryCreditMode")}`,
        `Salary Account Statement Available: ${value("inqSalaryStatement")}`,
        `Existing Loan: ${value("inqSalaryExistingLoan")}`);
      if (value("inqSalaryExistingLoan") === "Yes") lines.push(`Existing Loan Amount: ${formatAmount("inqSalaryExistingLoanAmount")}`, `Existing Monthly EMI: ${formatAmount("inqSalaryExistingEmi")}`);
    }

    const message = lines.join("\n");
    status.classList.add("inquiry-confirmation");
    const whatsappOpened = openWhatsApp(message, status);
    if (whatsappOpened) {
      // Replace the fields with the requested greeting and an option to start a fresh application.
      inquiryForm.classList.add("is-submitted");
      status.innerHTML = '<div class="inquiry-thankyou-icon" aria-hidden="true">✓</div><h3 class="inquiry-thankyou-title">🎉 Thank You for Your Submission!</h3><p class="inquiry-thankyou-lead">Your Loan Application Has Been Submitted Successfully.</p><p>Our team will review your details and contact you soon to discuss suitable loan options.</p><p class="inquiry-thankyou-brand"><strong>Fortune Loan Services</strong><br>Your Trusted Loan Partner</p><button type="button" class="inquiry-submit inquiry-apply-again" id="inquiryApplyAgain"><span>Apply Now — Start a New Application</span><strong>↗</strong></button>';
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "assertive");
      document.getElementById("inquiryApplyAgain")?.addEventListener("click", () => {
        resetInquiryForNewApplication();
        inquiryBox?.classList.remove("is-compact");
        document.getElementById("inqName")?.focus();
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
      const message = `*FORTUNE LOAN SERVICES - PARTNER REGISTRATION*\n\nName: ${document.getElementById("pfName").value.trim()}\nMobile: ${digits}\nEmail: ${document.getElementById("pfEmail").value.trim()}\nState: ${document.getElementById("pfState").value.trim()}\nCity: ${document.getElementById("pfCity").value.trim()}\nPincode: ${pincode.value.trim()}\nPreferred Loan: ${document.getElementById("pfLoan").value.trim()}\nProfessional Experience: ${document.getElementById("pfExp").value.trim() || "Not provided"}\nCompany: ${document.getElementById("pfCompany")?.value.trim() || "Not provided"}\nPartnership Type: ${document.getElementById("pfType")?.value || "Not specified"}\nBusiness Details: ${document.getElementById("pfMessage")?.value.trim() || "Not provided"}`;
      openWhatsApp(message, status);
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
    if (calculatorButton) calculatorButton.addEventListener("click", calculateEmi);
    calculateEmi();
  }

});

// Monthly income is selected from optional dropdowns on both enquiry forms.
[ ["inqIncomeMin","inqIncomeMax","incomeMinLabel","incomeMaxLabel"], ["cfIncomeMin","cfIncomeMax","cfIncomeMinLabel","cfIncomeMaxLabel"] ].forEach(([minId,maxId,minLabel,maxLabel])=>{const min=document.getElementById(minId),max=document.getElementById(maxId),ml=document.getElementById(minLabel),xl=document.getElementById(maxLabel);if(!min||!max||!ml||!xl)return;const fmt=n=>Number(n).toLocaleString("en-IN");const update=(changed)=>{if(Number(min.value)>Number(max.value)){if(changed===min)max.value=min.value;else min.value=max.value;}ml.textContent=fmt(min.value);xl.textContent=fmt(max.value);};min.addEventListener("input",()=>update(min));max.addEventListener("input",()=>update(max));update();});
