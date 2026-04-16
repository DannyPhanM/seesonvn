if (!customElements.get('sticky-bar')) {
  customElements.define('sticky-bar', class StickyBar extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.sectionId = this.dataset.sectionId;
      this.mainProductForm = document.querySelector(`#product-form-${this.sectionId}`);
      
      if (!this.mainProductForm) {
          // Fallback if ID doesn't match perfectly
          this.mainProductForm = document.querySelector(`.product-form-buttons`);
      }

      this.initObserver();
    }

    initObserver() {
      if (!this.mainProductForm) return;

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Show when main form is NOT intersecting and we have scrolled past it
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            this.classList.add('is-visible');
          } else {
            this.classList.remove('is-visible');
          }
        });
      }, {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px'
      });

      this.observer.observe(this.mainProductForm);
    }

    disconnectedCallback() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  });
}
