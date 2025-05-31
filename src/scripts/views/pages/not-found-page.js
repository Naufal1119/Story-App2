class NotFoundPage {
  async render() {
    return `
      <div class="page-not-found">
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <p><a href="#/">Go to Homepage</a></p>
      </div>
    `;
  }

  async afterRender() {
    // Any post-rendering logic can go here
    console.log('Not Found Page rendered.');
  }
}

export default NotFoundPage; 