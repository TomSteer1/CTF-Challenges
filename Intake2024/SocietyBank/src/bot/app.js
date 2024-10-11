const puppeteer = require('puppeteer');

// const adminURL = "http://admin.societybank.intake";
const adminURL = "http://localhost:3000";
const adminUsername = "admin";
const adminPassword = "6c06e5381c148de62147053057fa96bac03712d0";


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function approveAccounts() {

    console.log("Approving accounts...");
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']});
    console.log("Opening page...");
    const page = await browser.newPage();
    console.log("Navigating to admin page...");
    await page.goto(adminURL, {waitUntil: 'domcontentloaded'});
    await page.click('a[href="login.html"]');
    await page.waitForNetworkIdle();
    console.log("Logging in...");
    await page.type('input[name=username]', adminUsername);
    await page.type('input[name=password]', adminPassword);
    await page.click('button[type=submit]');
    await page.waitForNetworkIdle();
		await sleep(5000);
    await page.goto(adminURL + '/queue.html', {waitUntil: 'networkidle0'});
    const users = await page.evaluate(() => {
        const rows = document.querySelectorAll("table tr");
        return Array.from(rows, row => {
            const columns = row.querySelectorAll("td");
            return Array.from(columns, column => column.innerText);
        });
    });
    // Click approve buttons on all users
    for (let i = 1; i < users.length; i++) {
        await page.click(`#approve`);
        await sleep(1000);
    }
    console.log("Done!");
    await browser.close();
    // Wait 1 minute before running again
    await sleep(60000);
    approveAccounts();
}

approveAccounts();
