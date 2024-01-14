// Definiera parametrarna för lånet och amorteringsplanen
let loanAmount: number;
let interestRate: number;
let repaymentPeriod: number;

// Hämta formuläret från HTML och lägg till event listener
const loanForm = document.getElementById('loanContainer') as HTMLFormElement;

// Funktion för att validera användarens inmatningar
function isValidInput(): {isValid: boolean; errorMessage: string} {
    // Kontrollera om någon av de inmatade värdena är negativa, lånebeloppets gränser, räntesatsens gränser och återbetalningstidens gränser. Meddela användare vid ogiltig inmatning
    if (loanAmount <= 0 || interestRate <= 0 || repaymentPeriod <= 0) {
        return {isValid: false, errorMessage: "Negativa värden är inte tillåtna."};
    }

    if (loanAmount < 10000 || loanAmount > 1000000) {
        return {isValid: false, errorMessage: "Tillåtet lånebelopp är mellan 10000 och 1000000 SEK."};
    }

    if (interestRate < (2) || interestRate > (10)) {
        return {isValid: false, errorMessage: "Tillåten räntesats är mellan 2 och 10%."};
    }

    if (repaymentPeriod < (1) || repaymentPeriod > (20)) {
        return {isValid: false, errorMessage: "Tillåten återbetalningstid är mellan 1 och 20 år."};
    }

    // Om alla kontroller är godkända, returna true och inget felmeddelande
    return {isValid: true, errorMessage: ""};
}

// Event listener för när formuläret skickas in
loanForm.addEventListener('submit', function (event: Event) {
    // Förhindra webbläsaren från att hantera formuläret traditionellt, så det hanteras med denna kod istället
    event.preventDefault();

    // Hämta användarens inmatade värden
    loanAmount = parseFloat((document.getElementById('loanAmount') as HTMLInputElement).value);
    interestRate = parseFloat((document.getElementById('interestRate') as HTMLInputElement).value);
    repaymentPeriod = parseFloat((document.getElementById('repaymentPeriod') as HTMLInputElement).value);

    // Validera användarens inmatningar
    const validation: {isValid: boolean; errorMessage: string} = isValidInput();
    if (!validation.isValid) {
        if (validation.errorMessage) {
            alert(validation.errorMessage);
        } else {
            alert("Ogiltig input. Var vänlig och se över dina värden.");
        }
        return;
    }

    // Utför beräkningar med de validerade värdena
    const monthlyPayment: number = calculateMonthlyPayment(loanAmount, interestRate, repaymentPeriod);
    const totalInterest: number = calculateTotalInterest(monthlyPayment, repaymentPeriod * 12, loanAmount);
    const amortizationSchedule: number[] = generateAmortizationSchedule(loanAmount, interestRate / 100 / 12, repaymentPeriod * 12, monthlyPayment);

    // Visa resultaten under beräkna-knappen på webbsidan
    displayResults(monthlyPayment, totalInterest, amortizationSchedule);
});

// Funktion för att beräkna den månatliga betalningen med den givna formeln: M = p * (r * (1+r)^n)) / ((1 + r)^n-1))
function calculateMonthlyPayment(loanAmount: number, annualInterestRate: number, repaymentPeriod: number): number {
    // Konvertera den årliga räntesatsen till en månatlig räntesats
    const monthlyInterestRate: number = annualInterestRate / 100 / 12;
    const numberOfPayments: number = repaymentPeriod * 12;

    // Beräkna månatlig betalning enligt formeln. Math.pow för att beräkna basen upphöjt till exponenten. Numerator (täljare) och denominator (nämnare).
    const numerator: number = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
    const denominator: number = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;

    const monthlyPayment: number = numerator / denominator;

    return monthlyPayment;
}

// Funktion för att beräkna den totala räntekostnaden för lånet
function calculateTotalInterest(monthlyPayment: number, repaymentPeriod: number, loanAmount: number): number {
    const totalPayments: number = monthlyPayment * repaymentPeriod;
    const totalInterest: number = totalPayments - loanAmount;

    return totalInterest;
}

// Funktion för att generera en amorteringsplan för lånet
function generateAmortizationSchedule(loanAmount: number, interestRate: number, repaymentPeriod: number, monthlyPayment: number): number[] {
    const amortizationSchedule: number[] = [];
    let remainingLoanAmount: number = loanAmount;

    // Loopa genom återbetalningstiden och beräkna betalning för varje månad
    for (let i: number = 0; i < repaymentPeriod; i++) {
        const interestPayment: number = remainingLoanAmount * interestRate;
        const principalPayment: number = monthlyPayment - interestPayment;

        remainingLoanAmount -= principalPayment;

        // Lägg till betalningen i amorteringsplanen
        amortizationSchedule.push(principalPayment);
    }

    return amortizationSchedule;
}

// Funktion för att visa amorteringsplan
function displayResults(monthlyPayment: number, totalInterest: number, amortizationSchedule: number[]): void {
    // Hämta resultsContainer från HTML
    const resultsContainer = document.getElementById('resultsContainer') as HTMLElement;
    resultsContainer.innerHTML = '<h2>Resultat med amorteringsplan</h2>';

    // Skapa och visa element för månatlig betalning, total ränta och total kostnad för lånet
    const monthlyPaymentElement = document.createElement('p');
    monthlyPaymentElement.textContent = `Månadsbetalning: ${monthlyPayment.toFixed(2)} SEK`;
    resultsContainer.appendChild(monthlyPaymentElement);

    const totalInterestElement = document.createElement('p');
    totalInterestElement.textContent = `Total ränta: ${totalInterest.toFixed(2)}`;
    resultsContainer.appendChild(totalInterestElement);

    let totalCost: number = loanAmount + totalInterest;
    const totalCostElement = document.createElement('p');
    totalCostElement.textContent = `Total kostnad: ${totalCost.toFixed(2)}`;
    resultsContainer.appendChild(totalCostElement);

    // Skapa en tabell för att visa amorteringsschemat
    let tableHTML: string = '<table>';
    tableHTML += '<thead><tr><th>Månad</th><th>Betalning</th><th>Ränta</th><th>Kvarstående saldo</th></tr></thead>';
    tableHTML += '<tbody>';

    let remainingBalance: number = loanAmount;

    // Fyll tabellen med data från amorteringsplanen
    for (let i: number = 0; i < amortizationSchedule.length; i++) {
        const principalPayment: number = amortizationSchedule[i];
        const costOfInterest: number = monthlyPayment - principalPayment;

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