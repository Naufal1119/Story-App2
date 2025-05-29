const CameraUtil = {
  _stream: null,
  _cameraVideoElement: null,
  _cameraPreviewElement: null,
  _cameraButtonsElement: null,
  _captureButtonElement: null,
  _retakeButtonElement: null,
  _closeCameraButtonElement: null,
  _photoPreviewElement: null,
  _photoInput: null,

  init(videoElementId, previewElementId, buttonsElementSelector, captureButtonId, retakeButtonId, closeButtonId, photoPreviewId, photoInputId) {
    this._cameraVideoElement = document.getElementById(videoElementId);
    this._cameraPreviewElement = document.getElementById(previewElementId);
    this._cameraButtonsElement = document.querySelector(buttonsElementSelector);
    this._captureButtonElement = document.getElementById(captureButtonId);
    this._retakeButtonElement = document.getElementById(retakeButtonId);
    this._closeCameraButtonElement = document.getElementById(closeButtonId);
    this._photoPreviewElement = document.getElementById(photoPreviewId);
    this._photoInput = document.getElementById(photoInputId);

    // Add event listeners (delegated handling might be better in View, but for utility encapsulation)
    if (this._captureButtonElement) this._captureButtonElement.addEventListener('click', () => this.capturePhoto());
    if (this._retakeButtonElement) this._retakeButtonElement.addEventListener('click', () => this.startCamera());
    if (this._closeCameraButtonElement) this._closeCameraButtonElement.addEventListener('click', () => this.stopCamera());
  },

  async startCamera() {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      if (this._cameraVideoElement) {
          this._cameraVideoElement.srcObject = this._stream;
          await this._cameraVideoElement.play();
          if (this._cameraPreviewElement) this._cameraPreviewElement.style.display = 'flex';
          if (this._cameraButtonsElement) this._cameraButtonsElement.style.display = 'flex';
          if (this._captureButtonElement) this._captureButtonElement.style.display = 'block';
          if (this._retakeButtonElement) this._retakeButtonElement.style.display = 'none';
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please make sure you have granted camera permissions.');
      this.stopCamera(); // Ensure elements are hidden on error
    }
  },

  stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => {
        track.stop();
      });
      this._stream = null;
    }
    if (this._cameraVideoElement && this._cameraVideoElement.srcObject) {
      this._cameraVideoElement.srcObject = null;
    }
    if (this._cameraPreviewElement) this._cameraPreviewElement.style.display = 'none';
    if (this._cameraButtonsElement) this._cameraButtonsElement.style.display = 'none';
  },

  capturePhoto() {
    if (!this._cameraVideoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = this._cameraVideoElement.videoWidth;
    canvas.height = this._cameraVideoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(this._cameraVideoElement, 0, 0, canvas.width, canvas.height);

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/jpeg', 0.8);
    img.style.maxWidth = '100%';
    img.style.maxHeight = '400px';
    img.style.objectFit = 'contain';

    if (this._photoPreviewElement) {
        this._photoPreviewElement.innerHTML = '';
        this._photoPreviewElement.appendChild(img);
    }

    // Convert base64 to File object and set to file input
    canvas.toBlob((blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      if (this._photoInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          this._photoInput.files = dataTransfer.files;
      }
    }, 'image/jpeg', 0.8);

    if (this._captureButtonElement) this._captureButtonElement.style.display = 'none';
    if (this._retakeButtonElement) this._retakeButtonElement.style.display = 'block';
    
    this.stopCamera(); // Stop stream after capturing
  },

  clearPhotoPreview() {
      if (this._photoPreviewElement) {
          this._photoPreviewElement.innerHTML = '';
      }
       if (this._photoInput) {
          this._photoInput.value = null; // Clear file input
      }
  }
};

export default CameraUtil; 