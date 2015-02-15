$(function() {
    // Init Controller
    var scrollMagicController = new ScrollMagic();
    if (ScrollMagic) {
        TweenMax.set('section img, header img', {
            x: '300%'
        });
    };
    // Create Animation for 0.5s
    var tween1 = TweenMax.to('header img', 1, {
        // rotation: 360,
        // transformOrigin: "right top",
        x: '0%',
        clearProps: 'transform'
        // scale: 10
        // ease: Power1.easeOut
    });
    // Create the Scene and trigger when visible with ScrollMagic
    var scene1 = new ScrollScene({
        triggerElement: 'header'
        // offset: '10%'
    }).setTween(tween1).addTo(scrollMagicController);

    var tween2 = TweenMax.to('#design img', 1, {
        // rotation: 360,
        // transformOrigin: "right top",
        x: '0%',
        clearProps: 'transform'
        // scale: 10
        // ease: Power1.easeOut
    });
    // Create the Scene and trigger when visible with ScrollMagic
    var scene2 = new ScrollScene({
        triggerElement: '#design'
        // offset: '10%'
    }).setTween(tween2).addTo(scrollMagicController);

    var tween3 = TweenMax.to('#distribute img', 1, {
        // rotation: 360,
        // transformOrigin: "right top",
        x: '0%',
        clearProps: 'transform'
        // scale: 10
        // ease: Power1.easeOut
    });
    // Create the Scene and trigger when visible with ScrollMagic
    var scene3 = new ScrollScene({
        triggerElement: '#distribute'
        // offset: '10%'
    }).setTween(tween3).addTo(scrollMagicController);

    var tween4 = TweenMax.to('#collect img', 1, {
        // rotation: 360,
        // transformOrigin: "right top",
        x: '0%',
        clearProps: 'transform'
        // scale: 10
        // ease: Power1.easeOut
    });
    // Create the Scene and trigger when visible with ScrollMagic
    var scene4 = new ScrollScene({
        triggerElement: '#collect'
        // offset: '10%'
    }).setTween(tween4).addTo(scrollMagicController);


});
