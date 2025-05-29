const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2rCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

import StoryModel from '../models/story-model';

const storyModel = new StoryModel();

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const subscribeUser = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported.');
    return;
  }

  if (!('PushManager' in window)) {
    console.warn('Push notifications are not supported.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      console.log('Existing subscription found.');
      // Optionally send the existing subscription to your backend if not already done
      // await sendSubscriptionToServer(existingSubscription);
      return existingSubscription;
    }

    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const options = {
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    };

    const subscription = await registration.pushManager.subscribe(options);
    console.log('New subscription created:', subscription);

    // Send the new subscription to your backend
    await storyModel.subscribeNotification(subscription);

    return subscription;

  } catch (error) {
    console.error('Failed to subscribe the user:', error);
    throw error;
  }
};

const unsubscribeUser = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('User unsubscribed.');

      // Inform your backend about the unsubscription
      await storyModel.unsubscribeNotification(subscription);
    } else {
      console.log('No active subscription found.');
    }
  } catch (error) {
    console.error('Failed to unsubscribe the user:', error);
  }
};


export { subscribeUser, unsubscribeUser, urlBase64ToUint8Array }; 