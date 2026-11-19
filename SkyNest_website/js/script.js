document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.menu');
    const links = document.querySelector('.nav-links');

    if (menu && links) {
        menu.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            menu.setAttribute('aria-expanded', String(open));
        });

        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                links.classList.remove('open');
                menu.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.querySelectorAll('.faq button').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const open = item.classList.toggle('open');
            button.setAttribute('aria-expanded', String(open));
        });
    });

    const form = document.querySelector('#contactForm');

    if (form) {
        const note = document.querySelector('#formNotice');
        const submitButton = form.querySelector('button[type="submit"]');
        const buttonText = submitButton.textContent;
        const fieldErrors = {};
        let sending = false;

        form.noValidate = true;

        form.querySelectorAll('#name, #email, #phone, #message')
            .forEach(field => {
                const error = document.createElement('p');
                error.id = field.id + 'Error';
                error.className = 'field-error';
                error.setAttribute('aria-live', 'polite');

                field.after(error);
                field.setAttribute('aria-describedby', error.id);
                fieldErrors[field.id] = error;
            });

        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (sending) return;

            const fullName = form.querySelector('#name');
            const email = form.querySelector('#email');
            const message = form.querySelector('#message');
            const phone = form.querySelector('#phone');

            const phoneText = phone.value.trim();
            const phoneDigits = phoneText.replace(/\D/g, '');
            const invalidFields = [];

            function checkField(field, valid, errorMessage) {
                field.style.borderColor = valid ? '' : '#d85c5c';
                field.setAttribute('aria-invalid', String(!valid));
                fieldErrors[field.id].textContent =
                    valid ? '' : errorMessage;

                if (!valid) {
                    invalidFields.push(field);
                }
            }

            checkField(
                fullName,
                fullName.value.trim().length > 0,
                'Name cannot be blank.'
            );

            checkField(
                email,
                email.validity.valid &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()),
                'Enter a valid email address.'
            );

            checkField(
                message,
                message.value.trim().length >= 10,
                'Message must contain at least 10 characters.'
            );

            checkField(
                phone,
                phoneText === '' || (
                    /^\+?[0-9\s()-]+$/.test(phoneText) &&
                    phoneDigits.length >= 7 &&
                    phoneDigits.length <= 15
                ),
                'Enter a phone number with 7–15 digits.'
            );

            if (invalidFields.length) {
                note.textContent = '';
                note.style.display = 'none';
                invalidFields[0].focus();
                return;
            }

            const data = new FormData(form);

            sending = true;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            note.style.display = 'block';
            note.style.whiteSpace = 'pre-line';
            note.textContent = 'Sending your enquiry...';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: data,
                    headers: {
                        Accept: 'application/json'
                    }
                });

                if (response.ok) {
                    note.textContent =
                        'Thank you! Your enquiry has been submitted.';
                    form.reset();
                } else {
                    const result = await response.json().catch(() => null);
                    const messages = Array.isArray(result?.errors)
                        ? result.errors
                            .map(error => error.message)
                            .filter(Boolean)
                        : [];

                    note.textContent = messages.length
                        ? messages.join('\n')
                        : 'Your enquiry could not be sent. Please try again.';
                }
            } catch {
                note.textContent =
                    'Could not confirm submission. Check your connection before trying again.';
            } finally {
                sending = false;
                submitButton.disabled = false;
                submitButton.textContent = buttonText;
            }
        });

        form.addEventListener('input', event => {
            if (sending) return;

            const field = event.target;

            if (fieldErrors[field.id]) {
                fieldErrors[field.id].textContent = '';
                field.style.borderColor = '';
                field.removeAttribute('aria-invalid');
            }

            note.style.display = 'none';
        });
    }

    const year = document.querySelector('[data-year]');

    if (year) {
        year.textContent = new Date().getFullYear();
    }
});