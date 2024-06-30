class Currency { 
  constructor(code, name){ 
      this.code = code; 
      this.name = name
  }   
}

class CurrencyConverter { 
  constructor(apiUrl) { 
      this.apiUrl = apiUrl
      this.currencies = []; 
  }

  async getCurrencies() { 
      try {
          const response = await fetch(this.apiUrl + "/currencies");
          if (!response.ok) throw new Error('Error fetching currencies') 
          const data = await response.json() 

          
          for (let key in data) {
              if (data.hasOwnProperty(key)) {
                  this.currencies.push({ code: key, name: data[key] });
              }
          }
      } catch (error) {
          console.error('Error fetching currencies: ' + error) 
          alert('Error fetching currencies. Please try again later.'); 
      }
  } 

  async convertCurrency(amount, fromCurrency, toCurrency) { 
      if (fromCurrency.code == toCurrency.code){ 
          return amount
      } 

      try {
          const response = await fetch( 
            `${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`
          );
          if (!response.ok) throw new Error('Error converting currency') 
          const data = await response.json() 
          return data.rates[toCurrency.code] 
      } catch (error) {
          console.error('Error converting currency:', error) 
          return null
      }
  }

  async getRateForDate(date, fromCurrency, toCurrency) {
      try {
          const response = await fetch(
              `${this.apiUrl}/${date}?from=${fromCurrency.code}&to=${toCurrency.code}`
          );
          if (!response.ok) throw new Error("Error fetching rate for date");

          const data = await response.json();
          return data.rates[toCurrency.code];
      } catch (error) {
          console.error("Error fetching rate for date:", error);
          return null;
      }
  }

  async compareRates(fromCurrency, toCurrency) {
      const today = new Date().toISOString().split("T")[0]; 
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000) 
          .toISOString()
          .split("T")[0];

      const todayRate = await this.getRateForDate(today, fromCurrency, toCurrency);
      const yesterdayRate = await this.getRateForDate(
          yesterday,
          fromCurrency,
          toCurrency
      );

      if (todayRate && yesterdayRate) {
          const difference = todayRate - yesterdayRate;
          const percentageChange = ((difference / yesterdayRate) * 100).toFixed(2);
          return { difference, percentageChange};
      } else {
          return null; 
      }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
const form = document.getElementById("conversion-form");
const resultDiv = document.getElementById("result");
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");

const converter = new CurrencyConverter("https://api.frankfurter.app");

await converter.getCurrencies();
populateCurrencies(fromCurrencySelect, converter.currencies);
populateCurrencies(toCurrencySelect, converter.currencies);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const amount = document.getElementById("amount").value;
  const fromCurrency = converter.currencies.find(
    (currency) => currency.code === fromCurrencySelect.value
  );
  const toCurrency = converter.currencies.find(
    (currency) => currency.code === toCurrencySelect.value
  );

  const convertedAmount = await converter.convertCurrency(
    amount,
    fromCurrency,
    toCurrency
  );

  if (convertedAmount !== null && !isNaN(convertedAmount)) {
    resultDiv.textContent = `${amount} ${fromCurrency.code} son ${convertedAmount.toFixed(
      2
    )} ${toCurrency.code}`;

    const comparison = await converter.compareRates(fromCurrency, toCurrency);
    if (comparison) {
      resultDiv.textContent += `\n\nCambio respecto a ayer: ${comparison.difference.toFixed(
        4
      )} (${comparison.percentageChange}%)`;
    } else {
      resultDiv.textContent += "\n\nError al obtener la comparación de tasas.";
    }
  } else {
    resultDiv.textContent = "Error al realizar la conversión.";
  }
});

function populateCurrencies(selectElement, currencies) {
  if (currencies) {
    currencies.forEach((currency) => {
      const option = document.createElement("option");
      option.value = currency.code;
      option.textContent = `${currency.code} - ${currency.name}`;
      selectElement.appendChild(option);
    });
  }
}
});
