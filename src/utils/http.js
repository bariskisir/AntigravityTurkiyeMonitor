import axios from 'axios';

const client = axios.create({
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br'
    }
});

client.interceptors.request.use((config) => {
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}timestamp=${Date.now()}`;
    return config;
});

export default client;
