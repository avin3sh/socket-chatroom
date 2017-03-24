// Empty JS for your own code to be here

$(document).ready(function () {
    $('#logout-link').on('click', function () {

        $.ajax({
            type: 'POST',
            url: '/auth/logout',
            data: {},
            success: function (res) {
                alert('click happened');
                document.title = "Login Portal";
            }

        });
    })
});