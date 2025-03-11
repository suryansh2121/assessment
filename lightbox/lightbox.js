
const images = document.querySelectorAll('.product-image');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const closeBtn = document.querySelector('.close');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;


images.forEach((image, index) => {
    image.addEventListener('click', () => {
        currentIndex = index;
        openLightbox();
    });
});

function openLightbox() {
    lightboxImage.src = images[currentIndex].src;
    lightboxImage.alt = images[currentIndex].alt;
    lightbox.classList.add('active');
   
    lightbox.setAttribute('tabindex', '0');
    lightbox.focus();
}


function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.removeAttribute('tabindex');
}

closeBtn.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
    lightboxImage.src = images[currentIndex].src;
    lightboxImage.alt = images[currentIndex].alt;
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
    lightboxImage.src = images[currentIndex].src;
    lightboxImage.alt = images[currentIndex].alt;
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});


lightbox.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            prevBtn.click();
            break;
        case 'ArrowRight':
            nextBtn.click();
            break;
        case 'Escape':
            closeLightbox();
            break;
    }
});