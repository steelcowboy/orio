function setupBuilder() {
    $(".block").fadeOut("fast", function() {
        $(".block").css('visibility', 'hidden').remove();
    });
    $(".quarter").each(function() {
        this.css({
            visibility: 'hidden',
            display: 'block'
            }).slideUp("fast", function() {
            blockEl.remove();
        });
    });
}