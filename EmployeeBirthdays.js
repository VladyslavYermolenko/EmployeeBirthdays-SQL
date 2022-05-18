const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    user: 'todolist_app',
    password: 'secret',
    database: 'employeebirthdays'
});

client.connect();

client.query("CREATE TABLE if not exists ebTable (id SERIAL PRIMARY KEY, name varchar(128), date varchar(128));");

// client.query("INSERT INTO ebTable (name,date)"
//             + "VALUES ('Ваня Иванов', '22.07.2003'),"
//                     + "('Женя Сокол', '28.07.2003'),"
//                     + "('Саша Прокопенко', '14.01.2001'),"
//                     + "('Аня Дубцова', '12.09.2004'),"
//                     + "('Коля Зайценко', '12.09.2002'),"
//                     + "('Влад Волков', '09.11.1999');");

function plural(age, p1, p2, p3) { // лет год года
    let form = '';
    count = age % 100;
    if (count >= 5 && count <= 20) {
        form = p1;
    } else {
        count = count % 10;
        if (count == 1) {
            form = p2;
        } else if (count >= 2 && count <= 4) {
            form = p3;
        } else {
            form = p1;
        }
    }
    return age + ' ' + form;
}

/** Converting a date string to new Date and returning the day. */
function dayToNumber(date) {
    let formatDate = date.split('.').reverse().join('-')
    return new Date(formatDate).getDate();
}

/** Converting a date string to new Date and returning the month. */
function monthToNumber(date) {
    let formatDate = date.split('.').reverse().join('-')
    return new Date(formatDate).getMonth() + 1;
}
/** Converting a date string to new Date and returning the year. */
function yearToNumber(date) {
    let formatDate = date.split('.').reverse().join('-')
    return new Date(formatDate).getFullYear();
}

/** Output grouped by month of birth sorted by date.
 *  @param {object} data An array of data about birthdays.
 *  @param {number} amount Planning horizon - how many months ahead to show birthdays.
 */
function EmployeeBirthdays(data, amount) {
    const monthNow = new Date(new Date().toDateString()).getMonth() + 1;
    const yearNow = new Date(new Date().toDateString()).getFullYear();
    const monthsStr = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    data.sort(function (a, b) {
        if (dayToNumber(a.date) > dayToNumber(b.date)) {
            return 1;
        }
        if (dayToNumber(a.date) < dayToNumber(b.date)) {
            return -1;
        }
        if (yearToNumber(a.date) > yearToNumber(b.date)) {
            return 1;
        }
        if (yearToNumber(a.date) < yearToNumber(b.date)) {
            return -1;
        }
        return 0;
    });

    const dataMap = new Map();
    for (const obj of data) {
        const month = monthToNumber(obj.date);
        dataMap.get(month)?.push(obj) ?? dataMap.set(month, [obj]);
    }

    for (let i = 0; i <= amount; i++) {
        let month = (monthNow + i - 1) % 12;
        console.log(`${monthsStr[month]} ${yearNow + (Math.floor(i / 12))}:`);
        const arr = dataMap.get(month);
        if (!arr) {
            console.log(' Пусто...');
            continue;
        }
        for (const el of arr) {
            let age = yearNow - yearToNumber(el.date) + (Math.floor(i / 12));
            console.log(` (${dayToNumber(el.date)}) - ${el.name} (${plural(age, 'лет', 'год', 'года')})`);
        }
    }
    // console.log(dataMap);
}

client.query("SELECT * FROM ebTable;", (error, res) => {
    error ? error.stack : EmployeeBirthdays(res.rows, 23); // 1 - 12 месяц
    client.end();
});
