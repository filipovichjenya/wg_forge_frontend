export default class MyController {
    constructor(model, view) {
        view.setModel(model);
        this.model = model;
        this.view = view;

        let debounse = function (f, ms) {
            let timer = null;
            return function (...args) {
                const onComplete = () => {
                    f.apply(this, args);
                    timer = null;
                }
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(onComplete, ms);
            };
        }

        this.view.onHeaderClick = this.onHeaderClick.bind(this);
        this.view.onClickUserDetails = this.onClickUserDetails.bind(this);
        this.view.onRateChanges = this.onRateChanges.bind(this);
        this.view.onSearchKeyup = debounse(this.onSearchKeyup, 300).bind(this);


        this.view.renderTableDefault();
        ///--------Вешаем колбеки на события модели----------///
        this.model.pubSub.subscribe('rates', (data) => {
            this.view.renderTableDefault(data);
        })
        this.model.pubSub.subscribe('search', (dataSearch) => {
            if (dataSearch.length > 0) {
                this.view.renderOrder(dataSearch, this.model.getTotal(dataSearch));
            }
            this.view.renderOrder(dataSearch, this.model.getTotal(dataSearch));
        })
        this.model.pubSub.subscribe('sort', (dataSort) => {
            this.view.renderOrder(dataSort, this.model.getTotal(dataSort));
        })
        this.model.pubSub.subscribe('firstLoad', (data) => {
            this.view.renderOrder(data, this.model.getTotal(data));
        })
        ///-----------------------------------------///
    }
    onRateChanges(e){
        for (let i = 0; i < this.model.orderData.length; i++) {
            this.model.orderData[i].rateTotal = this.model.orderData[i].total * e.target.value;
        }
        this.view.renderOrder(this.model.orderData, this.model.getTotal(this.model.orderData));
    }
    onSearchKeyup(e) {
        if (e.target.value) {
            this.model.searchOrder(e.target.value);
        }
        else {
            this.view.renderOrder(this.model.orderData, this.model.getTotal(this.model.orderData));
        }
    }
    onClickUserDetails(e) {
        e.preventDefault();
        const el = e.currentTarget.nextElementSibling;
        el.classList.toggle('d-none')
    }
    onHeaderClick(e) {
        switch (e.currentTarget.cellIndex) {
            case 0:
                if (this.model.isSorted === 'transaction_id') return;
                this.model.getSortData('string', 'transaction_id');
                this.view.renderSortOrder(e.currentTarget);
                break;
            case 1:
                if (this.model.isSorted !== 'first_name') {
                    this.model.getSortData('string', 'first_name');
                    this.view.renderSortOrder(e.currentTarget);
                }
                else if (this.model.isSorted === 'first_name') {
                    this.model.getSortData('string', 'last_name');
                    this.view.renderSortOrder(e.currentTarget);
                }
                break;
            case 2:
                if (this.model.isSorted === 'created_at') return;
                this.model.getSortData('number', 'created_at');
                this.view.renderSortOrder(e.currentTarget);
                break;
            case 3:
                if (this.model.isSorted === 'total') return;
                this.model.getSortData('number', 'total');
                this.view.renderSortOrder(e.currentTarget);
                break;
            case 5:
                if (this.model.isSorted === 'card_type') return;
                this.model.getSortData('string', 'card_type');
                this.view.renderSortOrder(e.currentTarget);
                break;
            case 6:
                if (this.model.isSorted !== 'order_country') {
                    this.model.getSortData('string', 'order_country');
                    this.view.renderSortOrder(e.currentTarget);
                }
                else if (this.model.isSorted === 'order_country') {
                    this.model.getSortData('string', 'order_ip');
                    this.view.renderSortOrder(e.currentTarget);
                }
                break;
        }
    }
}