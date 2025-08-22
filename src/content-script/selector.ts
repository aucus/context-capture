import { Region } from '../shared/types';
import { EXTENSION_CONSTANTS } from '../shared/constants';

export class RegionSelector {
  private isSelecting = false;
  private startX = 0;
  private startY = 0;
  private overlay: HTMLDivElement | null = null;
  private selectionBox: HTMLDivElement | null = null;
  private captureButton: HTMLButtonElement | null = null;
  private onCapture: ((region: Region) => void) | null = null;

  constructor() {
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  public start(onCapture: (region: Region) => void): void {
    this.onCapture = onCapture;
    this.createOverlay();
    this.addEventListeners();
  }

  public stop(): void {
    this.removeEventListeners();
    this.removeOverlay();
    this.isSelecting = false;
    this.onCapture = null;
  }

  private createOverlay(): void {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.1);
      z-index: 999999;
      cursor: crosshair;
      user-select: none;
    `;

    // Create selection box
    this.selectionBox = document.createElement('div');
    this.selectionBox.style.cssText = `
      position: absolute;
      border: 2px solid #007AFF;
      background: rgba(0, 122, 255, 0.1);
      display: none;
      pointer-events: none;
    `;

    // Create capture button
    this.captureButton = document.createElement('button');
    this.captureButton.textContent = 'Capture';
    this.captureButton.style.cssText = `
      position: absolute;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: none;
      z-index: 1000000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;

    this.captureButton.addEventListener('click', () => {
      if (this.selectionBox && this.onCapture) {
        const rect = this.selectionBox.getBoundingClientRect();
        const region: Region = {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
        this.onCapture(region);
      }
    });

    this.overlay.appendChild(this.selectionBox);
    this.overlay.appendChild(this.captureButton);
    document.body.appendChild(this.overlay);
  }

  private removeOverlay(): void {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
      this.selectionBox = null;
      this.captureButton = null;
    }
  }

  private addEventListeners(): void {
    if (this.overlay) {
      this.overlay.addEventListener('mousedown', this.handleMouseDown);
      this.overlay.addEventListener('mousemove', this.handleMouseMove);
      this.overlay.addEventListener('mouseup', this.handleMouseUp);
    }
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private removeEventListeners(): void {
    if (this.overlay) {
      this.overlay.removeEventListener('mousedown', this.handleMouseDown);
      this.overlay.removeEventListener('mousemove', this.handleMouseMove);
      this.overlay.removeEventListener('mouseup', this.handleMouseUp);
    }
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Only left mouse button
    
    this.isSelecting = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    
    if (this.selectionBox) {
      this.selectionBox.style.display = 'block';
      this.selectionBox.style.left = `${this.startX}px`;
      this.selectionBox.style.top = `${this.startY}px`;
      this.selectionBox.style.width = '0px';
      this.selectionBox.style.height = '0px';
    }
    
    if (this.captureButton) {
      this.captureButton.style.display = 'none';
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isSelecting || !this.selectionBox) return;

    const currentX = event.clientX;
    const currentY = event.clientY;

    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);

    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this.isSelecting) return;

    this.isSelecting = false;
    const width = Math.abs(event.clientX - this.startX);
    const height = Math.abs(event.clientY - this.startY);

    // Check minimum selection size
    if (width >= EXTENSION_CONSTANTS.MIN_SELECTION_SIZE && 
        height >= EXTENSION_CONSTANTS.MIN_SELECTION_SIZE) {
      this.showCaptureButton();
    } else {
      this.hideSelection();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.stop();
    }
  }

  private showCaptureButton(): void {
    if (this.captureButton && this.selectionBox) {
      const rect = this.selectionBox.getBoundingClientRect();
      this.captureButton.style.display = 'block';
      this.captureButton.style.left = `${rect.right + 10}px`;
      this.captureButton.style.top = `${rect.top}px`;
    }
  }

  private hideSelection(): void {
    if (this.selectionBox) {
      this.selectionBox.style.display = 'none';
    }
    if (this.captureButton) {
      this.captureButton.style.display = 'none';
    }
  }
}
