const submitButton = document.getElementById('submit');

submitButton.addEventListener('click', function() {
    gtag('event', 'submit', {
        'submit_title': 'Beräkna',
        'submit_category': 'Kalkylator'
    });
});