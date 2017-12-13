/**
 * Created by Çñ½¨Ç¿ on 2017/12/11.
 */
function hideParent(event) {
    event.target.parentNode.style.display = "none";
}

function displayForm(event) {
    event.target.parentNode.nextElementSibling.style.display = "block";
}

function addTag(event) {
    event.target.parentNode.parentNode.submit();
}

function delTag(delUrl) {
    location.href = delUrl;
}