import {closeModalWindow, showModalWindow} from "./modal"; //импорт ф-ий показа и закрытия окна из modal
import {postData} from "../services/services";

function forms(formSelector, modalTimer) {
    //5. Формы отправки (POST)
    const forms = document.querySelectorAll(formSelector); //выдергиваем формы
    const message = { // список фраз после отправки формы
        loading: 'icons/spinner.svg', //путь к рис. загрузки
        success: 'Спасибо! Скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так...'
    };

    forms.forEach(item => { // применяем ф-ю postData для каждой ф-ии
        bindPostData(item);
    });


    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); //отмена станд. поведения браузера, т.е перезагрузки при отправке
                clearInterval(modalTimer);// удаление таймера появления окна после отправки формы

            const statusMessage = document.createElement('img'); //создаем элемент на странице показывающий рис загрузки
            statusMessage.src = message.loading; // обращение к атрибуту src в html-структуре
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto`; //исп-e cssText для размещения объекта
            form.append(statusMessage); //рис загрузки добавляем в form
            form.insertAdjacentElement('afterend', statusMessage); // аргументы: куда, что (statusMessage-спиннер)
            
            const formData = new FormData(form); //создаем объект FormData, для формирования данных кот-е отправляет пользователь, формируется в формате ключ-значение. Внутри form, кот-й получим от пользователя. В html в форме обязательно должен быть атрибут name=""
            const json = JSON.stringify(Object.fromEntries(formData.entries())); //перебор fromData для преобразования в json

            postData('http://localhost:3000/requests', json)//вызов ф-ии отправки данных
            .then(data => {
                console.log(data);
                showThanksModal(message.success); //выведение статуса запроса пользователю
                statusMessage.remove(); // удаление спиннера со страницы
            })
            .catch(() => {
                showThanksModal(message.failure);
            })
            .finally(() => {
                form.reset();// очищение полей после отправки
            });     
        });
    }
    //Ф-я показа инфо окна для пользователя
    function showThanksModal(message) {
        const previousModalDialog = document.querySelector('.modal__dialog');
        previousModalDialog.classList.add('hide'); //скрытие пред. модал окна, перед появлением инфо окна
        showModalWindow('.modal', modalTimer); //снова показываем окно с новым содержимым

        const thanksModal = document.createElement('div'); //создаем блок с новым контентом
            thanksModal.classList.add('modal__dialog'); // добавляем класс modal__dialog, т.е предыдущий modal__dialog заменяем новым
            thanksModal.innerHTML = `
                <div class="modal__content">
                    <div class="modal__close" data-close>×</div>
                    <div class="modal__title">${message}</div>
                </div>
            `; //помещаем верстку. message - аргумент из ф-ии showThanksModal, туда будем помещать сообщение из const message

            document.querySelector('.modal').append(thanksModal); //помещаем в модал окно инфо сообщение
            setTimeout(() => { // удаляем ч/з 4сек наш рукотоворный блок и делаем так чтобы появлялось старое окно
                thanksModal.remove(); // удаляем инфо окно, иначе начнутся накапливаться блоки
                previousModalDialog.classList.add('show'); // показываем предыдущее окно
                previousModalDialog.classList.remove('hide');
                closeModalWindow('.modal'); // закрываем окно для пользователя. '.modal'-селектор модального окна кот-й закрываем
            }, 4000);
    }

    //обращение к БД JSON
    fetch('http://localhost:3000/menu')
        .then(data => data.json())
        .then(res => console.log(res));
}
export default forms;