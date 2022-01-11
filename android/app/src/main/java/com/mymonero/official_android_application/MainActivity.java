package com.mysafex.official_android_application;

import android.os.Bundle;

import com.bkon.capacitor.fileselector.FileSelector;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.whitestein.securestorage.SecureStoragePlugin;

import java.util.ArrayList;

import de.golbros.capacitorqrscanner.CapacitorQRScanner;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(SecureStoragePlugin.class);
      add(FileSelector.class);
      add(CapacitorQRScanner.class);
    }});
  }
}
