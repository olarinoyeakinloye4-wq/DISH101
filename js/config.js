/* Public business details used by the static storefront. Never store credentials here. */
window.DISH101_CONFIG = {
  contact: {
    phone: '07039863378',
    phoneDisplay: '0703 986 3378',
    whatsapp: '2347039863378',
    email: 'olarinoyeakinloye4@gmail.com'
  },
  bank: {
    bank: 'Opay',
    accountNumber: '07039863378',
    accountName: 'Olarinoye Akinloye Mathew'
  }
};

const { contact, bank } = window.DISH101_CONFIG;
const orderMessage = encodeURIComponent("Hello Dish101, I'd like to place an order:");
const whatsappUrl = `https://wa.me/${contact.whatsapp}?text=${orderMessage}`;

function setLink(id, href, label) {
  const element = document.getElementById(id);
  if (!element) return;
  element.href = href;
  if (label) element.textContent = label;
}

setLink('contact-phone', `tel:${contact.phone}`, contact.phoneDisplay);
setLink('footer-phone', `tel:${contact.phone}`, contact.phoneDisplay);
setLink('contact-email', `mailto:${contact.email}`, contact.email);
setLink('footer-email', `mailto:${contact.email}`, contact.email);
setLink('contact-whatsapp', whatsappUrl);
setLink('whatsapp-float', whatsappUrl);

const bankName = document.getElementById('transfer-bank');
const accountNumber = document.getElementById('transfer-account-number');
const accountName = document.getElementById('transfer-account-name');
if (bankName) bankName.textContent = bank.bank;
if (accountNumber) accountNumber.textContent = bank.accountNumber;
if (accountName) accountName.textContent = bank.accountName;
