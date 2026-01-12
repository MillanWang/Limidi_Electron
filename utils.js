function replaceElementText(selector, text) {
  const element = document.getElementById(selector);
  if (element) element.innerText = text;
}

function setElementClass(selector, className, add = true) {
  const element = document.getElementById(selector);
  if (element) {
    if (add) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }
}

module.exports = {
  replaceElementText,
  setElementClass,
};
