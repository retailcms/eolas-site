$(function() {

    var scroller = new TimelineMax();

    scroller.to('.scroll', .7, {
        y: -50,
        repeat: -1,
        yoyo: true,
        ease: Power2.easeOut
    });


    var scrollMagicController = new ScrollMagic();
    if (ScrollMagic) {
        TweenMax.set('section img, header img', {
            x: '300%'
        });
    };


    var tween1 = TweenMax.to('header img', 1, {
        x: '0%',
        clearProps: 'transform'
    });
    var scene1 = new ScrollScene({
        triggerElement: 'header'
    }).setTween(tween1).addTo(scrollMagicController);

    var tween2 = new TimelineMax();
    tween2.to('#design img', 1, {
            x: '0%',
            clearProps: 'transform'
        }, '-=1')
        .to('.scroll', .7, {
            y: -300,
            opacity: 0,
            onReverseComplete: scroller
        }, '-=1')
        .to('header img', 1, {
            x: '-300%'
        });
    var scene2 = new ScrollScene({
        triggerElement: '#design'
    }).setTween(tween2).addTo(scrollMagicController);


    var tween3 = new TimelineMax();
    tween3.to('#distribute img', 1, {
            x: '0%',
            clearProps: 'transform'
        })
        .to('#design img', 1, {
            x: '-300%'
        });
    var scene3 = new ScrollScene({
        triggerElement: '#distribute'
    }).setTween(tween3).addTo(scrollMagicController);


    var tween4 = new TimelineMax();
    tween4.to('#collect img', 1, {
        x: '0%',
        clearProps: 'transform'
    }).to('#distribute img', 1, {
        x: '-300%'
    });
    var scene4 = new ScrollScene({
        triggerElement: '#collect'
    }).setTween(tween4).addTo(scrollMagicController);


    $('.scrollUp').click(function() {

        TweenMax.to(window, 1, {
            scrollTo: {
                y: 0,
                x: 0
            },
            ease: Power2.easeOut
        });
    });
    var svg = d3.select("svg.gradLine");
    svg.append("linearGradient")
        .attr("id", "gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 1.5).attr("y1", 1.5)
        .attr("x2", 1.5).attr("y2", 692.5)
        .selectAll("stop")
        .data([{
            offset: "0%",
            color: "red"
        }, {
            offset: "40%",
            color: "red"
        }, {
            offset: "40%",
            color: "black"
        }, {
            offset: "62%",
            color: "black"
        }, {
            offset: "62%",
            color: "lawngreen"
        }, {
            offset: "100%",
            color: "lawngreen"
        }])
        .enter().append("stop")
        .attr("offset", function(d) {
            return d.offset;
        })
        .attr("stop-color", function(d) {
            return d.color;
        });

});
