import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Firebase configuration for QLife (generated from google-services.json).
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError('Web is not configured for Firebase.');
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      default:
        throw UnsupportedError(
          'Firebase is only configured for Android in this project.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBxw2BlFpQ9-nMbr0rBd2SBBTeWVfx_d88',
    appId: '1:146936051759:android:5e1c5fd53faa2a5419eeda',
    messagingSenderId: '146936051759',
    projectId: 'qlife-50bf4',
    storageBucket: 'qlife-50bf4.firebasestorage.app',
  );
}
