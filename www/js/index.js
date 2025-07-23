document.addEventListener('deviceready', loadContacts);

// Variables globales
let allContacts = [];
let currentContact = null;

function loadContacts() {
    let options = new ContactFindOptions();
    options.multiple = true;
    options.hasPhoneNumber = true;
    let fields = ['*'];

    navigator.contacts.find(fields, showContacts, onError, options);
}

function showContacts(contacts) {
    console.log(`${contacts.length} contacts trouvés`);
    allContacts = contacts;
    displayContactList(contacts);
}

function displayContactList(contacts) {
    const contactList = $('#contactList');
    contactList.empty();

    if (contacts.length === 0) {
        contactList.append('<li><p>Aucun contact trouvé</p></li>');
        contactList.listview('refresh');
        return;
    }

    contacts.forEach((contact, index) => {
        const displayName = contact.displayName || contact.name?.formatted || 'Sans nom';
        const phoneNumber = contact.phoneNumbers && contact.phoneNumbers.length > 0
            ? contact.phoneNumbers[0].value
            : 'Pas de numéro';

        const listItem = `
            <li>
                <a href="#detailContactPage" onclick="showContactDetails(${index})">
                    <img src="img/logo.png" alt="Contact">
                    <h2>${displayName}</h2>
                    <p>${phoneNumber}</p>
                </a>
            </li>
        `;
        contactList.append(listItem);
    });

    contactList.listview('refresh');
}

function searchContacts() {
    const searchTerm = $('#searchInput').val().toLowerCase();

    if (searchTerm === '') {
        displayContactList(allContacts);
        return;
    }

    const filteredContacts = allContacts.filter(contact => {
        const name = (contact.displayName || contact.name?.formatted || '').toLowerCase();
        const phone = contact.phoneNumbers && contact.phoneNumbers.length > 0
            ? contact.phoneNumbers[0].value.toLowerCase()
            : '';

        return name.includes(searchTerm) || phone.includes(searchTerm);
    });

    displayContactList(filteredContacts);
}

function showContactDetails(index) {
    currentContact = allContacts[index];
    const detailsDiv = $('#contactDetails');

    const displayName = currentContact.displayName || currentContact.name?.formatted || 'Sans nom';
    const phoneNumber = currentContact.phoneNumbers && currentContact.phoneNumbers.length > 0
        ? currentContact.phoneNumbers[0].value
        : 'Pas de numéro';
    const email = currentContact.emails && currentContact.emails.length > 0
        ? currentContact.emails[0].value
        : 'Pas d\'email';
    const organization = currentContact.organizations && currentContact.organizations.length > 0
        ? currentContact.organizations[0].name
        : 'Pas d\'organisation';

    const detailsHTML = `
        <div class="contact-details">
            <img src="img/logo.png" alt="Contact">
            <h1>${displayName}</h1>
        </div>
        <ul data-role="listview" data-inset="true">
            <li>
                <h2>Téléphone</h2>
                <p><a href="tel:${phoneNumber}">${phoneNumber}</a></p>
            </li>
            <li>
                <h2>Email</h2>
                <p><a href="mailto:${email}">${email}</a></p>
            </li>
            <li>
                <h2>Organisation</h2>
                <p>${organization}</p>
            </li>
        </ul>
    `;

    detailsDiv.html(detailsHTML);
    detailsDiv.trigger('create');
}

function prepareEditContact() {
    if (!currentContact) return;

    $('#editName').val(currentContact.displayName || currentContact.name?.formatted || '');
    $('#editPhone').val(currentContact.phoneNumbers && currentContact.phoneNumbers.length > 0
        ? currentContact.phoneNumbers[0].value : '');
    $('#editEmail').val(currentContact.emails && currentContact.emails.length > 0
        ? currentContact.emails[0].value : '');
    $('#editOrganization').val(currentContact.organizations && currentContact.organizations.length > 0
        ? currentContact.organizations[0].name : '');
}

function saveNewContact() {
    const name = $('#addName').val().trim();
    const phone = $('#addPhone').val().trim();
    const email = $('#addEmail').val().trim();
    const organization = $('#addOrganization').val().trim();

    if (!name || !phone) {
        alert('Le nom et le téléphone sont obligatoires');
        return;
    }

    const contact = navigator.contacts.create();
    contact.displayName = name;
    contact.name = new ContactName();
    contact.name.formatted = name;

    contact.phoneNumbers = [new ContactField('mobile', phone, true)];

    if (email) {
        contact.emails = [new ContactField('home', email, false)];
    }

    if (organization) {
        contact.organizations = [new ContactOrganization()];
        contact.organizations[0].name = organization;
    }

    contact.save(
        function (contact) {
            alert('Contact ajouté avec succès');
            $('#addContactForm')[0].reset();
            loadContacts();
            $.mobile.changePage('#homePage');
        },
        function (error) {
            alert('Erreur lors de l\'ajout: ' + error.code);
        }
    );
}

function saveEditedContact() {
    if (!currentContact) return;

    const name = $('#editName').val().trim();
    const phone = $('#editPhone').val().trim();
    const email = $('#editEmail').val().trim();
    const organization = $('#editOrganization').val().trim();

    if (!name || !phone) {
        alert('Le nom et le téléphone sont obligatoires');
        return;
    }

    currentContact.displayName = name;
    currentContact.name = currentContact.name || new ContactName();
    currentContact.name.formatted = name;

    if (currentContact.phoneNumbers && currentContact.phoneNumbers.length > 0) {
        currentContact.phoneNumbers[0].value = phone;
    } else {
        currentContact.phoneNumbers = [new ContactField('mobile', phone, true)];
    }

    if (email) {
        if (currentContact.emails && currentContact.emails.length > 0) {
            currentContact.emails[0].value = email;
        } else {
            currentContact.emails = [new ContactField('home', email, false)];
        }
    }

    if (organization) {
        if (currentContact.organizations && currentContact.organizations.length > 0) {
            currentContact.organizations[0].name = organization;
        } else {
            currentContact.organizations = [new ContactOrganization()];
            currentContact.organizations[0].name = organization;
        }
    }

    currentContact.save(
        function (contact) {
            alert('Contact modifié avec succès');
            loadContacts();
            $.mobile.changePage('#detailContactPage');
            showContactDetails(allContacts.indexOf(currentContact));
        },
        function (error) {
            alert('Erreur lors de la modification: ' + error.code);
        }
    );
}

function confirmDeleteContact() {
    if (!currentContact) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
        deleteContact();
    }
}

function deleteContact() {
    if (!currentContact) return;

    currentContact.remove(
        function () {
            alert('Contact supprimé avec succès');
            loadContacts();
            $.mobile.changePage('#homePage');
        },
        function (error) {
            alert('Erreur lors de la suppression: ' + error.code);
        }
    );
}

function onError(error) {
    console.log('Erreur:', error);
    alert('Une erreur inattendue s\'est produite: ' + error.code);
}