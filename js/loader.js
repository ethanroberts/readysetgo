function showLoader(){
    $(".loader").css({
        opacity: "1",
        "pointer-events": "auto"
    });
};

function hideLoader(){
    $(".loader").css({
        opacity: "0",
        "pointer-events": "none"
    });
}
