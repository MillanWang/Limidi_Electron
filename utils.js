function replaceElementText(selector, text) {
  const element = document.getElementById(selector);
  if (element) element.innerText = text;
}

module.exports = {
  replaceElementText,
};
