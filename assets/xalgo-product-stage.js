class XalgoProductStage extends HTMLElement {
  connectedCallback() {
    this.image = this.querySelector('.xalgo-product-stage__image');
    this.imageMap = this.parseImageMap();
    this.abortController = new AbortController();

    // Primary: listen for the theme's variant:update custom event on document.
    // variant-picker dispatches this asynchronously after fetching the new variant.
    document.addEventListener('variant:update', this.handleVariantUpdate, {
      signal: this.abortController.signal,
    });

    // Backup: listen for the native change event directly on the variant picker.
    // This fires synchronously and lets us switch the image immediately.
    document.addEventListener('change', this.handleChange, {
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
    } catch {
      return {};
    }
  }

  handleChange = (event) => {
    const target = event.target;
    const picker = target.closest?.('variant-picker');
    if (!picker) return;

    let optionValueId = null;

    if (target instanceof HTMLInputElement && target.type === 'radio') {
      optionValueId = target.dataset.optionValueId;
    } else if (target instanceof HTMLSelectElement) {
      const opt = target.options[target.selectedIndex];
      optionValueId = opt?.dataset?.optionValueId;
    }

    if (optionValueId) {
      this.switchImageByOptionValueId(optionValueId);
    }
  };

  handleVariantUpdate = (event) => {
    const detail = event.detail || {};
    const resource = detail.resource;
    const sourceId = detail.sourceId;

    if (!resource) return;

    const mediaSrc =
      resource.featured_media?.preview_image?.src ||
      resource.featured_image;

    if (mediaSrc) {
      const fullSrc = mediaSrc.startsWith('//')
        ? `${window.location.protocol}${mediaSrc}`
        : mediaSrc;
      this.updateImage({ src: fullSrc, alt: resource.name || '' });
      if (sourceId && this.image) {
        this.image.dataset.lastOptionId = sourceId;
      }
      return;
    }

    if (sourceId) {
      this.switchImageByOptionValueId(sourceId);
    }
  };

  switchImageByOptionValueId(optionValueId) {
    if (this.image?.dataset?.lastOptionId === optionValueId) return;

    const image = this.imageMap[optionValueId];
    if (!image?.src) return;

    if (this.image) {
      this.image.dataset.lastOptionId = optionValueId;
    }
    this.updateImage(image);
  }

  updateImage(nextImage) {
    if (!this.image || !nextImage?.src) return;

    const applyImage = () => {
      this.dataset.changing = 'true';
      this.image.removeAttribute('srcset');
      this.image.removeAttribute('sizes');
      this.image.setAttribute('loading', 'eager');
      this.image.src = nextImage.src;
      if (nextImage.alt) this.image.alt = nextImage.alt;

      requestAnimationFrame(() => {
        this.dataset.changing = 'false';
      });
    };

    const preload = new Image();
    preload.onload = () => window.setTimeout(applyImage, 120);
    preload.onerror = () => applyImage();
    preload.src = nextImage.src;

    window.setTimeout(() => {
      if (this.image && !this.image.src.includes(nextImage.src.split('&width=')[0])) {
        applyImage();
      }
    }, 800);
  }
}

if (!customElements.get('xalgo-product-stage')) {
  customElements.define('xalgo-product-stage', XalgoProductStage);
}
