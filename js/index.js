"use strict";
/*
1. Försök korta ner all kod ytterligare
2. Se över varför återstående saldo är så långt ifrån 0...
3. Lämna in på GitHub
*/
// Definiera parametrarna för lånet och amorteringsplanen
let loanAmount;
let interestRate;
let repaymentPeriod;
// Hämta formuläret från HTML och lägg till event listener
const loanForm = document.getElementById('loanContainer');
// Funktion för att validera användarens inmatningar
function isValidInput() {
    // Kontrollera om någon av de inmatade värdena är negativa, lånebeloppets gränser, räntesatsens gränser och återbetalningstidens gränser. Meddela användare vid ogiltig inmatning
    if (loanAmount <= 0 || interestRate <= 0 || repaymentPeriod <= 0) {
        return { isValid: false, errorMessage: "Negativa värden är inte tillåtna." };
    }
    if (loanAmount < 10000 || loanAmount > 1000000) {
        return { isValid: false, errorMessage: "Tillåtet lånebelopp är mellan 10000 och 1000000 SEK." };
    }
    if (interestRate < (2 / 100 / 12) || interestRate > (10 / 100 / 12)) {
        return { isValid: false, errorMessage: "Tillåten räntesats är mellan 2 och 10%." };
    }
    if (repaymentPeriod < (1 * 12) || repaymentPeriod > (20 * 12)) {
        return { isValid: false, errorMessage: "Tillåten återbetalningstid är mellan 1 och 20 år." };
    }
    // Om alla kontroller är godkända, returna true och inget felmeddelande
    return { isValid: true, errorMessage: "" };
}
// Event listener för när formuläret skickas in
loanForm.addEventListener('submit', function (event) {
    // Förhindra webbläsaren från att hantera formuläret traditionellt, så det hanteras med denna kod istället
    event.preventDefault();
    // Hämta användarens inmatade värden
    loanAmount = parseFloat(document.getElementById('loanAmount').value);
    // Omvandla ränta till månadsränta
    interestRate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    // Omvandla återbetalningstid till månader
    repaymentPeriod = parseFloat(document.getElementById('repaymentPeriod').value) * 12;
    // Valider användarens inmatningar
    const validation = isValidInput();
    if (!validation.isValid) {
        if (validation.errorMessage) {
            alert(validation.errorMessage);
        }
        else {
            alert("Ogiltig input. Var vänlig och se över dina värden.");
        }
        return;
    }
    // Utför beräkningar med de validerade värdena
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, repaymentPeriod);
    const totalInterest = calculateTotalInterest(monthlyPayment, repaymentPeriod, loanAmount);
    const amortizationSchedule = generateAmortizationSchedule(loanAmount, interestRate, repaymentPeriod, monthlyPayment);
    // Visa resultaten under beräkna-knappen på webbsidan
    displayResults(monthlyPayment, totalInterest, amortizationSchedule);
});
// Funktion för att beräkna den månatliga betalningen med den givna formeln: M = p * (r * (1+r)^n)) / ((1 + r)^n-1))
function calculateMonthlyPayment(loanAmount, interestRate, repaymentPeriod) {
    // Konvertera den årliga räntesatsen till en månatlig räntesats
    const monthlyInterestRate = interestRate / 12;
    const numberOfPayments = repaymentPeriod;
    // Beräkna månatlig betalning enligt formeln. Math.pow för att beräkna basen upphöjt till exponenten. Numerator (täljare) och denominator (nämnare).
    const numerator = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments));
    const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
    const monthlyPayment = numerator / denominator;
    return monthlyPayment;
}
// Funktion för att beräkna den totala räntekostnaden för lånet
function calculateTotalInterest(monthlyPayment, repaymentPeriod, loanAmount) {
    const totalPayments = monthlyPayment * repaymentPeriod;
    const totalInterest = totalPayments - loanAmount;
    return totalInterest;
}
// Funktion för att generera en amorteringsplan för lånet
function generateAmortizationSchedule(loanAmount, interestRate, repaymentPeriod, monthlyPayment) {
    const amortizationSchedule = [];
    let remainingLoanAmount = loanAmount;
    // Loopa genom återbetalningstiden och beräkna betalning för varje månad
    for (let i = 0; i < repaymentPeriod; i++) {
        const interestPayment = remainingLoanAmount * interestRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingLoanAmount -= principalPayment;
        // Lägg till betalningen i amorteringsplanen
        amortizationSchedule.push(principalPayment);
    }
    return amortizationSchedule;
}
// Funktion för att visa amorteringsplan
function displayResults(monthlyPayment, totalInterest, amortizationSchedule) {
    // Hämta resultsContainer från HTML
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '<h2>Resultat med amorteringsplan</h2>';
    // Skapa och visa element för månatlig betalning, total ränta och total kostnad för lånet
    const monthlyPaymentElement = document.createElement('p');
    monthlyPaymentElement.textContent = `Månadsbetalning: ${monthlyPayment.toFixed(2)} SEK`;
    resultsContainer.appendChild(monthlyPaymentElement);
    const totalInterestElement = document.createElement('p');
    totalInterestElement.textContent = `Total ränta: ${totalInterest.toFixed(2)}`;
    resultsContainer.appendChild(totalInterestElement);
    let totalCost = loanAmount + totalInterest;
    const totalCostElement = document.createElement('p');
    totalCostElement.textContent = `Total kostnad: ${totalCost.toFixed(2)}`;
    resultsContainer.appendChild(totalCostElement);
    // Skapa en tabell för att visa amorteringsschemat
    let tableHTML = '<table>';
    tableHTML += '<thead><tr><th>Månad</th><th>Betalning</th><th>Ränta</th><th>Kvarstående saldo</th></tr></thead>';
    tableHTML += '<tbody>';
    let remainingBalance = loanAmount;
    // Fyll tabellen med data från amorteringsplanen
    for (let i = 0; i < amortizationSchedule.length; i++) {
        const principalPayment = amortizationSchedule[i];
        const costOfInterest = monthlyPayment - principalPayment;
        remainingBalance -= principalPayment;
        totalInterest += costOfInterest;
        tableHTML += `<tr><td>${i + 1}</td><td>${monthlyPayment.toFixed(2)}</td><td>${costOfInterest.toFixed(2)}</td><td>${remainingBalance.toFixed(2)}</td></tr>`;
    }
    tableHTML += '</tbody>';
    tableHTML += '</table>';
    // Uppdatera total ränta
    totalInterestElement.textContent = `Total ränta: ${totalInterest.toFixed(2)} SEK`;
    // Uppdatera total kostnad
    totalCost = loanAmount + totalInterest;
    totalCostElement.textContent = `Total kostnad: ${totalCost.toFixed(2)} SEK`;
    resultsContainer.innerHTML += tableHTML;
}
