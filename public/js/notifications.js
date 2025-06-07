/**
 * Notification system for providing user feedback
 */
class NotificationSystem {
  constructor() {
    this.container = this.createContainer();
    document.body.appendChild(this.container);
  }

  /**
   * Create the notification container
   * @returns {HTMLElement} The notification container element
   */
  createContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    return container;
  }

  /**
   * Show a notification
   * @param {string} message - The notification message
   * @param {string} type - The notification type (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds before auto-dismissal
   */
  show(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.backgroundColor = this.getBackgroundColor(type);
    notification.style.color = '#fff';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.minWidth = '300px';
    notification.style.maxWidth = '400px';
    notification.style.transition = 'all 0.3s ease';
    notification.style.transform = 'translateX(120%)';
    notification.style.opacity = '0';

    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#fff';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '10px';
    closeBtn.addEventListener('click', () => this.dismiss(notification));
    notification.appendChild(closeBtn);

    // Add to container
    this.container.appendChild(notification);

    // Trigger animation to show
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);

    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(notification);
      }, duration);
    }

    return notification;
  }

  /**
   * Dismiss a notification
   * @param {HTMLElement} notification - The notification element to dismiss
   */
  dismiss(notification) {
    notification.style.transform = 'translateX(120%)';
    notification.style.opacity = '0';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Get background color based on notification type
   * @param {string} type - The notification type
   * @returns {string} The background color
   */
  getBackgroundColor(type) {
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#17a2b8';
    }
  }

  /**
   * Show a success notification
   * @param {string} message - The success message
   * @param {number} duration - Duration in milliseconds before auto-dismissal
   */
  showSuccess(message, duration = 5000) {
    console.log('Notificação de sucesso:', message);
    return this.show(message, 'success', duration);
  }

  /**
   * Show an error notification
   * @param {string} message - The error message
   * @param {number} duration - Duration in milliseconds before auto-dismissal
   */
  showError(message, duration = 8000) {
    console.error('Notificação de erro:', message);
    return this.show(message, 'error', duration);
  }

  /**
   * Show an info notification
   * @param {string} message - The info message
   * @param {number} duration - Duration in milliseconds before auto-dismissal
   */
  showInfo(message, duration = 5000) {
    console.log('Notificação de informação:', message);
    return this.show(message, 'info', duration);
  }

  /**
   * Show a warning notification
   * @param {string} message - The warning message
   * @param {number} duration - Duration in milliseconds before auto-dismissal
   */
  showWarning(message, duration = 6000) {
    console.warn('Notificação de aviso:', message);
    return this.show(message, 'warning', duration);
  }
}

// Create a singleton instance
const notifications = new NotificationSystem();
