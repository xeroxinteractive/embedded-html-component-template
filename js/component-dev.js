(function(document, window) {
    var body = document.body;

    window.setWidth = function(cls){
        body.className = "";
        body.classList.add(cls);
    };

    window.xrx_sc_synthetic_lid_event = function(lid) {
        console.log(lid);
    };

})(document, window);