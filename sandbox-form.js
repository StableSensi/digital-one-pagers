(function () {
  const form = document.getElementById("sandboxForm");

  if (!form) {
    return;
  }

  const steps = Array.from(form.querySelectorAll(".form-step"));
  const stepText = document.getElementById("stepText");
  const stepTitle = document.getElementById("sandbox-form-title");
  const stepBars = Array.from(document.querySelectorAll(".step-track span"));
  const backButton = document.getElementById("backStep");
  const nextButton = document.getElementById("nextStep");
  const submitButton = document.getElementById("submitForm");
  const successPanel = document.getElementById("sandboxSuccess");
  const requestRecipient = "rae@aryze.io";
  const stepTitles = [
    "Your company",
    "Your business",
    "Current payment setup",
    "Sandbox intent",
  ];
  let currentStep = 0;

  function getVisibleStep() {
    return steps[currentStep];
  }

  function setError(container, message) {
    const error = container.querySelector(".field-error");
    container.classList.toggle("has-error", Boolean(message));

    if (error) {
      error.textContent = message || "";
    }
  }

  function normalizeUrlInput(input) {
    const value = input.value.trim();

    if (!input.dataset.urlField || !value) {
      return;
    }

    if (!/^[a-z][a-z\d+\-.]*:\/\//i.test(value)) {
      input.value = `https://${value}`;
    }
  }

  function isValidUrl(value) {
    try {
      const url = new URL(value);
      return Boolean(url.hostname.includes("."));
    } catch (error) {
      return false;
    }
  }

  function validateInput(input) {
    const field = input.closest(".form-field");

    if (!input.required) {
      setError(field, "");
      return true;
    }

    if (!input.value.trim()) {
      setError(field, "This field is required.");
      return false;
    }

    normalizeUrlInput(input);

    if (input.type === "email" && !input.validity.valid) {
      setError(field, "Enter a valid work email.");
      return false;
    }

    if (input.dataset.urlField && !isValidUrl(input.value)) {
      setError(field, "Enter a valid company website.");
      return false;
    }

    setError(field, "");
    return true;
  }

  function validateCheckboxGroup(group) {
    const name = group.dataset.requiredGroup;
    const checked = group.querySelectorAll(`input[name="${name}"]:checked`);
    const isValid = checked.length > 0;
    setError(group, isValid ? "" : "Select at least one option.");
    return isValid;
  }

  function validateStep() {
    const step = getVisibleStep();
    const fields = Array.from(step.querySelectorAll("input, select, textarea"));
    const groups = Array.from(step.querySelectorAll("[data-required-group]"));
    const fieldResults = fields.map(validateInput);
    const groupResults = groups.map(validateCheckboxGroup);
    const isValid = fieldResults.every(Boolean) && groupResults.every(Boolean);

    if (!isValid) {
      const firstError = step.querySelector(
        ".has-error input, .has-error select, .has-error textarea",
      );
      if (firstError) {
        firstError.focus();
      }
    }

    return isValid;
  }

  function updateStep() {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStep);
    });

    stepBars.forEach((bar, index) => {
      bar.classList.toggle("active", index <= currentStep);
    });

    stepText.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    stepTitle.textContent = stepTitles[currentStep];
    backButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
  }

  function getFormData() {
    const data = {};
    const formData = new FormData(form);

    formData.forEach((value, key) => {
      if (data[key]) {
        data[key] = Array.isArray(data[key])
          ? data[key].concat(value)
          : [data[key], value];
      } else {
        data[key] = value;
      }
    });

    return data;
  }

  function formatValue(value) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return value || "Not provided";
  }

  function buildRequestEmail(payload) {
    const fieldLabels = {
      workEmail: "Work email",
      fullName: "Full name",
      companyName: "Company name",
      companyWebsite: "Company website",
      role: "Role",
      market: "Business operates in",
      businessType: "Business type",
      paymentFlow: "Payment flow to improve or test",
      paymentMethods: "Payment methods used today",
      monthlyVolume: "Estimated monthly transaction volume",
      averageTransactionSize: "Average transaction size",
      paymentChallenges: "Main payment challenges",
      sandboxTests: "Sandbox testing intent",
      technicalTeam: "Technical team readiness",
      testingStart: "Preferred testing start",
      additionalContext: "Additional context",
    };
    const bodyLines = [
      "New Pay by Bank sandbox access request",
      "",
      ...Object.entries(fieldLabels).map(([key, label]) => {
        return `${label}: ${formatValue(payload[key])}`;
      }),
    ];
    const companyName = payload.companyName || "Merchant";
    const subject = `Pay by Bank sandbox request - ${companyName}`;

    return {
      subject,
      body: bodyLines.join("\n"),
    };
  }

  function openRequestEmail(payload) {
    const email = buildRequestEmail(payload);
    const mailtoUrl = [
      `mailto:${requestRecipient}`,
      `?subject=${encodeURIComponent(email.subject)}`,
      `&body=${encodeURIComponent(email.body)}`,
    ].join("");

    window.location.href = mailtoUrl;
  }

  function revalidateChangedField(event) {
    const field = event.target.closest(".form-field");
    if (field && field.classList.contains("has-error")) {
      validateInput(event.target);
    }

    const group = event.target.closest("[data-required-group]");
    if (group && group.classList.contains("has-error")) {
      validateCheckboxGroup(group);
    }
  }

  form.addEventListener("input", revalidateChangedField);
  form.addEventListener("change", revalidateChangedField);

  backButton.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    updateStep();
  });

  nextButton.addEventListener("click", () => {
    if (!validateStep()) {
      return;
    }

    currentStep = Math.min(steps.length - 1, currentStep + 1);
    updateStep();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateStep()) {
      return;
    }

    const payload = getFormData();
    openRequestEmail(payload);
    form.hidden = true;
    document.querySelector(".sandbox-form-top").hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
  });

  updateStep();
})();
