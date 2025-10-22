// /services/cedulaService.js

const puppeteer = require('puppeteer');

let browser;

/**
 * Inicializa y reutiliza una única instancia del navegador Puppeteer.
 */
async function initBrowser() {
  if (!browser || !browser.isConnected()) {
    console.log('[CedulaService] 🌐 Inicializando navegador Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('[CedulaService] ✅ Navegador listo.');
  }
  return browser;
}

/**
 * Realiza el scraping de los datos de una cédula en el portal del IPS.
 * @param {string} cedula El número de cédula a consultar.
 * @returns {Promise<object>} Un objeto con los datos obtenidos.
 */
async function scrapeData(cedula) {
  const browserInstance = await initBrowser();
  const page = await browserInstance.newPage();

  console.log(`[CedulaService]  scraping para cédula ${cedula}`);

  try {
    await page.goto('https://servicios.ips.gov.py/constancias_aop/consNoSerAseguradoCot.php', { waitUntil: 'networkidle2' });
    await page.type('input[name="parmCedula"]', cedula);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForSelector('#divResultados', { visible: true, timeout: 15000 });

    const result = {
      cedula: (await page.$('#varCedula')) ? await page.$eval('#varCedula', el => el.value.trim()) : cedula,
      nombres: (await page.$('#varNombre')) ? await page.$eval('#varNombre', el => el.value.trim()) : "",
      estado: (await page.$('#varEstado')) ? await page.$eval('#varEstado', el => el.value.trim()) : "Informal"
    };

    console.log(`[CedulaService] ✅ Datos obtenidos para ${cedula}: ${JSON.stringify(result)}`);
    return result;

  } catch (err) {
    console.log(`[CedulaService] ❌ Error scraping ${cedula}: ${err.message}`);
    return { cedula, estado: "Informal", nombres: "" };
  } finally {
    await page.close();
    console.log(`[CedulaService] 🔒 Pestaña cerrada para ${cedula}`);
  }
}

module.exports = {
  initBrowser,
  scrapeData
};