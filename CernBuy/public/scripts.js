$(document).ready(function() {
    $.ajax("../views/partials/head.hbs").done(function(headPartial){
        $('body').append(headPartial);
        Handlebars.registerPartial("headPartial", $("#head").html());
    });
});
