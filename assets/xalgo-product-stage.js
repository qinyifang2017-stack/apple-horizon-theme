class XalgoProductStage extends HTMLElement {
  connectedCallback() {
    this.image = this.querySelector('[data-xalgo-stage-image]');
    this.imageMap = this.parseImageMap();
    this.abortController = new AbortController();

    const productSection = this.closest('.shopify-section') || document;
    productSection.addEventListener('change', this.handleChange, {
      signal: this.abortController.signal,
    });
  }

  disconnectedCallback() {
    this.abortController?.abort();
  }

  parseImageMap() {
    const script = this.querySelector('[data-xalgo-stage-images]');
    if (!script?.textContent) return {};

    try {
      return JSON.parse(script.textContent);
    } catch (error) {
      console.warn('Unable to parse xAlgo product stage images', error);
      return {};
    }
  }

  handleChange = (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.type !== 'radio') return;
    if (!input.closest('variant-picker')) return;

    const optionValueId = input.dataset.optionValueId;
    if (!optionValueId) return;

    const image = this.imageMap[optionValueId] || this.getImageFromSwatch(input);
    if (!image?.src) return;

    this.updateImage(image);
  };

  getImageFromSwatch(input) {
    const swatch = input.parentElement?.querySelector('.swatch');
    const background = swatch ? getComputedStyle(swatch).getPropertyValue('--swatch-background') : '';
    const match = background.match(/url\(["']?(.*?)["']?\)/);
    if (!match?.[1]) return null;

    const src = match[1].startsWith('//') ? `${window.location.protocol}${match[1]}` : match[1];
    return {
      src,
      srcset: '',
      alt: input.getAttribute('aria-label') || input.value || '',
    };
  }

  updateImage(nextImage) {
    if (!this.image || this.image.currentSrc === nextImage.src || this.image.src === nextImage.src) return;

    const preload = new Image();
    preload.onload = () => {
      this.dataset.changing = 'true';

      window.setTimeout(() => {
        this.image.src = nextImage.src;
        this.image.removeAttribute('srcset');
        if (nextImage.alt) this.image.alt = nextImage.alt;

        requestAnimationFrame(() => {
          this.dataset.changing = 'false';
        });
      }, 120);
    };
    preload.src = nextImage.src;
  }
}

if (!customElements.get('xalgo-product-stage')) {
  customElements.define('xalgo-product-stage', XalgoProductStage);
}
