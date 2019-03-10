export default class MyModel {
    constructor(servise) {
        this.pubSub = servise;
        this.total = null;
        this.orderData = null;
        this.rates = null;
        this.isSorted = null;
        this.isSearched = null;
        this.getALLData();
    }

    async getData(url) {
        try {
            let response = await fetch(url);
            let data = await response.json();
            return data;
        } catch (error) {
            if (url === 'https://api.exchangeratesapi.io/latest?base=USD') {
                console.error('Не удолось получить данные курса валют')
            } else {
                throw new Error(error);
            }
        }
    }


    async getALLData() {
        try {
            const result = [];
            const orders = await this.getData('/api/orders.json');
            const users = await this.getData('/api/users.json');
            const companies = await this.getData('/api/companies.json');
            const rate = await this.getData('https://api.exchangeratesapi.io/latest?base=USD');
            this.rates = rate;
            for (let i = 0; i < orders.length; i++) {
                let order = orders[i];
                order.rateTotal = null;
                let user = null;
                let comp = null;
                for (let i = 0; i < users.length; i++) {
                    if (order.user_id === users[i].id) {
                        user = users[i];
                        if (!user.company_id) {
                            comp = { url: null, title: null, industry: 'n/a', sector: 'n/a', market_cap: null };
                            continue;
                        }
                        for (let i = 0; i < companies.length; i++) {
                            if (user.company_id === companies[i].id) {
                                comp = companies[i];
                            }
                        }
                    }
                }
                result.push(Object.assign(order, user, comp));
            }
            this.orderData = result;
            this.pubSub.publish('rates', rate);
            this.pubSub.publish('firstLoad', result);
        } catch (error) {
            throw new Error(error);
        }

    }

    getSortData(type, field) {
        let result;
        if (type === 'string') {
            this.isSorted = field;
            result = this.orderData.sort((a, b) => {
                if (a[field] < b[field]) return -1;
                if (a[field] > b[field]) return 1;
                return 0;
            });

        } else if (type === 'number') {
            this.isSorted = field;
            result = this.orderData.sort((a, b) => a[field] - b[field]);
        }
        this.pubSub.publish('sort', result);
    }


    searchOrder(phrase) {
        let myPhrase = new RegExp(phrase, 'i');
        let flag = false;
        const objSort = ['first_name', 'last_name', 'total', 'card_type', 'order_country', 'transaction_id', 'user_id', 'order_ip']
        const result = [];

        for1: for (let i = 0; i < this.orderData.length; i++) {
            let obj = this.orderData[i];
            for (const key of objSort) {
                flag = myPhrase.test(obj[key]);
                if (flag) {
                    result.push(obj);
                    continue for1;
                }
            }
        }
        this.pubSub.publish('search', result);
    }

    getTotal(data) {
        const result = {
            'Orders Count': null,
            'Orders Total': null,
            'Median Value': null,
            'Average Check': null,
            'Average Check (Female)': null,
            'Average Check (Male)': null
        }
        if (data.length > 0) {
            const orders = [];
            const ordersM = [];
            const ordersF = [];

            result['Orders Count'] = data.length;
            for (const el of data) {
                if (el.rateTotal) {
                    el.gender === 'Male' ? ordersM.push(Number(el.rateTotal)) : ordersF.push(Number(el.rateTotal));
                    orders.push(Number(el.rateTotal));
                } else {
                    el.gender === 'Male' ? ordersM.push(Number(el.total)) : ordersF.push(Number(el.total));
                    orders.push(Number(el.total));
                }
            }

            const arrSort = orders.sort((a, b) => a - b);
            result['Orders Total'] = orders.reduce((summ, cur) => summ + cur);
            result['Average Check'] = result['Orders Total'] / result['Orders Count'];

            if (ordersF.length > 0) result['Average Check (Female)'] = ordersF.reduce((summ, cur) => summ + cur) / ordersF.length;
            if (ordersM.length > 0) result['Average Check (Male)'] = ordersM.reduce((summ, cur) => summ + cur) / ordersM.length;

            if (orders.length % 2 === 0) {
                result['Median Value'] = (arrSort[arrSort.length / 2] + arrSort[arrSort.length / 2 - 1]) / 2;
            } else {
                result['Median Value'] = arrSort[Math.floor(arrSort.length / 2)];
            }
            return result;
        }
        return result;
    }

};