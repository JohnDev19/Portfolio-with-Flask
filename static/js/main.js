const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // close mobile menu when clicking a link
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }

            // skooth scroll - target
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// intersection observer - scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

const tables = document.querySelectorAll('table');
tables.forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('table-responsive');
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
});

// scroll - top button
const scrollButton = document.createElement('button');
scrollButton.classList.add('scroll-top');
scrollButton.innerHTML = '<i class="bi bi-arrow-up"></i>';
document.body.appendChild(scrollButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('show');
    } else {
        scrollButton.classList.remove('show');
    }
});

scrollButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// auto-hide and close button
document.querySelectorAll('.alert').forEach(alert => {
    // close button if not present
    if (!alert.querySelector('.alert-close')) {
        const closeButton = document.createElement('button');
        closeButton.classList.add('alert-close');
        closeButton.setAttribute('aria-label', 'Close');
        alert.appendChild(closeButton);
    }

    // close button click handler
    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            alert.remove();
        }, 300);
    });

    // auto-hide after 5 seconds
    setTimeout(() => {
        if (alert && alert.parentNode) {
            alert.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }
    }, 5000);
});

document.querySelectorAll('.skill-progress').forEach(progress => {
    const value = progress.getAttribute('data-value');
    progress.style.width = '0%';

    setTimeout(() => {
        progress.style.width = value + '%';
    }, 500);
});