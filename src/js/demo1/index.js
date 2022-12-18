// import {preloadImages, preloadFonts, clamp, map, randomNumber} from '../utils';
// import Cursor from '../cursor';
// import LocomotiveScroll from 'locomotive-scroll';

//utils, cursor 다 js파일에 박아버리자 or require를 쓰자
const utils = require('../utils');
const cursors = require('../cursor');
const locomotive_scroll = require('locomotive-scroll');

const lscroll = new locomotive_scroll.default({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    direction: 'horizontal'
});

// let's rotate the elements when scrolling.
const elems = [...document.querySelectorAll('.gallery__item')]
const rotationsArr = Array.from({length: elems.length}, () => utils.randomNumber(-30,30));
const translationArr = Array.from({length: elems.length}, () => utils.randomNumber(-100,100));
lscroll.on('scroll', (obj) => {
    for (const key of Object.keys(obj.currentElements)) {
        const el = obj.currentElements[key].el;
        const idx = elems.indexOf(el);
        if ( obj.currentElements[key].el.classList.contains('gallery__item') ) {
            let progress = obj.currentElements[key].progress;
            //const scaleVal = progress < 0.5 ? utils.clamp(map(progress,0,0.5,1.2,0.5),0.5,1.2) : utils.clamp(map(progress,0.5,1,0.5,1.2),0.5,1.2);
            const rotationVal = progress > 0.6 ? utils.clamp(utils.map(progress,0.6,1,0,rotationsArr[idx]), Math.min(0,rotationsArr[idx]), Math.max(0,rotationsArr[idx])) : 0;
            const translationVal = progress > 0.6 ? utils.clamp(utils.map(progress,0.6,1,0,translationArr[idx]), Math.min(0,translationArr[idx]), Math.max(0,translationArr[idx])) : 0;
            //obj.currentElements[key].el.style.transform = `scale(${scaleVal})`
            obj.currentElements[key].el.style.transform = `translateY(${translationVal}%) rotate(${rotationVal}deg)`
        }
    }
});
lscroll.update();

// Preload images and fonts
Promise.all([utils.preloadImages('.gallery__item-imginner'), utils.preloadFonts('vxy2fer')]).then(() => {
    // Remove loader (loading class)
    document.body.classList.remove('loading');

    // Initialize custom cursor
    const cursor = new cursors.default(document.querySelector('.cursor'));

    // Mouse effects on all links and others
    [...document.querySelectorAll('a,.gallery__item-img,.gallery__item-number')].forEach(link => {
        link.addEventListener('mouseenter', () => cursor.enter());
        link.addEventListener('mouseleave', () => cursor.leave());
    });
});