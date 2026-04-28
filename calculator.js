(function () {
  const form = document.getElementById("pay-by-bank-form");

  if (!form) {
    return;
  }

  const localeByCurrency = {
    DKK: "da-DK",
    EUR: "en-IE",
    GBP: "en-GB",
    USD: "en-US",
  };

  function getNumberValue(id) {
    const element = document.getElementById(id);
    return Number.parseFloat(element.value) || 0;
  }

  function getCurrencyValue() {
    return document.getElementById("currency").value;
  }

  function getPayByBankUnitPrice(monthlyTransactions) {
    return monthlyTransactions < 50000 ? 0.75 : 0.5;
  }

  function formatCurrency(amount, currency) {
    return new Intl.NumberFormat(localeByCurrency[currency], {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatUnitPrice(amount, currency) {
    return new Intl.NumberFormat(localeByCurrency[currency], {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function updateCalculator() {
    const monthlyTransactions = getNumberValue("monthlyTransactions");
    const averageTransactionValue = getNumberValue("averageTransactionValue");
    const currentCardFeePercent = getNumberValue("currentCardFeePercent");
    const currency = getCurrencyValue();
    const currentCardFeeDecimal = currentCardFeePercent / 100;

    const monthlyVolume = monthlyTransactions * averageTransactionValue;
    const currentCardCost = monthlyVolume * currentCardFeeDecimal;
    const unitPrice = getPayByBankUnitPrice(monthlyTransactions);
    const aryzeInternalCost = monthlyTransactions * unitPrice;
    const estimatedMonthlySavings = currentCardCost - aryzeInternalCost;
    const estimatedYearlySavings = estimatedMonthlySavings * 12;

    const resultCard = document.querySelector(".savings-result");
    const mainResultLabel = document.getElementById("mainResultLabel");
    const mainResultValue = document.getElementById("mainResultValue");
    const savingsSupport = document.getElementById("savingsSupport");
    const pricingMessage = document.getElementById("pricingMessage");
    const monthlyVolumeValue = document.getElementById("monthlyVolumeValue");
    const currentCardCostValue = document.getElementById("currentCardCostValue");
    const yearlySavingsValue = document.getElementById("yearlySavingsValue");
    const breakEvenValue = document.getElementById("breakEvenValue");

    mainResultLabel.textContent = "Estimated monthly savings";
    if (estimatedMonthlySavings < 0) {
      resultCard.classList.add("negative-savings");
      mainResultValue.textContent = "No estimated saving";
      savingsSupport.textContent =
        "Current card pricing may be cheaper at this payment amount.";
    } else {
      resultCard.classList.remove("negative-savings");
      mainResultValue.textContent = formatCurrency(
        estimatedMonthlySavings,
        currency,
      );
      savingsSupport.textContent =
        "Based on your current card fee compared with indicative Aryze fixed transaction pricing.";
    }

    pricingMessage.textContent = "";
    monthlyVolumeValue.textContent = formatCurrency(monthlyVolume, currency);
    currentCardCostValue.textContent = formatCurrency(currentCardCost, currency);
    yearlySavingsValue.textContent =
      estimatedMonthlySavings < 0
        ? "No estimated saving"
        : formatCurrency(estimatedYearlySavings, currency);
    breakEvenValue.textContent = `${formatUnitPrice(unitPrice, currency)} / tx`;
  }

  form.addEventListener("input", updateCalculator);
  form.addEventListener("change", updateCalculator);

  updateCalculator();
})();
