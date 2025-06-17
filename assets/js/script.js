const formSelect = document.getElementById('interest');
const dateInput = document.getElementById('birthdate');
const ciInput = document.getElementById('CI');
//arrow function

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');


    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });


    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }else{
                entry.target.classList.remove('aos-animate');
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });

 flatpickr("#birthdate", {
    dateFormat: "d/m/Y"
  });
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
 
            showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
            
       
            contactForm.reset();
            
   
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            console.log('Form data:', data);
        }, 2000);
    });


    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 1}s`;
    });

    const stats = document.querySelectorAll('.stat-number');
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target === 100) {
                element.textContent = Math.floor(current) + '%';
            } else {
                element.textContent = Math.floor(current) + (target >= 500 ? '+' : '');
            }
        }, 20);
    };

   const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const stat = entry.target;
        let text = stat.textContent;
        let number = parseInt(text);

        if (text.includes('%')) {
            number = 100;
        }

        if (text.includes('+')) {
            number = parseInt(text.replace('+', ''));
        }

        animateCounter(stat, number);
        statsObserver.unobserve(stat);
    });
});

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });


    const demoMenuItems = document.querySelectorAll('.demo-menu-item');
    demoMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            demoMenuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
         
            const demoMain = document.querySelector('.demo-main');
            demoMain.style.opacity = '0.5';
            setTimeout(() => {
                demoMain.style.opacity = '1';
            }, 200);
        });
    });


    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('testimonial-card');
    
    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.opacity = i === index ? '1' : '0.7';
            testimonial.style.transform = i === index ? 'scale(1)' : 'scale(0.95)';
        });
    }

   
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);

    if (testimonials.length > 0) {
        showTestimonial(0);
    }

    // Parallax para hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroHeight = hero.offsetHeight;
        
        if (scrolled < heroHeight) {
            const rate = scrolled * -1;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Validacion del formulario
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });

    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        
    
        clearError(e);
        
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, 'Este campo es obligatorio');
            return false;
        }
        
        if (field.type === 'email' && value && !isValidEmail(value)) {
            showFieldError(field, 'Ingresa un email válido');
            return false;
        }
        
        if (field.type === 'tel' && value && !isValidPhone(value)) {
            showFieldError(field, 'Ingresa un teléfono válido');
            return false;
        }
        
        return true;
    }

    function clearError(e) {
        const field = e.target;
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('error');
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorElement);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-$$$$]{8,}$/;
        return phoneRegex.test(phone);
    }
    ciInput.addEventListener('keydown', (e) => {
    
        const allowedKeys = [
            'Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', '/',
        ];
        const isNumber = /^[0-9]$/.test(e.key);
    
        if (!isNumber && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    })
    ciInput.addEventListener('input', () => {
    let value = ciInput.value.replace(/\D/g, ''); 
    if (value.length > 8) value = value.slice(0, 8); 

    let formated = value;
    if (value.length > 1 && value.length <= 8) {
        formated = value.slice(0, value.length - 1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + '-' + value.slice(-1);
    }

    ciInput.value = formatted;
});
    dateInput.removeAttribute('readonly');
    dateInput.addEventListener('keydown', (e) => {
    const allowedKeys = [
        'Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', '/',
    ];
    const isNumber = /^[0-9]$/.test(e.key);

    if (!isNumber && !allowedKeys.includes(e.key)) {
        e.preventDefault();
    }
    });
    dateInput.addEventListener('input', () => {
        const dateValue = dateInput.value;
          let parts = dateValue.split('/');
        console.log('Fecha seleccionada:', dateValue);
        if (dateValue) {
            if(dateValue) {
            if (dateValue.length === 2) {
                if (dateInput.value <= 31) {
                    dateInput.value = `${dateValue}/`;
                } else {
                    showNotification('Fecha inválida. Por favor, verifica el formato.', 'error');
                     console.log('Fecha inválida2:', dateValue);
                    dateInput.value = '';
                }
            }
            if (dateValue.length === 5) {
                parts = dateValue.split('/');
                if (parseInt(parts[1], 10) <= 12 && parts[1].length === 2) {
                    dateInput.value = `${dateValue}/`;
                    
                } else {
                    showNotification('Fecha inválida. Por favor, verifica el formato.', 'error');
                    console.log('Mes inválida:', parts[1].length);
                    dateInput.value = '';
                }
            }
            if (dateValue.length === 10) {
                parts = dateValue.split('/');
                console.log('Partes de la fecha:', parts);
                if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    const year = parseInt(parts[2], 10);
                    if (day > 31 || month > 12 || year < 1900 || year > new Date().getFullYear() || parts[2].length > new Date().getFullYear().length) {
                        showNotification('Fecha inválida. Por favor, verifica el formato.', 'error');
                        console.log('Fecha inválida:', dateValue);
                        dateInput.value = '';
                    }
                    
                }
               
            }
            if(dateValue.length > 10) {
                showNotification('Fecha inválida. Por favor, verifica el formato.', 'error');
                dateInput.value = '';
            }
        }
        }
    });
    document.body.classList.add('loading');
});
//    <option value="">¿Qué te interesa?</option>
//                            <option value="cooperativa">Unirme a la cooperativa</option>
//                            <option value="software">Software de gestión</option>
//                            <option value="ambos">Ambos servicios</option>
//                            <option value="info">Solo información</option>
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    /*
    if(type === 'success') {
        return 'check-circle';
    }else if(type === 'info') {
        return 'info-circle';
    }else{
        return 'fa-spinner fa-spin';}
    */
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> 

            
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    // estilos de la notificacion
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // agregar animaciones styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `;
    document.head.appendChild(style);
    

    document.body.appendChild(notification);
 
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

