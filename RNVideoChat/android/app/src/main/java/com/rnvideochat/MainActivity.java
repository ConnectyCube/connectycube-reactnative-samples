package com.rnvideochat;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.ReactActivity;

//test
import io.wazo.callkeep.RNCallKeepModule;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    Intent intent = new Intent(this, AppMainActivity.class);
    startActivity(intent);
    finish();
  }

  /// test
  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    switch (requestCode) {
      case RNCallKeepModule.REQUEST_READ_PHONE_STATE:
        RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults);
        break;
    }
  }
    
}
