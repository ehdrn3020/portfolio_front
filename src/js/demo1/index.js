// import { gsap } from 'gsap/all';
import { LocomotiveScroll } from '../../../node_modules/locomotive-scroll';

/* utils */
const imagesLoaded = require('imagesloaded');

// Map number x from range [a, b] to [c, d]
const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

const clamp = (num, min, max) => num <= min ? min : num >= max ? max : num;

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Gets the mouse position
const getMousePos = e => {
    return { 
        x : e.clientX, 
        y : e.clientY 
    };
};

// Preload images
const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
    });
};

// Preload images
const preloadFonts = (id) => {
    return new Promise((resolve) => {
        WebFont.load({
            typekit: {
                id: id
            },
            active: resolve
        });
    });
};

/* cursor */
// Track the mouse position
let mouse = {x: 0, y: 0};
window.addEventListener('mousemove', ev => mouse = getMousePos(ev));

export default class Cursor {
    constructor(el) {
        this.DOM = {el: el};
        this.DOM.el.style.opacity = 0;
        
        this.bounds = this.DOM.el.getBoundingClientRect();
        
        this.renderedStyles = {
            tx: {previous: 0, current: 0, amt: 0.2},
            ty: {previous: 0, current: 0, amt: 0.2},
            scale: {previous: 1, current: 1, amt: 0.15},
            //opacity: {previous: 1, current: 1, amt: 0.1}
        };

        this.onMouseMoveEv = () => {
            this.renderedStyles.tx.previous = this.renderedStyles.tx.current = mouse.x - this.bounds.width/2;
            this.renderedStyles.ty.previous = this.renderedStyles.ty.previous = mouse.y - this.bounds.height/2;
            // gsap.to(this.DOM.el, {duration: 0.9, ease: 'Power3.easeOut', opacity: 1});
            requestAnimationFrame(() => this.render());
            window.removeEventListener('mousemove', this.onMouseMoveEv);
        };
        window.addEventListener('mousemove', this.onMouseMoveEv);
    }
    enter() {
        this.renderedStyles['scale'].current = 2.5;
        //this.renderedStyles['opacity'].current = 0.5;
    }
    leave() {
        this.renderedStyles['scale'].current = 1;
        //this.renderedStyles['opacity'].current = 1;
    }
    render() {
        this.renderedStyles['tx'].current = mouse.x - this.bounds.width/2;
        this.renderedStyles['ty'].current = mouse.y - this.bounds.height/2;

        for (const key in this.renderedStyles ) {
            this.renderedStyles[key].previous = lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].amt);
        }
                    
        this.DOM.el.style.transform = `translateX(${(this.renderedStyles['tx'].previous)}px) translateY(${this.renderedStyles['ty'].previous}px) scale(${this.renderedStyles['scale'].previous})`;
        //this.DOM.el.style.opacity = this.renderedStyles['opacity'].previous;

        requestAnimationFrame(() => this.render());
    }
}

/* index 1 */
const lscroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    direction: 'horizontal'
});

// let's rotate the elements when scrolling.
const elems = [...document.querySelectorAll('.gallery__item')]
const rotationsArr = Array.from({length: elems.length}, () => randomNumber(-30,30));
const translationArr = Array.from({length: elems.length}, () => randomNumber(-100,100));
lscroll.on('scroll', (obj) => {
    for (const key of Object.keys(obj.currentElements)) {
        const el = obj.currentElements[key].el;
        const idx = elems.indexOf(el);
        if ( obj.currentElements[key].el.classList.contains('gallery__item') ) {
            let progress = obj.currentElements[key].progress;
            //const scaleVal = progress < 0.5 ? clamp(map(progress,0,0.5,1.2,0.5),0.5,1.2) : clamp(map(progress,0.5,1,0.5,1.2),0.5,1.2);
            const rotationVal = progress > 0.6 ? clamp(map(progress,0.6,1,0,rotationsArr[idx]), Math.min(0,rotationsArr[idx]), Math.max(0,rotationsArr[idx])) : 0;
            const translationVal = progress > 0.6 ? clamp(map(progress,0.6,1,0,translationArr[idx]), Math.min(0,translationArr[idx]), Math.max(0,translationArr[idx])) : 0;
            //obj.currentElements[key].el.style.transform = `scale(${scaleVal})`
            obj.currentElements[key].el.style.transform = `translateY(${translationVal}%) rotate(${rotationVal}deg)`
        }
    }
});
lscroll.update();

// Preload images and fonts
Promise.all([preloadImages('.gallery__item-imginner'), preloadFonts('vxy2fer')]).then(() => {
    // Remove loader (loading class)
    document.body.classList.remove('loading');

    // Initialize custom cursor
    const cursor = new Cursor(document.querySelector('.cursor'));

    // Mouse effects on all links and others
    [...document.querySelectorAll('a,.gallery__item-img,.gallery__item-number')].forEach(link => {
        link.addEventListener('mouseenter', () => cursor.enter());
        link.addEventListener('mouseleave', () => cursor.leave());
    });
});
