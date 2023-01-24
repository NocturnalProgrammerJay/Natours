/* eslint-disable */

export const hideAlert = () => {
    const el = document.querySelector('.alert')
    if (el) el.parentElement.removeChild(el)
}

//type is 'success' or 'error'
export const showAlert = (type, msg) =>{
    hideAlert()//clears any alerts

    const markup = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
    window.setTimeout(hideAlert, 5000) //clear the just now added alert after 5s
}