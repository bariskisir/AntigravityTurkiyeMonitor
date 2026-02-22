export default class AgendaResult {
    constructor(data = {}) {
        this.exchangeRates = data.exchangeRates || null;
        this.stocks = data.stocks || null;
        this.crypto = data.crypto || null;
        this.fuelPrices = data.fuelPrices || null;
        this.tuikStats = data.tuikStats || null;
        this.economicNews = data.economicNews || null;
        this.twitterTrends = data.twitterTrends || null;
        this.politics = data.politics || null;
        this.eksisozluk = data.eksisozluk || null;
        this.earthquakes = data.earthquakes || null;
        this.youtubeTrends = data.youtubeTrends || null;
        this.weather = data.weather || null;
        this.magnificent7stocks = data.magnificent7stocks || null;
        this.timestamp = data.timestamp || new Date().toISOString();
    }

    toJSON() {
        return {
            exchangeRates: this.exchangeRates,
            stocks: this.stocks,
            crypto: this.crypto,
            fuelPrices: this.fuelPrices,
            tuikStats: this.tuikStats,
            economicNews: this.economicNews,
            twitterTrends: this.twitterTrends,
            politics: this.politics,
            eksisozluk: this.eksisozluk,
            earthquakes: this.earthquakes,
            youtubeTrends: this.youtubeTrends,
            weather: this.weather,
            magnificent7stocks: this.magnificent7stocks,
            timestamp: this.timestamp
        };
    }

    static fromJSON(json) {
        return new AgendaResult(json);
    }
}
