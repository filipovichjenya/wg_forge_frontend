export default class MyView {
    constructor(hostElement) {
        this.hostElement = hostElement;
        this.onClickUserDetails = null;
        this.onHeaderClick = null;
        this.onSearchKeyup = null;
        this.onRateChanges = null;
        this.spanElementCheck = false;
    }

    renderTableDefault(rate) {
        if (this.model) {
            this.hostElement.innerHTML = '';
            let content = `<table class="table table-bordered">
                             <thead class="thead-dark">
                               <tr>
                                <th>Search:</th>
                       <th colspan="5">
                    <input class="form-control" type="text" id="search" placeholder="Search">
             </th><th><select class="form-control"><option selected disabled>Выберите валюту</option>`
            if (rate && rate.hasOwnProperty('rates')) {
                for (const key in rate.rates) {
                    content += `<option value="${rate.rates[key]}">${key}</option>`;
                }
            }
            content += `</select></th></tr>                                
                <tr>
                  <th>Transaction ID</th>
                  <th>User Info</th>
                  <th>Order Date</th>
                  <th>Order Amount</th>
                  <th>Card Number</th>
                  <th>Card Type</th>
                  <th>Location</th>
                </tr>
               </thead>
               <tfoot></tfoot>
               <tbody></tbody>
               </table>`;
            this.hostElement.innerHTML = content;
            const select = document.getElementsByTagName('select')[0];
            select.addEventListener('change', this.onRateChanges);
            const input = document.getElementById('search');
            input.addEventListener('keyup', this.onSearchKeyup);

            for (let el of document.querySelector('thead').lastElementChild.getElementsByTagName('th')) {
                if (el.textContent === 'Card Number') continue;
                el.addEventListener('click', this.onHeaderClick);
                el.style.cursor = 'pointer';
            }
        }
    }

    renderOrder(data, total) {
        if (this.model) {
            const table = document.getElementsByTagName('table')[0];
            const tbody = table.getElementsByTagName('tbody')[0];
            const tfoot = table.getElementsByTagName('tfoot')[0];

            table.removeChild(tbody);
            if (total) {
                let totalContext = ``;
                for (let key in total) {
                    if (key !== 'Orders Count') {
                        totalContext += `
                <tr>
                    <td class="bg-info">${key}</td>
                    <td class="text-center" colspan = 6 >${total[key] ? this.moneyFormat(total[key]) : 'n/a'}</td>
                </tr>`;
                    } else {
                        totalContext += `
                        <tr>
                            <td class="bg-info">${key}</td>
                            <td class="text-center" colspan = 6 >${total[key] ? total[key] : 'n/a'}</td>
                        </tr>`;
                    }
                }

                tfoot.innerHTML = totalContext;
            }
            if (data.length > 0) {
                let context = ``;
                for (let el of data) {
                    let avatar = `<img class="img-thumbnail" src="${el.avatar}" width="100px">`;
                    let company = `<a href=${el.url}> ${el.title}</a>`
                    if (!el.avatar) avatar = 'n/a';
                    if (!el.url) company = `${el.title}`
                    if (!el.url && !el.title) company = 'n/a';
                    context += ` 
                <tr id = "order_${this.isInteger(el.id)}">               
                    <td>${el.transaction_id}</td>
                    <td class="user-data">
                        <a href="#">${el.gender === 'Male' ? 'Mr. ' : 'Ms. '}${el.first_name} ${el.last_name}</a>
                        <div class="user-details d-none">
                            <p>Birthday: ${el.birthday ? this.convertTime(el.birthday, true) : 'n/a'}</p> 
                            <p>${avatar}</p>
                            <p>Company: ${company}</p>
                            <p>Industry: ${el.industry} / ${el.sector}</p>
                        </div>
                    </td>
                    <td>${this.convertTime(el.created_at)}</td>
                    <td>${el.rateTotal ? this.moneyFormat(el.rateTotal) : this.moneyFormat(el.total)}</td>
                    <td>${this.creditCardMask(el.card_number)}</td>
                    <td>${el.card_type}</td>
                    <td>${el.order_country} (${el.order_ip})</td>
                </tr>`;
                }
                tbody.innerHTML = context;

                for (const el of tbody.querySelectorAll('td > a')) {
                    el.addEventListener('click', this.onClickUserDetails);
                }
                table.appendChild(tbody);
            } else {
                tbody.innerHTML = `<tr><td class="text-center font-weight-bold" colspan="7">Nothing found</td></tr>`;
                table.appendChild(tbody);
            }
        }
    }
    renderSortOrder(element) {
        const tbody = document.getElementsByTagName('tbody')[0];
        const table = tbody.parentNode;
        const span = document.createElement('span');
        span.innerHTML = '&#8595;';

        table.removeChild(tbody);

        if (this.spanElementCheck) {
            for (const el of table.querySelector('thead').lastElementChild.getElementsByTagName('th')) {
                if (el.children.length === 0) continue;
                el.removeChild(el.lastChild);
                break;
            }
        }
        this.spanElementCheck = true;
        element.appendChild(span);
        table.appendChild(tbody);
    }



    creditCardMask(cardNum) {
        if (cardNum && typeof cardNum === 'string' && (!!Number(cardNum))) {
            return cardNum.slice(0, 2) + cardNum.slice(2, -4).replace(/./g, '*') + cardNum.slice(-4);
        }
        return console.error('Неверный формат номера карты.');
    }

    isInteger(num) {
        if (num > 0 && num % 1 === 0) {
            return num;
        }
        return console.error('Id - целое не отрицательное число.')
    }

    convertTime(time, flag) {
        if (time && typeof time === 'string' && (!!Number(time))) {
            const date = new Date(Number(time) * 1000);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = "0" + date.getMinutes();
            const seconds = "0" + date.getSeconds();
            if (flag) return `${day}/${month}/${year}`
            return `${day}/${month}/${year}, ${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`
        }
        return console.error('Неверный формат даты.');
    }
    moneyFormat(num) {
        return parseFloat(num).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1 ").replace('.', ',');
    }

    setModel(model) {
        this.model = model;
    }
} 