(() => {
  const canvas = document.querySelector("#simCanvas");
  const panel = document.querySelector("#simulationPanel");
  const baselineButton = document.querySelector("#baselineButton");
  const peeringButton = document.querySelector("#peeringButton");
  const message = document.querySelector("#journeyMessage");
  const icon = document.querySelector("#stateIcon");
  const counter = document.querySelector("#packetCount");
  const heroVisual = document.querySelector(".hero-visual");
  const journeyTrack = document.querySelector(".journey-track");
  const heroState = document.querySelector("#heroPeerState");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const walkthroughButton = document.querySelector("#walkthroughButton");
  const walkthroughStatus = document.querySelector("#walkthroughStatus");
  const pipelineSteps = [...document.querySelectorAll(".pipeline-step")];
  let mode = "baseline";
  let count = 0;
  let visible = false;
  let timer = null;

  const updateCounter = () => {
    if (!visible) return;
    count = (count + 1) % 1000;
    counter.textContent = String(count).padStart(3, "0");
  };

  const setMode = (nextMode) => {
    mode = nextMode;
    canvas.dataset.mode = mode;
    baselineButton.classList.toggle("is-active", mode === "baseline");
    peeringButton.classList.toggle("is-active", mode === "peering");
    baselineButton.setAttribute("aria-pressed", String(mode === "baseline"));
    peeringButton.setAttribute("aria-pressed", String(mode === "peering"));
    const connected = mode === "peering";
    message.textContent = connected
      ? "Peering routes active — packets cross to VPC B."
      : "No peering route — packets stop at VPC A.";
    icon.textContent = connected ? "✓" : "×";
    heroVisual.classList.toggle("is-connected", connected);
    heroState.textContent = connected ? "ROUTES ACTIVE" : "ROUTES OFF";
    count = 0;
    counter.textContent = "000";
  };

  baselineButton.addEventListener("click", () => setMode("baseline"));
  peeringButton.addEventListener("click", () => setMode("peering"));

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    canvas.classList.toggle("animation-visible", visible);
    if (visible && !timer) timer = window.setInterval(updateCounter, 1400);
    if (!visible && timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }, { threshold: 0.2 });
  observer.observe(panel);

  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisual.classList.toggle("animation-visible", entry.isIntersecting);
  }, { threshold: 0.1 });
  heroObserver.observe(heroVisual);

  const setTrackDistance = () => {
    const travel = Math.max(0, journeyTrack.clientWidth - 6);
    journeyTrack.style.setProperty("--travel", `${travel}px`);
    journeyTrack.style.setProperty("--half-travel", `${travel / 2}px`);
  };
  setTrackDistance();
  new ResizeObserver(setTrackDistance).observe(journeyTrack);

  walkthroughButton.addEventListener("click", async () => {
    if (walkthroughButton.disabled) return;
    walkthroughButton.disabled = true;
    walkthroughButton.innerHTML = "<span aria-hidden=\"true\">●</span> Walking through stages";
    pipelineSteps.forEach((step) => step.classList.remove("is-walkthrough"));
    const stageNames = ["Source commit", "Terraform validation", "AWS plan"];
    for (let index = 0; index < stageNames.length; index += 1) {
      pipelineSteps[index].classList.add("is-walkthrough");
      walkthroughStatus.textContent = `Illustrative walkthrough: ${stageNames[index]}…`;
      await new Promise((resolve) => window.setTimeout(resolve, 850));
      if (index < stageNames.length - 1) pipelineSteps[index].classList.remove("is-walkthrough");
    }
    walkthroughStatus.textContent = "Walkthrough paused at Plan: AWS organization policy blocks the required EC2 lookups.";
    walkthroughButton.disabled = false;
    walkthroughButton.innerHTML = "<span aria-hidden=\"true\">↻</span> Replay pipeline walkthrough";
  });

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
})();
