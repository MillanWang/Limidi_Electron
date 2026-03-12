export function replaceElementText(selector: string, text: string): void {
  const element = document.getElementById(selector);
  if (element) element.innerText = text;
}

export function setElementClass(selector: string, className: string, add: boolean = true): void {
  const element = document.getElementById(selector);
  if (element) {
    if (add) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }
}
