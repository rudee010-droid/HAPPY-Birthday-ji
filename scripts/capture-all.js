import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const distDir = path.resolve('dist');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 4173;
const artifactDir = 'C:\\Users\\Prabh\\.gemini\\antigravity\\brain\\971d889c-a50a-4799-b784-bdbcae559525';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const customUserDataDir = path.resolve('tmp_puppeteer');

if (!fs.existsSync(customUserDataDir)) {
  fs.mkdirSync(customUserDataDir, { recursive: true });
}

server.listen(PORT, async () => {
  console.log(`Preview server running at http://localhost:${PORT}`);

  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      userDataDir: customUserDataDir,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-component-update'
      ]
    });

    const page = await browser.newPage();

    page.on('console', (msg) => {
      console.log(`[Browser Console ${msg.type()}]:`, msg.text());
    });

    page.on('pageerror', (err) => {
      console.error(`[Browser Page Error]:`, err.message);
    });

    // Test 1: Primary phone viewport 390x844
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    console.log('Capturing Chapter 0: Gift Cover at 390x844...');
    await page.screenshot({ path: path.join(artifactDir, 'ch00_gift_390x844.png') });

    // Open Gift
    console.log('Tapping Open Gift button...');
    await page.click('#open-gift-btn');
    await new Promise(r => setTimeout(r, 2200));

    console.log('Capturing Chapter 1: Hero at 390x844...');
    await page.screenshot({ path: path.join(artifactDir, 'ch01_hero_390x844.png') });

    // Scroll to Chapter 2: Scorpio Night
    console.log('Scrolling to Chapter 2: Scorpio Sky...');
    await page.evaluate(() => {
      document.getElementById('chapter-2').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'ch02_scorpio_390x844.png') });

    // Scroll to Chapter 3: Memory Galaxy
    console.log('Scrolling to Chapter 3: Memory Galaxy...');
    await page.evaluate(() => {
      document.getElementById('chapter-3').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'ch03_galaxy_390x844.png') });

    // Test tap to enlarge photo
    console.log('Testing tap to enlarge memory photo...');
    await page.click('#galaxy-photo-preview');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(artifactDir, 'ch03_modal_zoom_390x844.png') });
    await page.click('#close-photo-modal-btn');
    await new Promise(r => setTimeout(r, 400));

    // Scroll to Chapter 4: Lantern Field
    console.log('Scrolling to Chapter 4: Lantern Field...');
    await page.evaluate(() => {
      document.getElementById('chapter-4').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'ch04_lanterns_390x844.png') });

    // Scroll to Chapter 5: Arcade Quiz
    console.log('Scrolling to Chapter 5: Arcade Quiz...');
    await page.evaluate(() => {
      document.getElementById('chapter-5').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'ch05_quiz_390x844.png') });

    // Test answering quiz
    console.log('Answering quiz question...');
    const options = await page.$$('#quiz-options-container button');
    if (options.length > 3) {
      await options[3].click(); // Option D is correct for Q1
      await new Promise(r => setTimeout(r, 800));
    }
    await page.screenshot({ path: path.join(artifactDir, 'ch05_quiz_answered_390x844.png') });

    // Scroll to Chapter 6: The Big Question
    console.log('Scrolling to Chapter 6: The Big Question...');
    await page.evaluate(() => {
      document.getElementById('chapter-6').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'ch06_question_390x844.png') });

    // Test clicking Yes
    console.log('Clicking Yes button...');
    await page.click('#btn-love-yes');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, 'ch06_yes_confession_390x844.png') });

    // Scroll to Chapter 7: Movie Date & Vouchers
    console.log('Scrolling to Chapter 7: Movie Date...');
    await page.evaluate(() => {
      document.getElementById('chapter-7').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    const movieCards = await page.$$('#movie-cards-grid > div');
    if (movieCards.length > 0) {
      await movieCards[0].click();
      await new Promise(r => setTimeout(r, 600));
    }
    await page.screenshot({ path: path.join(artifactDir, 'ch07_movie_ticket_390x844.png') });

    // Scroll to Chapter 8: Scratch Cards
    console.log('Scrolling to Chapter 8: Scratch Cards...');
    await page.evaluate(() => {
      document.getElementById('chapter-8').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'ch08_scratch_390x844.png') });

    // Scroll to Chapter 9: Love Letter
    console.log('Scrolling to Chapter 9: Love Letter...');
    await page.evaluate(() => {
      document.getElementById('chapter-9').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(artifactDir, 'ch09_letter_390x844.png') });

    // Scroll to Chapter 10: Cake Island & Wishes
    console.log('Scrolling to Chapter 10: Cake Island...');
    await page.evaluate(() => {
      document.getElementById('chapter-10').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    // Blow 5 candles
    const candleButtons = await page.$$('#candle-flames-row button');
    for (const cBtn of candleButtons) {
      await cBtn.click();
      await new Promise(r => setTimeout(r, 200));
    }
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(artifactDir, 'ch10_cake_blown_390x844.png') });

    // Scroll to Chapter 11: Wishes Wall
    console.log('Scrolling to Chapter 11: Wishes Wall...');
    await page.evaluate(() => {
      document.getElementById('chapter-11').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    // Test posting a wish
    await page.type('#wish-author', 'Laddu');
    await page.type('#wish-message', 'Best birthday ever for the best girl! 💕🍬');
    await page.click('#add-wish-form button[type="submit"]');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(artifactDir, 'ch11_wishes_390x844.png') });

    // Scroll to Chapter 12: Sunrise Credits
    console.log('Scrolling to Chapter 12: Sunrise Credits...');
    await page.evaluate(() => {
      document.getElementById('chapter-12').scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1200));
    // Tap title 3 times for secret modal
    await page.click('#credits-title');
    await new Promise(r => setTimeout(r, 150));
    await page.click('#credits-title');
    await new Promise(r => setTimeout(r, 150));
    await page.click('#credits-title');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(artifactDir, 'ch12_secret_modal_390x844.png') });
    await page.click('#close-secret-modal-btn');
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(artifactDir, 'ch12_credits_390x844.png') });

    // Viewport Test: 360x640 (Compact Android)
    console.log('Testing 360x640 compact Android...');
    await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 2, isMobile: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(artifactDir, 'viewport_360x640.png') });

    // Viewport Test: 430x932 (iPhone 15 Pro Max)
    console.log('Testing 430x932 Pro Max...');
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2, isMobile: true });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(artifactDir, 'viewport_430x932.png') });

    // Viewport Test: 844x390 (Landscape)
    console.log('Testing 844x390 Landscape...');
    await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(artifactDir, 'viewport_844x390_landscape.png') });

    // Viewport Test: 1280x800 (Desktop with centered column)
    console.log('Testing 1280x800 Desktop...');
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1, isMobile: false });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(artifactDir, 'viewport_1280x800_desktop.png') });

    console.log('All automated tests and captures completed successfully!');
    await browser.close();
  } catch (err) {
    console.error('Fatal execution error:', err);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});
