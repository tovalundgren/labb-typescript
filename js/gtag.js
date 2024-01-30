const submits = document.getElementById('submit');

submits.forEach(function(submit){
    submit.addEventListener('click', function() {
        gtag('event', 'submit', {
            'submit_title': 'Beräkna',
            'submit_category': 'Kalkylator'
        })
    })
})