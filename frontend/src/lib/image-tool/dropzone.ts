import type { ImageToolOptions } from './types';

export class ImageToolDropzone {
    private element: HTMLElement;
    private options: ImageToolOptions;
    private onFileSelected: (file: File) => void;
    private previewContainer: HTMLElement | null = null;
    private hasImage: boolean = false;
    private isEditorOpen: boolean = false;
    private clickHandler: ((e: Event) => void) | null = null;
    private fileInput: HTMLInputElement | null = null;

    constructor(
        element: HTMLElement,
        options: ImageToolOptions,
        onFileSelected: (file: File) => void
    ) {
        this.element = element;
        this.options = options;
        this.onFileSelected = onFileSelected;
        this.init();
    }

    private init(): void {
        this.element.classList.add('it-dropzone');
        this.render();
        this.setupEventListeners();
    }

    private render(): void {
        // Clear existing content first
        this.element.innerHTML = '';

        // Create content container
        const contentHtml = `
            <div class="it-dropzone-content">
                <div class="it-dropzone-icon">
                    <svg class="fill-transparent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <p class="it-dropzone-text">${this.options.placeholder}</p>
                <button type="button" class="it-dropzone-btn">${this.options.buttonText}</button>
                <span class="it-dropzone-formats">JPG, PNG, WebP, GIF</span>
            </div>
            <div class="it-dropzone-preview it-hidden">
                <img src="" alt="Preview" class="it-preview-img">
                <div class="it-preview-overlay">
                    <button type="button" class="it-preview-edit" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button type="button" class="it-preview-remove" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        this.element.innerHTML = contentHtml;

        this.previewContainer = this.element.querySelector('.it-dropzone-preview');
    }

    private setupEventListeners(): void {
        // Click handler for the dropzone
        this.clickHandler = (e: Event) => {
            const target = e.target as HTMLElement;

            // Block all clicks while editor is open
            if (this.isEditorOpen) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // Handle remove button
            if (target.closest('.it-preview-remove')) {
                e.preventDefault();
                e.stopPropagation();
                this.clear();
                return;
            }

            // Handle edit button
            if (target.closest('.it-preview-edit')) {
                e.preventDefault();
                e.stopPropagation();
                this.openFilePicker();
                return;
            }

            // Don't open file picker if we already have an image
            if (this.hasImage) {
                return;
            }

            // Open file picker
            e.preventDefault();
            this.openFilePicker();
        };

        this.element.addEventListener('click', this.clickHandler);

        // Drag events
        this.element.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.element.classList.add('it-dropzone-dragover');
        });

        this.element.addEventListener('dragleave', () => {
            this.element.classList.remove('it-dropzone-dragover');
        });

        this.element.addEventListener('drop', (e) => {
            e.preventDefault();
            this.element.classList.remove('it-dropzone-dragover');

            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    this.onFileSelected(file);
                }
            }
        });
    }

    private openFilePicker(): void {
        // Prevent opening if editor is open
        if (this.isEditorOpen) return;
        
        // Prevent opening if editor is open
        if (this.isEditorOpen) return;
        
        if (!this.fileInput) {
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.accept = 'image/*';
            this.fileInput.style.display = 'none';

            this.fileInput.addEventListener('change', (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files && files.length > 0) {
                    this.onFileSelected(files[0]);
                }
                // Reset value so the same file can be selected again if needed
                if (this.fileInput) {
                    this.fileInput.value = '';
                }
            });
        }

        // Trigger file picker
        this.fileInput?.click();
    }

    lockForEditor(): void {
        this.isEditorOpen = true;
    }

    unlockFromEditor(): void {
        this.isEditorOpen = false;
    }

    setPreview(dataUrl: string): void {
        if (!this.previewContainer) return;

        const content = this.element.querySelector('.it-dropzone-content');
        const previewImg = this.previewContainer.querySelector<HTMLImageElement>('.it-preview-img');

        if (content) content.classList.add('it-hidden');
        this.previewContainer.classList.remove('it-hidden');

        if (previewImg) {
            previewImg.src = dataUrl;
        }

        this.hasImage = true;
        this.element.classList.add('it-dropzone-has-image');
    }

    clear(): void {
        if (!this.previewContainer) return;

        const content = this.element.querySelector('.it-dropzone-content');
        const previewImg = this.previewContainer.querySelector<HTMLImageElement>('.it-preview-img');

        if (content) content.classList.remove('it-hidden');
        this.previewContainer.classList.add('it-hidden');

        if (previewImg) {
            previewImg.src = '';
        }

        this.hasImage = false;
        this.element.classList.remove('it-dropzone-has-image');
    }

    destroy(): void {
        // Remove event listeners
        if (this.clickHandler) {
            this.element.removeEventListener('click', this.clickHandler);
        }
        // Clear element
        this.element.innerHTML = '';
        this.element.classList.remove('it-dropzone', 'it-dropzone-has-image', 'it-dropzone-dragover');
        
        // Clear references
        this.previewContainer = null;
        this.clickHandler = null;
    }
}
