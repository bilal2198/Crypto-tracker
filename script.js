function getTime() {
    return new Date().toLocaleTimeString('en-GB');
}

function addLog(message) {
    const feed = document.getElementById('log-feed');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">${getTime()}</span>
                       <span class="log-msg">${message}</span>`;
    feed.insertBefore(entry, feed.firstChild);
    if (feed.children.length > 6) {
        feed.removeChild(feed.lastChild);
    }
}

function getSignal(change) {
    if (change > 2) return { text: 'BUY', cls: 'buy' };
    if (change < -2) return { text: 'SELL', cls: 'sell' };
    return { text: 'HOLD', cls: 'hold' };
}

async function getPrices() {
    document.getElementById('status-text').textContent = 'FETCHING DATA...';
    addLog('Scanning market data...');

    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();

        const coins = [
            { id: 'bitcoin', key: 'btc', data: data.bitcoin },
            { id: 'ethereum', key: 'eth', data: data.ethereum },
            { id: 'solana', key: 'sol', data: data.solana }
        ];

        coins.forEach(coin => {
            const price = coin.data.usd.toLocaleString();
            const change = coin.data.usd_24h_change.toFixed(2);
            const signal = getSignal(parseFloat(change));
            const isPos = parseFloat(change) >= 0;

            document.getElementById(`${coin.key}-price`).textContent = '$' + price;

            const changeEl = document.getElementById(`${coin.key}-change`);
            changeEl.textContent = (isPos ? '▲ +' : '▼ ') + change + '% (24h)';
            changeEl.className = 'change ' + (isPos ? 'positive' : 'negative');

            const signalEl = document.getElementById(`${coin.key}-signal`);
            signalEl.textContent = signal.text;
            signalEl.className = 'signal ' + signal.cls;

            addLog(`<span>${coin.id.toUpperCase()}</span> → $${price} | Signal: ${signal.text}`);
        });

        document.getElementById('status-text').textContent = 'LIVE — LAST UPDATE: ' + getTime();

    } catch (error) {
        document.getElementById('status-text').textContent = 'CONNECTION ERROR';
        addLog('Error fetching market data. Retrying...');
    }
}

getPrices();
setInterval(getPrices, 30000);