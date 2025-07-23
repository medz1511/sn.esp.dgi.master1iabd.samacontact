document.addEventListener('deviceready', loadContacts);

function loadContacts() {

    let options = new ContactFindOptions();
    options.multiple = true;
    options.hasPhoneNumber = true;
    options.filter = '';
    let fields = ['*'];

    navigator.contacts.find(fields, showContacts, onError, options);
}

function showContacts(contacts) {
    let contactHtml = '';

    for (const contact of contacts) {
        contactHtml = `
 <li>
 <a href="#">
 <img src="img/logo.png"><h2>${contact.displayName}</h2>
                        <p>${contact.phoneNumbers[0]}</p>
 </a>
 </li>`;

    }
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = contactHtml;
    $('#contactList').listview('refresh');
}
function onError(error) {
    console.log(error)
    alert("an unexpected happen error");
}
